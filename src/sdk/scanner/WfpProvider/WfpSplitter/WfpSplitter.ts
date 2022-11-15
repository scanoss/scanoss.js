import { IWfpProviderInput, WfpProvider } from "../WfpProvider";
import fs from "fs";
import { ScannerCfg } from "../../ScannerCfg";
import { Readable } from "stream";

//Regex find paths from wfp string

export class WfpSplitter extends WfpProvider {

  private continue: boolean;

  private wfpStream: Readable;

  private chunkDataRead: string;

  private fingerprints: Array<string>;

  private fingerprintIndex: number;

  private timer: ReturnType<typeof setTimeout>;

  private ignoreFiles: Set<string>;

  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.scannerCfg = scannerCfg;
  }

  public start(params: IWfpProviderInput): Promise<void> {

    this.sendLog('[ SCANNER ]: WFP Splitter starting...');

    this.init();
    this.pendingFiles = true;
    this.chunkDataRead = '';
    this.fingerprints = [];
    this.continue = true;
    this.fingerprintIndex = 0;
    this.ignoreFiles = new Set(params.fileList);

    const wfpPath = params.wfpPath;

    if (!wfpPath) this.sendError('WFP path is not defined');

    this.wfpStream = fs.createReadStream(wfpPath, { encoding: 'utf8' });
    this.setStreamListeners();

    return this.finishPromise;
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
    //The timer allows the main thread not to be blocked while sending wfps
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
    }
  }

  private streamBufferFlush(): void {

    let ignoreFirstChunkOfFingerprint = false;


    //Use a loop to make sure we read all currently available data
    while (this.continue && null !== (this.chunkDataRead = this.wfpStream.read(300))) {  // Read chunks of 1MB 1*1024*1024

      // Removes fingerprints that are loose because the file=...... was removed in previous iteration
      if (ignoreFirstChunkOfFingerprint) { //TODO: Test this scenario
        //If there is no file= delete everything then
        if (this.chunkDataRead.indexOf("file=") >= 0) {
          this.chunkDataRead = this.chunkDataRead.substring(this.chunkDataRead.indexOf('file='));
          ignoreFirstChunkOfFingerprint = false;
        } else this.chunkDataRead = "";
      }

      /**** This part removes all the wfp that includes the paths inside this.ignoreFiles ****/
      const rWfpPath = new RegExp(/^file=\w+,\d+,(?<path>.+)$/gm)
      //Search for paths in the wfp and compares with the ignorefiles set
      //When there is a match the matched fingerprint is deleted on the fly
      let result;
      while((result = rWfpPath.exec(this.chunkDataRead)) !== null) {
        if (this.ignoreFiles.has(result?.groups?.path)) {
          const indexDeleteFrom = result.index

          //TODO: Verify this condition
          //If there is no next file= in the string, remove until end.
          let indexDeleteTo = this.chunkDataRead.indexOf('file=', indexDeleteFrom+1)
          if (indexDeleteTo < 0) {
            indexDeleteTo = this.chunkDataRead.length;

            //After the deletion of a wfp there are no other file=, so then set ignoreFirstChunkOfFingerprint to true.
            //In the next iteration, the next chunk of data will be fingerprints without a file=. So, this first part will be discarded.
            ignoreFirstChunkOfFingerprint = true;
          }

          const first = this.chunkDataRead.substring(0,indexDeleteFrom);
          const second = this.chunkDataRead.substring(indexDeleteTo, this.chunkDataRead.length);
          this.chunkDataRead = first + second;
          rWfpPath.lastIndex = 0; //Make sure we reset the state of the regex.
        }
      }
      /**** This part removes all the wfp that includes the paths inside this.ignoreFiles ****/



      /**** This part process a chunk of wfp and send the packages to the subscriber ****/
      if(this.chunkDataRead.length){

        // Extract the first portion of the chunk until the first file=
        // Then append the chunk to the last fingerprint.
        if (!this.chunkDataRead.startsWith('file=') ) {
          const chunkOfData = this.chunkDataRead.substring(0, this.chunkDataRead.indexOf('file='));
          this.fingerprints[this.fingerprints.length-1] += chunkOfData;
        }

        this.fingerprints = [...this.fingerprints, ...this.splitFingerprints(this.chunkDataRead)];
        this.sendFingerprints();
      }
      /**** This part process a chunk of wfp and send the packages to the subscriber ****/

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


