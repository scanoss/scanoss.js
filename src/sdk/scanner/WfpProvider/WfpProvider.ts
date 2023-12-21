import { Worker } from 'worker_threads';
import EventEmitter from 'eventemitter3';
import { ScannerCfg } from '../ScannerCfg';
import { ScannerEvents, WinnowingMode } from '../ScannerTypes';
import { FingerprintPackage } from './FingerprintPackage';

export interface IWfpProviderInput {
  wfpPath?: string;
  folderRoot?: string; //This string is being removed from the fingerprint results paths
  fileList?: Array<string>;
  winnowingMode?: WinnowingMode; // Enable winnowing algorithm, otherwise is scanned only MD5
  obfuscate?: boolean;
}

export abstract class WfpProvider extends EventEmitter {
  protected wfp: string;
  protected scannerCfg: ScannerCfg;
  protected folderRoot: string;
  protected worker: Worker;
  protected pendingFiles: boolean;
  protected winnowingMode: WinnowingMode;
  protected finishPromise: Promise<void>;
  protected obfuscate: boolean;

  //Allow resolve or reject the promise returned in start call
  protected finishPromiseResolve: (value?: void | PromiseLike<void>) => void;
  protected finishPromiseReject: (value?: void | PromiseLike<void>) => void;

  public abstract start(params: IWfpProviderInput): Promise<void>;

  public abstract stop(): void;

  public abstract pause(): void;

  public abstract resume(): void;

  public hasPendingFiles(): boolean {
    return this.pendingFiles;
  }

  protected init(): void {
    this.wfp = '';
    this.folderRoot = '';
    this.pendingFiles = false;
    this.winnowingMode = WinnowingMode.FULL_WINNOWING;
    this.obfuscate = false;

    this.finishPromise = new Promise((resolve, reject) => {
      this.finishPromiseResolve = resolve;
      this.finishPromiseReject = reject;
    });
  }

  // returns true if the function emitted a new fingerprint packet
  protected fingerprintPacker(fingerprint: string): boolean {
    // When the fingerprint of one file is bigger than 64Kb, truncate to the last 64Kb line.
    if (fingerprint.length > this.scannerCfg.WFP_FILE_MAX_SIZE) {
      let truncateStringOnIndex = this.scannerCfg.WFP_FILE_MAX_SIZE;
      let keepRemovingCharacters = true;
      while (keepRemovingCharacters) {
        if (fingerprint[truncateStringOnIndex] === '\n')
          keepRemovingCharacters = false;
        truncateStringOnIndex -= 1;
      }
      truncateStringOnIndex += 1;
      // eslint-disable-next-line no-param-reassign
      fingerprint = fingerprint.substring(0, truncateStringOnIndex);
      // eslint-disable-next-line no-param-reassign
      fingerprint += '\n';
    }

    const conditionMaxSize =
      this.wfp.length + fingerprint.length >= this.scannerCfg.WFP_FILE_MAX_SIZE;

    const conditionMaxFiles =
      (this.wfp.match(/file\=/g) || []).length >=
      Math.round(this.scannerCfg.WFP_FILE_MAX_SIZE / 1024);

    if ((conditionMaxSize || conditionMaxFiles) && this.wfp.length > 0) {
      this.sendFingerprint(new FingerprintPackage(this.wfp, this.folderRoot));
      this.wfp = '';
    }
    this.wfp += fingerprint;

    if (this.wfp !== fingerprint) return false;
    return true;
  }

  protected finishWinnowing() {
    if (this.wfp.length !== 0)
      this.sendFingerprint(new FingerprintPackage(this.wfp, this.folderRoot));
    this.pendingFiles = false;
    this.emit(ScannerEvents.WINNOWING_FINISHED);
    this.finishPromiseResolve();
  }

  protected sendFingerprint(fingerprintPackage: FingerprintPackage) {
    if (this.obfuscate) fingerprintPackage.obfuscate();
    this.emit(ScannerEvents.WINNOWING_NEW_CONTENT, fingerprintPackage);
  }

  protected sendLog(logMsg: string): void {
    this.emit(ScannerEvents.WINNOWER_LOG, logMsg);
  }

  protected sendError(errorMsg: string): void {
    this.emit(ScannerEvents.ERROR, new Error(errorMsg));
    this.finishPromiseReject();
  }

  protected setWinnowingMode(mode: WinnowingMode): void {
    this.winnowingMode = mode;
  }
}
