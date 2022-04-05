import { IWfpProviderInput, WfpProvider } from "../WfpProvider";
import fs from "fs";
import { ScannerCfg } from "../../ScannerCfg";
import { Readable } from "stream";

export class WfpSplitter extends WfpProvider {

  private continue: boolean;

  private wfpStream: Readable;

  private chunkDataRead: string;

  private fingerprints: Array<string>;

  private fingerprintIndex: number;

  private timer: ReturnType<typeof setTimeout>;

  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.scannerCfg = scannerCfg;
  }

  public start(params: IWfpProviderInput): void {
    this.sendLog('[ SCANNER ]: WFP Splitter starting...');

    this.init();
    this.pendingFiles = true;
    this.chunkDataRead = '';
    this.fingerprints = [];
    this.continue = true;
    this.fingerprintIndex = 0;
    const wfpPath = params.wfpPath;
    if (!wfpPath) this.sendError('WFP path is not defined');

    this.wfpStream = fs.createReadStream(wfpPath, { encoding: 'utf8' });
    this.setStreamListeners();
  }

  public stop(): void {
    this.continue = false;
  }

  public pause(): void {
    this.sendLog('[ SCANNER ]: WFP Splitter paused...')
    this.continue = false;
  }

  public resume(): void {
    this.sendLog('[ SCANNER ]: WFP Splitter resumed...')
    this.continue = true;
    this.sendFingerprints();
    this.streamBufferFlush();
  }


  private sendFingerprints() {
    if(this.timer === undefined) {
      this.timer = setInterval(() => {
        if(this.fingerprintIndex < this.fingerprints.length && this.continue) {
          this.fingerprintPacker(this.fingerprints[this.fingerprintIndex]);
          this.fingerprintIndex++;
        } else {
          this.stopSendFingerprints();
        }
      });
    }


  }

  private stopSendFingerprints() {
    clearInterval(this.timer);
    this.timer = undefined;
    if(this.fingerprintIndex === this.fingerprints.length){
      this.finishWinnowing();
      this.sendLog('[ SCANNER ]: WFP Splitter finished...');
      console.log("Array length = ", this.fingerprints.length);
      console.log("Index = ", this.fingerprintIndex);
    }
  }

  private streamBufferFlush(): void {
    // Use a loop to make sure we read all currently available data
    while (this.continue && null !== (this.chunkDataRead = this.wfpStream.read(1 * 1024 * 1024))) {  // Read chunks of 1MB


      // Extract the first portion of the chunk until the first file=
      // Then append the chunk to the last fingerprint.
      if (!this.chunkDataRead.startsWith('file=')) {
        const chunkOfData = this.chunkDataRead.substring(0, this.chunkDataRead.indexOf('file='));
        this.fingerprints[this.fingerprints.length-1] += chunkOfData;
      }
      this.fingerprints = [...this.fingerprints, ...this.splitFingerprints(this.chunkDataRead)];
      this.sendFingerprints();
    }
  }

  private setStreamListeners() {
    this.wfpStream.on('readable', () => {
      this.streamBufferFlush();
    });

    this.wfpStream.on('end', () => {});
  }

  private splitFingerprints(chunkOfData:string): Array<string> {
    const reg = /file=/g;
    const blocksIndex = [...((chunkOfData).matchAll(reg))].map(x => x.index);
    const fingerprints = [];
    for (let i = 0; i < blocksIndex.length ; i++) {
      const fingerprint = chunkOfData.substring(blocksIndex[i], blocksIndex[i + 1]);
      fingerprints.push(fingerprint);
    }
    return fingerprints;
  }


}


