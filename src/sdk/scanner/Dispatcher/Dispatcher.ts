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
import { Utils } from '../../Utils/Utils';
import { ProxyAgent } from "proxy-agent";


const MAX_CONCURRENT_REQUEST = 30;

enum ERRORS {
  HTTP = 'HTTP',
  ABORT_CONTROLLER = 'AbortError',
  TIMEOUT = 'TIMEOUT'
}

export class Dispatcher extends EventEmitter {
  private scannerCfg: ScannerCfg;

  private pQueue;

  private globalAbortController: GlobalControllerAborter;

  private queueMaxLimitReached: boolean;

  private queueMinLimitReached: boolean;

  private proxyAgent:  ProxyAgent;

  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.scannerCfg = scannerCfg;
    if (this.scannerCfg.CONCURRENCY_LIMIT > MAX_CONCURRENT_REQUEST)
      this.scannerCfg.CONCURRENCY_LIMIT = MAX_CONCURRENT_REQUEST;

    this.init();
  }

  init() {

    process.env.NO_PROXY = process.env.NO_PROXY || this.scannerCfg.NO_PROXY
    process.env.HTTP_PROXY = process.env.HTTP_PROXY || this.scannerCfg.HTTP_PROXY
    process.env.HTTPS_PROXY = process.env.HTTPS_PROXY ||this.scannerCfg.HTTPS_PROXY
    this.proxyAgent = new ProxyAgent();


    const caCertPath =
      this.scannerCfg.CA_CERT || process.env.NODE_EXTRA_CA_CERTS;

    if (caCertPath) Utils.loadCaCertFromFile(caCertPath);

    if (this.scannerCfg.IGNORE_CERT_ERRORS )  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    else process.env.NODE_TLS_REJECT_UNAUTHORIZED='1'




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
      //Abort scan when JSON is broken
      if (error instanceof SyntaxError) {
        this.emitUnrecoberableError(error, disptItem, response);
      }

      if (error.name === ERRORS.HTTP) {
        this.emitUnrecoberableError(error, disptItem, response);
      }


      //This is an error triggered by the AbortController
      if (error.name === ERRORS.ABORT_CONTROLLER) {
        error = new Error(
          `Timeout reached for packet with request ID ${disptItem.uuid}`
        );
        error.name = ERRORS.TIMEOUT;
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
          'X-Api-Key': this.scannerCfg.API_KEY,
          'x-request-id': item.uuid,
        },
        signal: timeoutController.signal,
      });

      clearTimeout(timeoutId);
      this.globalAbortController.removeAbortController(timeoutController);

      if (!response.ok) {
        plain_response = await response.text();
        const err = new Error(
          `\nHTTP Status code: ${response.status}\nServer Response:\n${plain_response}${response.status === 404 ?`Requested URL was not found:\n${this.scannerCfg.API_URL}\n` : '' }`
        );
        err.name = ERRORS.HTTP;
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
