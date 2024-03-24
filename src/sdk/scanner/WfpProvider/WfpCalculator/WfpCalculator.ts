import fs from "fs";
import { Worker } from "worker_threads";

import { ScannableItem } from "../../Scannable/ScannableItem";
import { ScannerCfg } from "../../ScannerCfg";
import { ScannerEvents, ScannerInput, WinnowingMode } from "../../ScannerTypes";

import { FingerprintPackage } from "../FingerprintPackage";
import { IWfpProviderInput, WfpProvider } from "../WfpProvider";

// @ts-ignore
import WfpCalculatorWorker from "./WfpCalculator.worker.js";

export class WfpCalculator extends WfpProvider {
  private fileList: any;

  private fileListIndex: number;

  private continue: boolean;

  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.scannerCfg = scannerCfg;
  }

  init() {
    super.init();
    this.continue = true;
    this.fileList = [];
    this.fileListIndex = 0;
  }

  prepareWorker() {
    this.worker = new Worker(new URL(WfpCalculatorWorker, import.meta.url));
    //this.worker = new Worker(stringWorker, { eval: true });

    this.worker.on("message", async (scannableItem) => {
      this.fingerprintPacker(scannableItem.fingerprint);
      await this.nextStepMachine();
    });
  }

  recoveryIndex() {
    // Files: contains all files winnowed but not packed yet
    const files = new FingerprintPackage(this.wfp, this.folderRoot).getFilesFingerprinted();
    if (files.length) {
      const lastFileWinnowed = this.folderRoot + files[files.length - 1];
      let i = 0;
      while (i <= files.length && lastFileWinnowed !== this.fileList[this.fileListIndex - i]) {
        i += 1;
      }
      // If file already winnowed cannot be found in fileList emit an error.
      if (i > files.length) {
        this.sendError("Cannot recover index while generating fingerprints");
        return -1;
      }
      this.fileListIndex -= i;
      if (this.fileList[this.fileListIndex] === lastFileWinnowed) this.fileListIndex += 1;
    }
    return 0;
  }

  forceStopWorker() {
    this.worker.removeAllListeners();
    this.worker.terminate();
  }

  async getNextScannableItem() {
    if (this.fileListIndex >= this.fileList.length) {
      this.emit(ScannerEvents.WINNOWING_STATUS, this.fileListIndex % this.scannerCfg.WINNOWING_REPORT_STATUS_AFTER_X);
      return null;
    }
    const path = this.fileList[this.fileListIndex];
    const contentSource = path.replace(`${this.folderRoot}`, "");
    const content = await this.readFile(path);
    this.fileListIndex += 1;
    if (!(this.fileListIndex % this.scannerCfg.WINNOWING_REPORT_STATUS_AFTER_X))
      this.emit(ScannerEvents.WINNOWING_STATUS, this.scannerCfg.WINNOWING_REPORT_STATUS_AFTER_X);

    const scannable = new ScannableItem(content, contentSource, this.winnowingMode, this.scannerCfg.WFP_FILE_MAX_SIZE);
    return scannable;
  }

  async readFile(path: string): Promise<Buffer> {
    if (!(await this.isFileGreaterThanLimit(path))) {
      return await fs.promises.readFile(path);
    }
    return Buffer.alloc(0);
  }

  async isFileGreaterThanLimit(path: string) {
    const stats = await fs.promises.stat(path);
    const fileSizeInBytes = stats.size;
    const fileSizeInGB = fileSizeInBytes / (1024 * 1024 * 1024); // Convert bytes to gigabytes
    return fileSizeInGB >= 2;
  }

  async nextStepMachine() {
    if (!this.continue) return;
    const scannableItem = await this.getNextScannableItem();
    if (scannableItem) {
      this.sendLog(`[ SCANNER ]: WFP Calculator initialized: File=${scannableItem.getContentSource()}`);
      this.worker.postMessage(scannableItem);
    } else {
      this.finishWinnowing();
      this.forceStopWorker();
      this.sendLog("[ SCANNER ]: WFP Calculator finished...");
    }
  }

  public start(params: IWfpProviderInput): Promise<void> {
    if (!params.fileList) this.sendError("File list is required");
    this.sendLog("[ SCANNER ]: WFP Calculator starting...");

    this.init();
    this.prepareWorker();

    if (params.winnowingMode) this.setWinnowingMode(params.winnowingMode);
    if (params.obfuscate) this.obfuscate = params.obfuscate;

    this.pendingFiles = true;
    this.folderRoot = params.folderRoot;
    this.fileList = params.fileList;

    this.nextStepMachine();

    return this.finishPromise;
  }

  public pause(): void {
    this.sendLog("[ SCANNER ]: WFP Calculator paused...");
    this.continue = false;
  }

  public resume(): void {
    this.sendLog("[ SCANNER ]: WFP Calculator resumed...");
    this.continue = true;
    this.recoveryIndex();
    this.nextStepMachine();
  }

  public stop(): void {
    this.continue = false;
    this.pendingFiles = false;
    this.forceStopWorker();
    this.prepareWorker();
    this.init();
  }

  protected processPackedWfp(content) {
    const fingerprint = new FingerprintPackage(content, this.folderRoot);
    this.sendFingerprint(fingerprint);
  }
}
