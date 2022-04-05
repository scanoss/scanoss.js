import { Worker } from 'worker_threads';
import { EventEmitter } from "stream";
import { ScannerCfg } from "../ScannerCfg";
import { ScannerEvents, ScannerInput, WinnowingMode } from "../ScannerTypes";
import { FingerprintPacket } from "./FingerprintPacket";


export interface IWfpProviderInput {
  wfpPath?: string;
  folderRoot?: string;
  fileList?: Array<string>;
  winnowingMode?: WinnowingMode;  // Enable winnowing algorithm, otherwise is scanned only MD5
}

export abstract class WfpProvider extends EventEmitter {

  protected wfp: string;
  protected scannerCfg: ScannerCfg;
  protected folderRoot: string;
  protected worker: Worker;
  protected pendingFiles: boolean;
  protected winnowingMode: WinnowingMode;

  protected init(): void {
    this.wfp = '';
    this.folderRoot = '';
    this.pendingFiles = false;
    this.winnowingMode = WinnowingMode.FULL_WINNOWING;
  }

  // returns true if the function emitted a new fingerprint packet
  protected fingerprintPacker(fingerprint: string): boolean {
    // When the fingerprint of one file is bigger than 64Kb, truncate to the last 64Kb line.
    if (fingerprint.length > this.scannerCfg.WFP_FILE_MAX_SIZE) {
      let truncateStringOnIndex = this.scannerCfg.WFP_FILE_MAX_SIZE;
      let keepRemovingCharacters = true;
      while (keepRemovingCharacters) {
        if (fingerprint[truncateStringOnIndex] === '\n') keepRemovingCharacters = false;
        truncateStringOnIndex -= 1;
      }
      truncateStringOnIndex += 1;
      // eslint-disable-next-line no-param-reassign
      fingerprint = fingerprint.substring(0, truncateStringOnIndex);
      // eslint-disable-next-line no-param-reassign
      fingerprint += '\n';
    }

    if (this.wfp.length + fingerprint.length >= this.scannerCfg.WFP_FILE_MAX_SIZE) {
      this.sendFingerprint(new FingerprintPacket(this.wfp, this.folderRoot));
      this.wfp = '';
    }
    this.wfp += fingerprint;

    if(this.wfp !== fingerprint) return false;
    return true;
  }

  protected finishWinnowing() {
    if (this.wfp.length !== 0) this.sendFingerprint(new FingerprintPacket(this.wfp, this.folderRoot));
    this.pendingFiles = false;
    this.emit(ScannerEvents.WINNOWING_FINISHED);
  }


  protected sendFingerprint(fingerprintPacket: FingerprintPacket) {
    this.emit(ScannerEvents.WINNOWING_NEW_CONTENT, fingerprintPacket);
  }

  protected sendLog(logMsg: string): void {
    this.emit(ScannerEvents.WINNOWER_LOG, logMsg);
  }

  protected sendError(errorMsg: string): void {
    this.emit(ScannerEvents.ERROR, new Error(errorMsg));
  }

  protected setWinnowingMode(mode: WinnowingMode): void {
    this.winnowingMode = mode;
  }

  public abstract start(params: IWfpProviderInput): void;
  public abstract stop(): void;
  public abstract pause(): void;
  public abstract resume(): void;


  public hasPendingFiles(): boolean {
    return this.pendingFiles;
  }

}
