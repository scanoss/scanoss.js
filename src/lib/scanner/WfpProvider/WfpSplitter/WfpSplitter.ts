import { IWfpProviderInput, WfpProvider } from "../WfpProvider";
import fs from "fs";


import { Worker } from "worker_threads";
import { ScannerCfg } from "../../ScannerCfg";
import { Readable } from "stream";
import { fileURLToPath } from "url";

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
  } else {
    fingerprint = wfp_only_md5(
      scannableItem.content,
      scannableItem.contentSource
    );
  }

  scannableItem.fingerprint = fingerprint;

  parentPort.postMessage(scannableItem);
});
`

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
    this.init();
    this.isRunning = true;
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
    this.continue = false;
  }

  public resume(): void {
    this.sendLog('[ SCANNER ]: WFP Splitter resumed');
    this.continue = true;
    this.readStream();
  }


  private sendFingerprints() {
    this.timer = setInterval(() => {
      if(this.fingerprintIndex < this.fingerprints.length && this.continue) {
        this.fingerprintPacker(this.fingerprints[this.fingerprintIndex]);
        this.fingerprintIndex++;
      } else {
        this.stopSendFingerprints();
      }
    });
  }

  private stopSendFingerprints() {
    clearInterval(this.timer);
  }

  private readStream(): void {
    // Use a loop to make sure we read all currently available data
    while (this.continue && null !== (this.chunkDataRead = this.wfpStream.read(1 * 1024 * 1024))) {  // Read chunks of 1MB
      this.fingerprints = [...this.fingerprints, ...this.splitFingerprints(this.chunkDataRead)];
      this.sendFingerprints();
    }
  }

  private setStreamListeners() {
    // 'readable' may be triggered multiple times as data is buffered in
    this.wfpStream.on('readable', () => {
      this.readStream();
    });


    // 'end' will be triggered once when there is no more data available
    this.wfpStream.on('end', () => {
      console.log('Reached end of stream.');
    });
  }

  private splitFingerprints(chunkOfData:string): Array<string> {
    const reg = /file=/g;
    const blocksIndex = [...((chunkOfData).matchAll(reg))].map(x => x.index);

    const fingerprints = [];
    for (let i = 0; i < blocksIndex.length - 1; i++) {
      const fingerprint = chunkOfData.substring(blocksIndex[i], blocksIndex[i + 1]);
      fingerprints.push(fingerprint);
    }

    return fingerprints;

  }


}


