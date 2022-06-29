import fs from 'fs';
import { Worker } from 'worker_threads';

import { ScannableItem } from '../../Scannable/ScannableItem';
import { ScannerCfg } from '../../ScannerCfg';
import { ScannerEvents, ScannerInput, WinnowingMode } from '../../ScannerTypes';

import { FingerprintPackage } from '../FingerprintPackage';
import { IWfpProviderInput, WfpProvider } from '../WfpProvider';

const stringWorker = `
const { parentPort } = require('worker_threads');

parentPort.on('message', async (scannableItem) => {

  let fingerprint;
  if ( scannableItem.winnowingMode === "FULL_WINNOWING") {
    fingerprint = wfp_for_content(
      scannableItem.content,
      scannableItem.contentSource,
      scannableItem.maxSizeWfp
    );
  } else if scannableItem.winnowingMode === "FULL_WINNOWING_HPSM") {
    fingerprint = wfp_hpsm_for_content(
      scannableItem.content,
      scannableItem.contentSource,
      scannableItem.maxSizeWfp
    );
  } else if scannableItem.winnowingMode === "WINNOWING_ONLY_MD5"{
    fingerprint = wfp_only_md5(
      scannableItem.content,
      scannableItem.contentSource
    );
  }

  scannableItem.fingerprint = fingerprint;

  parentPort.postMessage(scannableItem);
});`;

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
    this.worker = new Worker(stringWorker, { eval: true });
    this.worker.on('message', async (scannableItem) => {
      this.fingerprintPacker(scannableItem.fingerprint);
      await this.nextStepMachine();
    });
  }

  recoveryIndex() {
    // Files: contains all files winnowed but not packed yet
    const files = new FingerprintPackage(this.wfp, this.folderRoot).getFilesFingerprinted();
    if (files.length) {
      const lastFileWinnowed = files[files.length - 1];
      let i = 0;
      while (i <= files.length && lastFileWinnowed !== this.fileList[this.fileListIndex - i]) {
        i += 1;
      }
      // If file already winnowed cannot be found in fileList emit an error.
      if (i > files.length) {
        this.sendError('Cannot recovery index on winnower');
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

  protected processPackedWfp(content) {
    const fingerprint = new FingerprintPackage(content, this.folderRoot);
    this.sendFingerprint(fingerprint);
  }

  async getNextScannableItem() {
    if (this.fileListIndex >= this.fileList.length) return null;
    const path = this.fileList[this.fileListIndex];
    const contentSource = path.replace(`${this.folderRoot}`, '');
    const content = await fs.promises.readFile(path);
    this.fileListIndex += 1;
    const scannable = new ScannableItem(content, contentSource, this.winnowingMode, this.scannerCfg.WFP_FILE_MAX_SIZE);
    return scannable;
  }

  async nextStepMachine() {
    if (!this.continue) return;
    const scannableItem = await this.getNextScannableItem();
    if (scannableItem) this.worker.postMessage(scannableItem);
    else {
      this.finishWinnowing();
      this.forceStopWorker();
      this.sendLog('[ SCANNER ]: WFP Calculator finished...');

    }
  }


  public start(params: IWfpProviderInput): void {

    if(!params.fileList) this.sendError('File list is required');
    this.sendLog('[ SCANNER ]: WFP Calculator starting...');

    this.init();
    this.prepareWorker();

    if(params.winnowingMode) this.setWinnowingMode(params.winnowingMode);
    this.pendingFiles = true;
    this.folderRoot = params.folderRoot;
    this.fileList = params.fileList;
    this.nextStepMachine();
  }




  public pause(): void {
    this.sendLog('[ SCANNER ]: WFP Calculator paused...')
    this.continue = false;
  }

  public resume(): void {
    this.sendLog('[ SCANNER ]: WFP Calculator resumed...')
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

}
