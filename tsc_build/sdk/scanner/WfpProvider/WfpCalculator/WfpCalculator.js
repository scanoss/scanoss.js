import fs from "fs";
import { Worker } from "worker_threads";
import { ScannableItem } from "../../Scannable/ScannableItem";
import { ScannerCfg } from "../../ScannerCfg";
import { ScannerEvents } from "../../ScannerTypes";
import { FingerprintPackage } from "../FingerprintPackage";
import { WfpProvider } from "../WfpProvider";
// @ts-ignore
import WfpCalculatorWorker from "./WfpCalculator.worker.js";
export class WfpCalculator extends WfpProvider {
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
            if (this.fileList[this.fileListIndex] === lastFileWinnowed)
                this.fileListIndex += 1;
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
    async readFile(path) {
        if (!(await this.isFileGreaterThanLimit(path))) {
            return await fs.promises.readFile(path);
        }
        return Buffer.alloc(0);
    }
    async isFileGreaterThanLimit(path) {
        const stats = await fs.promises.stat(path);
        const fileSizeInBytes = stats.size;
        const fileSizeInGB = fileSizeInBytes / (1024 * 1024 * 1024); // Convert bytes to gigabytes
        return fileSizeInGB >= 2;
    }
    async nextStepMachine() {
        if (!this.continue)
            return;
        const scannableItem = await this.getNextScannableItem();
        if (scannableItem) {
            this.sendLog(`[ SCANNER ]: WFP Calculator initialized: File=${scannableItem.getContentSource()}`);
            this.worker.postMessage(scannableItem);
        }
        else {
            this.finishWinnowing();
            this.forceStopWorker();
            this.sendLog("[ SCANNER ]: WFP Calculator finished...");
        }
    }
    start(params) {
        if (!params.fileList)
            this.sendError("File list is required");
        this.sendLog("[ SCANNER ]: WFP Calculator starting...");
        this.init();
        this.prepareWorker();
        if (params.winnowingMode)
            this.setWinnowingMode(params.winnowingMode);
        if (params.obfuscate)
            this.obfuscate = params.obfuscate;
        this.pendingFiles = true;
        this.folderRoot = params.folderRoot;
        this.fileList = params.fileList;
        this.nextStepMachine();
        return this.finishPromise;
    }
    pause() {
        this.sendLog("[ SCANNER ]: WFP Calculator paused...");
        this.continue = false;
    }
    resume() {
        this.sendLog("[ SCANNER ]: WFP Calculator resumed...");
        this.continue = true;
        this.recoveryIndex();
        this.nextStepMachine();
    }
    stop() {
        this.continue = false;
        this.pendingFiles = false;
        this.forceStopWorker();
        this.prepareWorker();
        this.init();
    }
    processPackedWfp(content) {
        const fingerprint = new FingerprintPackage(content, this.folderRoot);
        this.sendFingerprint(fingerprint);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ZwQ2FsY3VsYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zZGsvc2Nhbm5lci9XZnBQcm92aWRlci9XZnBDYWxjdWxhdG9yL1dmcENhbGN1bGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3BCLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxhQUFhLEVBQStCLE1BQU0sb0JBQW9CLENBQUM7QUFFaEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDM0QsT0FBTyxFQUFxQixXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVoRSxhQUFhO0FBQ2IsT0FBTyxtQkFBbUIsTUFBTSwyQkFBMkIsQ0FBQztBQUU1RCxNQUFNLE9BQU8sYUFBYyxTQUFRLFdBQVc7SUFPNUMsWUFBWSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUU7UUFDdkMsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUMvQixDQUFDO0lBRUQsSUFBSTtRQUNGLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxhQUFhO1FBQ1gsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FB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