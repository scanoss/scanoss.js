/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import EventEmitter from 'eventemitter3';
import fetch, { Response } from 'node-fetch';
import PQueue from 'p-queue';

import { ScannerEvents } from '../ScannerTypes';
import { DispatcherResponse } from './DispatcherResponse';
import { ScannerCfg } from '../ScannerCfg';
import { GlobalControllerAborter } from './GlobalControllerAborter';
import { DispatchableItem } from './DispatchableItem';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';
import { Utils } from '../../Utils/Utils';

const MAX_CONCURRENT_REQUEST = 30;

export class Dispatcher extends EventEmitter {
  private scannerCfg: ScannerCfg;

  private pQueue;

  private globalAbortController: GlobalControllerAborter;

  private queueMaxLimitReached: boolean;

  private queueMinLimitReached: boolean;

  private recoverableErrors;

  private proxyAgent: HttpsProxyAgent | HttpProxyAgent;

  private caCert: string;

  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.scannerCfg = scannerCfg;
    if (this.scannerCfg.CONCURRENCY_LIMIT > MAX_CONCURRENT_REQUEST)
      this.scannerCfg.CONCURRENCY_LIMIT = MAX_CONCURRENT_REQUEST;

    this.init();
  }

  init() {
    //Loads proxy from SDK config, if not, loads from env variables, if not, leave empty
    this.proxyAgent = null;
    this.caCert = null;

    const proxyAddr =
      this.scannerCfg.PROXY ||
      process.env.https_proxy ||
      process.env.HTTPS_PROXY ||
      process.env.http_proxy ||
      process.env.HTTP_PROXY ||
      null;
    const caCertPath =
      this.scannerCfg.CA_CERT || process.env.NODE_EXTRA_CA_CERTS;

    if (caCertPath) Utils.loadCaCertFromFile(caCertPath);
    else if (this.scannerCfg.IGNORE_CERT_ERRORS || proxyAddr)
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    if (proxyAddr) {
      if (this.scannerCfg.API_URL.trim().startsWith('https'))
        this.proxyAgent = new HttpsProxyAgent(proxyAddr);
      else this.proxyAgent = new HttpProxyAgent(proxyAddr);
    }

    this.pQueue = new PQueue({
      concurrency: this.scannerCfg.CONCURRENCY_LIMIT,
    });
    this.pQueue.clear();

    this.pQueue.on('idle', () => {
      this.emit(ScannerEvents.DISPATCHER_FINISHED);
    });

    this.pQueue.on('next', () => {
      if (
        this.pQueue.size + this.pQueue.pending <
          this.scannerCfg.DISPATCHER_QUEUE_SIZE_MIN_LIMIT &&
        !this.queueMinLimitReached
      ) {
        this.emit(ScannerEvents.DISPATCHER_QUEUE_SIZE_MIN_LIMIT);
        this.queueMinLimitReached = true;
        this.queueMaxLimitReached = false;
      }
    });

    this.queueMaxLimitReached = false;
    this.queueMinLimitReached = true;

    this.globalAbortController = new GlobalControllerAborter();

    this.recoverableErrors = new Set();
    this.recoverableErrors.add('ECONNRESET');
    this.recoverableErrors.add('TIMEOUT');
  }

  stop() {
    this.pQueue.clear();
    this.pQueue.pause();
    this.globalAbortController.abortAll();
  }

  public dispatchItem(item: DispatchableItem): void {
    this.pQueue.add(() => this.dispatch(item));

    if (
      this.pQueue.size + this.pQueue.pending >=
        this.scannerCfg.DISPATCHER_QUEUE_SIZE_MAX_LIMIT &&
      !this.queueMaxLimitReached
    ) {
      this.emit(ScannerEvents.DISPATCHER_QUEUE_SIZE_MAX_LIMIT);
      this.queueMaxLimitReached = true;
      this.queueMinLimitReached = false;
    }
  }

  emitUnrecoberableError(error, disptItem, response: string) {
    this.emit('error', error, disptItem, response);
  }

  emitNoDispatchedItem(disptItem) {
    this.emit(
      ScannerEvents.DISPATCHER_LOG,
      `[ SCANNER ]: WFP content sended to many times`
    );
    this.emit(ScannerEvents.DISPATCHER_ITEM_NO_DISPATCHED, disptItem);
  }

  errorHandler(error: Error, disptItem: DispatchableItem, response: string) {
    if (!this.globalAbortController.isAborting()) {
      if (error.name === 'AbortError') {
        error.message = `Timeout reached for packet with request ID ${disptItem.uuid}. Enqueuing again.`;
        error.name = 'TIMEOUT';
      }

      disptItem.increaseErrorCounter();
      if (
        disptItem.getErrorCounter() >=
        this.scannerCfg.MAX_RETRIES_FOR_RECOVERABLES_ERRORS
      ) {
        this.emitNoDispatchedItem(disptItem);

        if (this.scannerCfg.ABORT_ON_MAX_RETRIES) {
          error[
            'max_retries'
          ] = `Fingerprint block retried ${this.scannerCfg.MAX_RETRIES_FOR_RECOVERABLES_ERRORS} times, aborting`;
          this.emitUnrecoberableError(error, disptItem, response);
        }

        return;
      }
      this.emit(
        ScannerEvents.DISPATCHER_LOG,
        `[ SCANNER ]: An error occurred while sending WFP content to the server. Reason: ${error}`
      );
      this.dispatchItem(disptItem);
      return;
    }
  }

  async dispatch(item: DispatchableItem) {
    const timeoutController = this.globalAbortController.getAbortController();
    const timeoutId = setTimeout(
      () => timeoutController.abort(),
      this.scannerCfg.TIMEOUT
    );
    let plain_response: string;
    try {
      this.emit(ScannerEvents.DISPATCHER_WFP_SENDED);
      const response = await fetch(this.scannerCfg.API_URL, {
        agent: this.proxyAgent,
        method: 'post',
        body: item.getForm(),
        headers: {
          'User-Agent': this.scannerCfg.CLIENT_TIMESTAMP
            ? this.scannerCfg.CLIENT_TIMESTAMP
            : `scanoss-js/v${Utils.getPackageVersion()}`,
          'X-Session': this.scannerCfg.API_KEY,
          'x-request-id': item.uuid,
        },
        signal: timeoutController.signal,
      });

      clearTimeout(timeoutId);
      this.globalAbortController.removeAbortController(timeoutController);

      if (!response.ok) {
        plain_response = await response.text();
        const err = new Error(
          `\nHTTP Status code: ${response.status}\nServer Response:\n${plain_response}\n`
        );
        err.name = 'HTTP_ERROR';
        throw err;
      }

      plain_response = await response.text();
      const dataAsObj = JSON.parse(plain_response);

      const dispatcherResponse = new DispatcherResponse(
        dataAsObj,
        item.getFingerprintPackage().getContent()
      );
      this.emit(ScannerEvents.DISPATCHER_NEW_DATA, dispatcherResponse);
      return Promise.resolve();
    } catch (e) {
      clearTimeout(timeoutId);
      this.globalAbortController.removeAbortController(timeoutController);
      this.errorHandler(e, item, plain_response);
      return Promise.resolve();
    }
  }
}
