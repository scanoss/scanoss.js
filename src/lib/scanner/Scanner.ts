/* eslint-disable no-console */
// 2.0
import EventEmitter from 'eventemitter3';
import os from 'os';
import fs from 'fs';


import { Dispatcher } from './Dispatcher/Dispatcher';

import { DispatchableItem } from './Dispatcher/DispatchableItem';
import { DispatcherResponse } from './Dispatcher/DispatcherResponse';
import { ScannerCfg } from './ScannerCfg';
import { ScannerEvents, ScannerInput } from './ScannerTypes';

import sortPaths from 'sort-paths';

import { WfpProvider } from './WfpProvider/WfpProvider';
import { FingerprintPacket } from './WfpProvider/FingerprintPacket';
import { WfpCalculator } from './WfpProvider/WfpCalculator/WfpCalculator';
import { WfpSplitter } from './WfpProvider/WfpSplitter/WfpSplitter';

let finishPromiseResolve;
let finishPromiseReject;



export class Scanner extends EventEmitter {
  private scannerCfg: ScannerCfg;

  private workDirectory: string;

  private resultFilePath: string;

  private wfpFilePath: string;

  private scanRoot: string;

  private scannerId: string;

  private wfpProvider: WfpProvider;

  private dispatcher: Dispatcher;

  private finishPromise: Promise<void>;

  private scannerInput: Array<ScannerInput>;

  private scanFinished: boolean; // Both flags are used to prevent a race condition between DISPATCHER.NEW_DATA and DISPATCHER_FINISHED

  private processingNewData: boolean; // Both flags are used to prevent a race condition between DISPATCHER.NEW_DATA and DISPATCHER_FINISHED

  private processedFiles: number;

  private running: boolean;

  private filesToScan;

  private responseBuffer;

