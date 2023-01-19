import EventEmitter from 'eventemitter3';
import os from 'os';
import fs from 'fs';
import { IWfpProviderInput, WfpProvider } from './WfpProvider/WfpProvider';
import { WfpCalculator } from './WfpProvider/WfpCalculator/WfpCalculator';
import path from 'path';
import { ScannerEvents } from './ScannerTypes';
import { FingerprintPackage } from './WfpProvider/FingerprintPackage';
import { ScannerCfg } from './ScannerCfg';

export class Fingerprint extends EventEmitter {
  private wfpCalculator: WfpProvider;
  private fingerprintPath: string;
  private finishPromise: Promise<void>;
  private finishPromiseResolve: (value?: (void | PromiseLike<void>)) => void;
  private finishPromiseReject: (value?: (void | PromiseLike<void>)) => void;
  private reportStatusAfter: number;
  private queue: Array<IWfpProviderInput>;
  constructor(reportStatusAfter = 10) {
    super();

    this.reportStatusAfter = reportStatusAfter;
    this.finishPromise = new Promise((resolve, reject) =>{
      this.finishPromiseResolve = resolve;
      this.finishPromiseReject = reject;
    });

    this.configureWfpCalculator();
  }



  private configureWfpCalculator() {

    // TODO: Maybe the fingerprints shouldn't be truncated. Determine this optimal value.
    const cfg = new ScannerCfg();
    cfg.WFP_FILE_MAX_SIZE = 10 * 1024 *1024;
    cfg.WINNOWING_REPORT_STATUS_AFTER_X = this.reportStatusAfter;
    this.wfpCalculator = new WfpCalculator(cfg);


    this.wfpCalculator.on(ScannerEvents.WINNOWING_NEW_CONTENT, (fingerprintPackage: FingerprintPackage) => {
      fs.appendFileSync(this.fingerprintPath, fingerprintPackage.getContent());
    });

    this.wfpCalculator.on(ScannerEvents.WINNOWING_STATUS, (filesProcessed: number) => {
      this.emit(ScannerEvents.WINNOWING_STATUS, filesProcessed);
    });


  }

  public async start(jobs: Array<IWfpProviderInput>): Promise<void> {
    //If winnowing.wfp path is not set, set to a tmp folder
    if (!this.fingerprintPath) this.fingerprintPath = path.join(os.tmpdir(), "fingerprint-" + new Date().getTime().toString(), 'winnowing.wfp');

    //If folder does not exist, create
    const pathFolder = path.dirname(this.fingerprintPath);
    if(!fs.existsSync(pathFolder)) fs.mkdirSync(pathFolder, { recursive: true });

    this.queue = jobs;

    for await (const job of this.queue) {
      this.configureWfpCalculator();
      await this.wfpCalculator.start(job);
    }

    this.emit(ScannerEvents.WINNOWING_FINISHED);
  }

  public abort() {
    this.wfpCalculator.stop();
    this.wfpCalculator=null;
  }

  public setFingerprintPath(fingerprintsFilePath: string) {
    this.fingerprintPath=fingerprintsFilePath;
  }



}
