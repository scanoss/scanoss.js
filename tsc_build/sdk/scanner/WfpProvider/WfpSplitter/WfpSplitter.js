import { WfpProvider } from "../WfpProvider";
import fs from "fs";
import { ScannerCfg } from "../../ScannerCfg";
//Regex find paths from wfp string
export class WfpSplitter extends WfpProvider {
    constructor(scannerCfg = new ScannerCfg()) {
        super();
        this.scannerCfg = scannerCfg;
    }
    start(params) {
        this.sendLog('[ SCANNER ]: WFP Splitter starting...');
        this.init();
        this.pendingFiles = true;
        this.chunkDataRead = '';
        this.fingerprints = [];
        this.continue = true;
        this.fingerprintIndex = 0;
        this.ignoreFiles = new Set(params?.fileList);
        if (params.obfuscate)
            this.obfuscate = params.obfuscate;
        const wfpPath = params.wfpPath;
        if (!wfpPath)
            this.sendError('WFP path is not defined');
        this.wfpStream = fs.createReadStream(wfpPath, { encoding: 'utf8' });
        this.setStreamListeners();
        return this.finishPromise;
    }
    stop() {
        this.continue = false;
    }
    pause() {
        this.sendLog('[ SCANNER ]: WFP Splitter paused...');
        this.continue = false;
    }
    resume() {
        this.sendLog('[ SCANNER ]: WFP Splitter resumed...');
        this.continue = true;
        this.sendFingerprints();
        this.streamBufferFlush();
    }
    sendFingerprints() {
        //The timer allows the main thread not to be blocked while sending wfps
        if (this.timer === undefined) {
            this.timer = setInterval(() => {
                if (this.fingerprintIndex < this.fingerprints.length && this.continue) {
                    this.fingerprintPacker(this.fingerprints[this.fingerprintIndex]);
                    this.fingerprintIndex++;
                }
                else {
                    this.stopSendFingerprints();
                }
            });
        }
    }
    stopSendFingerprints() {
        clearInterval(this.timer);
        this.timer = undefined;
        if (this.fingerprintIndex === this.fingerprints.length) {
            this.finishWinnowing();
            this.sendLog('[ SCANNER ]: WFP Splitter finished...');
        }
    }
    streamBufferFlush() {
        let ignoreFirstChunkOfFingerprint = false;
        //Use a loop to make sure we read all currently available data
        while (this.continue && null !== (this.chunkDataRead = this.wfpStream.read(1 * 1024 * 1024))) { // Read chunks of 1MB 1*1024*1024
            /**** This part removes all the wfp that includes the paths inside this.ignoreFiles ****/
            if (this.ignoreFiles.size > 0) {
                // Removes fingerprints that are loose because the file=...... was removed in previous iteration
                if (ignoreFirstChunkOfFingerprint) { //TODO: Test this scenario
                    //If there is no file= delete everything then
                    if (this.chunkDataRead.indexOf("file=") >= 0) {
                        this.chunkDataRead = this.chunkDataRead.substring(this.chunkDataRead.indexOf('file='));
                        ignoreFirstChunkOfFingerprint = false;
                    }
                    else
                        this.chunkDataRead = "";
                }
                const rWfpPath = new RegExp(/^file=\w+,\d+,(?<path>.+)$/gm);
                //Search for paths in the wfp and compares with the ignorefiles set
                //When there is a match the matched fingerprint is deleted on the fly
                let result;
                while ((result = rWfpPath.exec(this.chunkDataRead)) !== null) {
                    if (this.ignoreFiles.has(result?.groups?.path)) {
                        const indexDeleteFrom = result.index;
                        //TODO: Verify this condition
                        //If there is no next file= in the string, remove until end.
                        let indexDeleteTo = this.chunkDataRead.indexOf('file=', indexDeleteFrom + 1);
                        if (indexDeleteTo < 0) {
                            indexDeleteTo = this.chunkDataRead.length;
                            //After the deletion of a wfp there are no other file=, so then set ignoreFirstChunkOfFingerprint to true.
                            //In the next iteration, the next chunk of data will be fingerprints without a file=. So, this first part will be discarded.
                            ignoreFirstChunkOfFingerprint = true;
                        }
                        const first = this.chunkDataRead.substring(0, indexDeleteFrom);
                        const second = this.chunkDataRead.substring(indexDeleteTo, this.chunkDataRead.length);
                        this.chunkDataRead = first + second;
                        rWfpPath.lastIndex = 0; //Make sure we reset the state of the regex.
                    }
                }
            }
            /**** This part removes all the wfp that includes the paths inside this.ignoreFiles ****/
            /**** This part process a chunk of wfp and send the packages to the subscriber ****/
            if (this.chunkDataRead.length) {
                // Extract the first portion of the chunk until the first file=
                // Then append the chunk to the last fingerprint.
                if (!this.chunkDataRead.startsWith('file=')) {
                    const chunkOfData = this.chunkDataRead.substring(0, this.chunkDataRead.indexOf('file='));
                    this.fingerprints[this.fingerprints.length - 1] += chunkOfData;
                }
                this.fingerprints = [...this.fingerprints, ...this.splitFingerprints(this.chunkDataRead)];
                this.sendFingerprints();
            }
            /**** This part process a chunk of wfp and send the packages to the subscriber ****/
        }
    }
    setStreamListeners() {
        this.wfpStream.on('readable', () => {
            this.streamBufferFlush();
        });
        this.wfpStream.on('end', () => { });
    }
    splitFingerprints(chunkOfData) {
        const reg = /file=/g;
        const blocksIndex = [...((chunkOfData).matchAll(reg))].map(x => x.index);
        const fingerprints = [];
        for (let i = 0; i < blocksIndex.length; i++) {
            const fingerprint = chunkOfData.substring(blocksIndex[i], blocksIndex[i + 1]);
            fingerprints.push(fingerprint);
        }
        return fingerprints;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ZwU3BsaXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2RrL3NjYW5uZXIvV2ZwUHJvdmlkZXIvV2ZwU3BsaXR0ZXIvV2ZwU3BsaXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFxQixXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNoRSxPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDcEIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRzlDLGtDQUFrQztBQUVsQyxNQUFNLE9BQU8sV0FBWSxTQUFRLFdBQVc7SUFnQjFDLFlBQVksVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFO1FBQ3ZDLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDL0IsQ0FBQztJQUVNLEtBQUssQ0FBQyxNQUF5QjtRQUVwQyxJQUFJLENBQUMsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7UUFFdEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM3QyxJQUFHLE1BQU0sQ0FBQyxTQUFTO1lBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBRXZELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFFL0IsSUFBSSxDQUFDLE9BQU87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