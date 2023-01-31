/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import EventEmitter from 'eventemitter3';
import fetch from 'node-fetch';
import PQueue from "p-queue";

import { ScannerEvents } from "../ScannerTypes";
import { DispatcherResponse } from "./DispatcherResponse";
import { ScannerCfg } from "../ScannerCfg";
import { GlobalControllerAborter } from "./GlobalControllerAborter";
import { DispatchableItem } from './DispatchableItem';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as syswideCa from "syswide-cas";
import { Utils } from '../../Utils/Utils';

const MAX_CONCURRENT_REQUEST = 30;

export class Dispatcher extends EventEmitter {
  private scannerCfg: ScannerCfg;

  private pQueue;

  private globalAbortController: GlobalControllerAborter;

  private queueMaxLimitReached: boolean;

  private queueMinLimitReached: boolean;

  private recoverableErrors;

  private proxy: HttpsProxyAgent;

  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.scannerCfg = scannerCfg;
    if(this.scannerCfg.CONCURRENCY_LIMIT > MAX_CONCURRENT_REQUEST)
      this.scannerCfg.CONCURRENCY_LIMIT = MAX_CONCURRENT_REQUEST;

    this.init();
  }

  init() {

    //Loads proxy from SDK config, if not from env variables, if not leave empty
    this.proxy = null;
    const proxy = this.scannerCfg.PROXY || process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy  || process.env.HTTP_PROXY || '';
    if (proxy) this.proxy = new HttpsProxyAgent(proxy)



    //Loads certs stuff from SDK config
    const ca_cert = this.scannerCfg.CA_CERT  || process.env.NODE_EXTRA_CA_CERTS
    if (ca_cert) {
      syswideCa.addCAs(ca_cert)
    } else {
      if (this.scannerCfg.IGNORE_CERT_ERRORS || proxy)
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    this.pQueue = new PQueue({
      concurrency: this.scannerCfg.CONCURRENCY_LIMIT,
    });
    this.pQueue.clear();

    this.pQueue.on('idle', () => {
      this.emit(ScannerEvents.DISPATCHER_FINISHED);
    });

    this.pQueue.on('next', () => {
      if ((this.pQueue.size + this.pQueue.pending) < this.scannerCfg.DISPATCHER_QUEUE_SIZE_MIN_LIMIT && !this.queueMinLimitReached) {
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
      this.pQueue.size + this.pQueue.pending >= this.scannerCfg.DISPATCHER_QUEUE_SIZE_MAX_LIMIT &&
      !this.queueMaxLimitReached
    ) {
      this.emit(ScannerEvents.DISPATCHER_QUEUE_SIZE_MAX_LIMIT);
      this.queueMaxLimitReached = true;
      this.queueMinLimitReached = false;
    }
  }

  handleUnrecoverableError(error,disptItem) {
    this.emit('error', error, disptItem);
  }

  emitNoDispatchedItem(disptItem) {
    this.emit(ScannerEvents.DISPATCHER_LOG, `[ SCANNER ]: WFP content sended to many times. Some files won't be scanned`);
    this.emit(ScannerEvents.DISPATCHER_ITEM_NO_DISPATCHED, disptItem);
  }

  errorHandler(error, disptItem) {
    if (!this.globalAbortController.isAborting()) {
      if (error.name === 'AbortError') error.name = 'TIMEOUT';
      if (this.recoverableErrors.has(error.code) || this.recoverableErrors.has(error.name)) {
        disptItem.increaseErrorCounter();
        if (disptItem.getErrorCounter() >= this.scannerCfg.MAX_RETRIES_FOR_RECOVERABLES_ERRORS) {
          this.emitNoDispatchedItem(disptItem);
          if (this.scannerCfg.ABORT_ON_MAX_RETRIES) this.handleUnrecoverableError(error, disptItem);
          return;
        }
        this.emit(ScannerEvents.DISPATCHER_LOG,`[ SCANNER ]: Recoverable error happened sending WFP content to server. Reason: ${error.code || error.name}`);
        this.dispatchItem(disptItem);
        return;
      }
      this.handleUnrecoverableError(error, disptItem);
    }
  }

  async dispatch(item: DispatchableItem) {
    const timeoutController = this.globalAbortController.getAbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), this.scannerCfg.TIMEOUT);
    try {
      this.emit(ScannerEvents.DISPATCHER_WFP_SENDED);
      const response = await fetch(this.scannerCfg.API_URL, {
        agent: this.proxy,
        method: 'post',
        body: item.getForm(),
        headers: {  'User-Agent': this.scannerCfg.CLIENT_TIMESTAMP ? this.scannerCfg.CLIENT_TIMESTAMP : `scanoss-js/v${Utils.getPackageVersion()}`,
                    'X-Session': this.scannerCfg.API_KEY,
        },
        signal: timeoutController.signal,
      });

      clearTimeout(timeoutId);
      this.globalAbortController.removeAbortController(timeoutController);

      if (!response.ok) {
        const msg = await response.text();
        const err = new Error(msg);
        err["code"] = response.status;
        err.name = ScannerEvents.ERROR_SERVER_SIDE;
        throw err;
      }

      const dataAsText = await response.text();
      const dataAsObj = JSON.parse(dataAsText);

      const dispatcherResponse = new DispatcherResponse(dataAsObj, item.getFingerprintPackage().getContent());
      this.emit(ScannerEvents.DISPATCHER_NEW_DATA, dispatcherResponse);
      return Promise.resolve();
    } catch (e) {
        clearTimeout(timeoutId);
        this.globalAbortController.removeAbortController(timeoutController);
        this.errorHandler(e, item);
        return Promise.resolve();
    }
  }
}