  private filesNotScanned;

  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.scannerCfg = scannerCfg;
    this.scannerId = new Date().getTime().toString();
  }

  init() {
    this.scanFinished = false;
    this.processingNewData = false;
    this.running = true;
    this.processedFiles = 0;
    this.responseBuffer = [];
    this.filesToScan = {};
    this.filesNotScanned = {};
    this.wfpProvider = new WfpCalculator(this.scannerCfg);
    this.dispatcher = new Dispatcher(this.scannerCfg);

    this.finishPromise = new Promise((resolve, reject) =>{
      finishPromiseResolve = resolve;
      finishPromiseReject = reject;
    });

    this.setWinnowerListeners();
    this.setDispatcherListeners();

    if (this.workDirectory === undefined) this.setWorkDirectory(`${os.tmpdir()}/scanner-${this.getScannerId()}`);
  }

  setWinnowerListeners() {
    this.wfpProvider.on(ScannerEvents.WINNOWING_NEW_CONTENT, (fingerprintPacket: FingerprintPacket) => {
      this.emit(ScannerEvents.WINNOWING_NEW_CONTENT, fingerprintPacket);
      this.reportLog(`[ SCANNER ]: New WFP content`);
      fingerprintPacket.setEngineFlags(this.scannerInput[0].engineFlags);
      const disptItem = new DispatchableItem(fingerprintPacket);
      this.dispatcher.dispatchItem(disptItem);
    });

    this.wfpProvider.on(ScannerEvents.WINNOWER_LOG, (msg) => {
      this.reportLog(msg);
    });

    this.wfpProvider.on(ScannerEvents.ERROR, (error) => {
      this.errorHandler(error, ScannerEvents.MODULE_WINNOWER);
    });
  }

  setDispatcherListeners() {
    this.dispatcher.on(ScannerEvents.DISPATCHER_QUEUE_SIZE_MAX_LIMIT, () => {
      this.reportLog(`[ SCANNER ]: Maximum queue size reached. Winnower will be paused`);
      this.wfpProvider.pause();
    });

    this.dispatcher.on(ScannerEvents.DISPATCHER_QUEUE_SIZE_MIN_LIMIT, () => {
      this.reportLog(`[ SCANNER ]: Minimum queue size reached. Winnower will be resumed`);
      this.wfpProvider.resume();
    });

    this.dispatcher.on(ScannerEvents.DISPATCHER_NEW_DATA, async (response) => {
      this.processingNewData = true;
      this.processedFiles += response.getNumberOfFilesScanned();
      this.reportLog(`[ SCANNER ]: Received results of ${response.getNumberOfFilesScanned()} files`);
      this.emit(ScannerEvents.DISPATCHER_NEW_DATA, response);
      this.insertIntoBuffer(response);
      if (this.bufferReachedLimit()) this.bufferToFiles();
      this.processingNewData = false;
      if (this.scanFinished) await this.finishJob();
    });

    this.dispatcher.on(ScannerEvents.DISPATCHER_FINISHED, async () => {
      if (!this.wfpProvider.hasPendingFiles()) {
        if (this.processingNewData) this.scanFinished = true;
        else await this.finishJob();
      }
    });

    this.dispatcher.on(ScannerEvents.DISPATCHER_ITEM_NO_DISPATCHED, (disptItem) => {
      const filesNotScanned = disptItem.getWinnowerResponse().getFilesWinnowed();
      this.appendFilesToNotScanned(filesNotScanned);
    });

    this.wfpProvider.on(ScannerEvents.DISPATCHER_LOG, (msg) => {
      this.reportLog(msg);
    });

    this.dispatcher.on(ScannerEvents.ERROR, (error, disptItem) => {
      const wfpContent = disptItem.getWinnowerResponse().getContent();
      fs.writeFileSync(`${this.workDirectory}/failed.wfp`, wfpContent, 'utf8');
      this.errorHandler(error, ScannerEvents.MODULE_DISPATCHER);
    });
  }

  appendFilesToNotScanned(fileList) {
    const obj = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const file of fileList) obj[file] = this.filesToScan[file];
    Object.assign(this.filesNotScanned, obj);
    return this.filesNotScanned;
  }

  insertIntoBuffer(dispatcherResponse) {
    this.responseBuffer.push(dispatcherResponse);
  }

  isBufferEmpty() {
    return this.responseBuffer.length === 0;
  }

  bufferReachedLimit() {
    if (this.responseBuffer.length >= this.scannerCfg.MAX_RESPONSES_IN_BUFFER) return true;
    return false;
  }

  bufferToFiles() {
    let wfpContent = '';
    const serverResponse = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const dispatcherResponse of this.responseBuffer) {
      wfpContent += dispatcherResponse.getWfpContent();
      const serverResponseToAppend = dispatcherResponse.getServerResponse();
      Object.assign(serverResponse, serverResponseToAppend);
    }
    this.appendOutputFiles(wfpContent, serverResponse);
    this.responseBuffer = [];
    const responses = new DispatcherResponse(serverResponse, wfpContent);
    this.reportLog(`[ SCANNER ]: Persisted results of ${responses.getNumberOfFilesScanned()} files...`);
    this.emit(ScannerEvents.RESULTS_APPENDED, responses, this.filesNotScanned);
    return responses;
  }

  public setWorkDirectory(workDirectory: string) {
    this.workDirectory = workDirectory;
    this.resultFilePath = `${this.workDirectory}/result.json`;
    this.wfpFilePath = `${this.workDirectory}/winnowing.wfp`;

    if (!fs.existsSync(this.workDirectory)) fs.mkdirSync(this.workDirectory);
  }

  public getWorkDirectory(): string {
    return this.workDirectory;
  }

  public cleanWorkDirectory(): void {
    if (fs.existsSync(this.resultFilePath)) fs.unlinkSync(this.resultFilePath);
    if (fs.existsSync(this.wfpFilePath)) fs.unlinkSync(this.wfpFilePath);
  }

  private async finishJob() {
    this.scannerInput.shift();
    this.reportLog(`[ SCANNER ]: Job finished. ${this.scannerInput.length} pendings`);

    if(this.scannerInput.length) {
      if (this.scannerInput[0].wfpPath) {
        this.wfpProvider = new WfpSplitter();
        this.setWinnowerListeners();
        this.wfpProvider.start({wfpPath: this.scannerInput[0].wfpPath});
      } else {
        const folderRoot = this.scannerInput[0].folderRoot;
        const winnowingMode = this.scannerInput[0].winnowingMode;
        const fileList = this.scannerInput[0].fileList;
        this.wfpProvider.start({folderRoot, winnowingMode, fileList});
      }
     } else await this.finishScan();
  }

  private async finishScan() {
    if (!this.isBufferEmpty()) this.bufferToFiles();
    const results = JSON.parse(await fs.promises.readFile(this.resultFilePath, 'utf8'));
    const sortedPaths = sortPaths(Object.keys(results), '/');
    const resultSorted = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key of sortedPaths) resultSorted[key] = results[key];
    await fs.promises.writeFile(this.resultFilePath, JSON.stringify(resultSorted, null, 2));
    this.reportLog(
      `[ SCANNER ]: Scan finished (Scanned: ${this.processedFiles}, Not Scanned: ${
        Object.keys(this.filesNotScanned).length
      })`
    );
    this.reportLog(`[ SCANNER ]: Results on: ${this.resultFilePath}`);
    this.running = false;
    this.emit(ScannerEvents.SCAN_DONE, this.resultFilePath, this.filesNotScanned);
    finishPromiseResolve();
  }

  reportLog(txt, level = 'info') {
    this.emit(ScannerEvents.SCANNER_LOG, txt, level);
  }

  errorHandler(error, origin) {
    this.stop();
    if (origin === ScannerEvents.MODULE_DISPATCHER) {
    }
    if (origin === ScannerEvents.MODULE_WINNOWER) {
    }

    this.reportLog(`[ SCANNER ]: Error reason ${error}`);

    this.emit(ScannerEvents.ERROR, error);
    if(this.finishPromise) finishPromiseReject(error);
  }

  createOutputFiles() {
    if (!fs.existsSync(this.wfpFilePath)) fs.writeFileSync(this.wfpFilePath, '');
    if (!fs.existsSync(this.resultFilePath)) fs.writeFileSync(this.resultFilePath, JSON.stringify({}));
  }

  appendOutputFiles(wfpContent, serverResponse) {
    fs.appendFileSync(this.wfpFilePath, wfpContent);
    const storedResultStr = fs.readFileSync(this.resultFilePath, 'utf-8');
    const storedResultObj = JSON.parse(storedResultStr);
    Object.assign(storedResultObj, serverResponse);
    const newResultStr = JSON.stringify(storedResultObj);
    fs.writeFileSync(this.resultFilePath, newResultStr);
  }


  public scan(scannerInput: Array<ScannerInput>): Promise<void> {
    this.init();
    this.createOutputFiles();
    this.scannerInput = scannerInput;

    if (!this.isValidInput(scannerInput)) {
      this.finishScan();
      return this.finishPromise;
    }

    if (scannerInput[0]?.wfpPath) {
      this.wfpProvider = new WfpSplitter();
      this.setWinnowerListeners();
      this.wfpProvider.start({wfpPath: scannerInput[0].wfpPath});
    } else {
      const folderRoot = this.scannerInput[0].folderRoot;
      const winnowingMode = this.scannerInput[0].winnowingMode;
      const fileList = this.scannerInput[0].fileList;
      this.wfpProvider.start({folderRoot, winnowingMode, fileList});
    }
    return this.finishPromise;
  }




  private isValidInput(scannerInput: Array<ScannerInput>): boolean {
    if (!scannerInput) {
      this.reportLog('[ SCANNER ]: No input provided', 'warning');
      return false;
    }

    if (!Array.isArray(scannerInput)) {
      this.reportLog('[ SCANNER ]: Input must be an array','warning');
      return false;
    }

    if (!scannerInput.length) {
      this.reportLog('[ SCANNER ]: Input array is empty', 'warning');
      return false;
    }

    if (scannerInput.some((input) => !input.fileList.length && !input.wfpPath)) {
      this.reportLog('[ SCANNER ]: Input array contains an element with no file list','warning');
      return false;
    }

    return true;
  }


  getScannerId() {
    return this.scannerId;
  }

  stop() {
    this.reportLog(`[ SCANNER ]: Stopping scanner`);
    this.running = false;
    this.wfpProvider.removeAllListeners();
    this.dispatcher.removeAllListeners();
    this.dispatcher.stop();
    this.wfpProvider.stop();
  }

  isRunning() {
    return this.running;
  }

}


