/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import EventEmitter from 'eventemitter3';
import fetch from 'node-fetch';
import PQueue from "p-queue";
import FormData from "form-data";

import { ScannerEvents } from "../ScannerTypes";
import { DispatcherResponse } from "./DispatcherResponse";
import { ScannerCfg } from "../ScannerCfg";
import { GlobalControllerAborter } from "./GlobalControllerAborter";
import { DispatchableItem } from './DispatchableItem';

const MAX_CONCURRENT_REQUEST = 30;

export class Dispatcher extends EventEmitter {
  private scannerCfg: ScannerCfg;

  private pQueue;

  private globalAbortController: GlobalControllerAborter;

  private queueMaxLimitReached: boolean;

  private queueMinLimitReached: boolean;

  private recoverableErrors;

  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.scannerCfg = scannerCfg;
    if(this.scannerCfg.CONCURRENCY_LIMIT > MAX_CONCURRENT_REQUEST)
      this.scannerCfg.CONCURRENCY_LIMIT = MAX_CONCURRENT_REQUEST;

    this.init();
  }

  init() {
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
        method: 'post',
        body: item.getForm(),
        headers: { 'User-Agent': this.scannerCfg.CLIENT_TIMESTAMP, 'X-Session': this.scannerCfg.API_KEY },
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
