/* eslint-disable no-console */
// 2.0
import EventEmitter from "eventemitter3";
import os from "os";
import fs from "fs";
import { Dispatcher } from "./Dispatcher/Dispatcher";
import { DispatchableItem } from "./Dispatcher/DispatchableItem";
import { DispatcherResponse } from "./Dispatcher/DispatcherResponse";
import { ScannerCfg } from "./ScannerCfg";
import { ScannerEvents } from "./ScannerTypes";
import { WfpCalculator } from "./WfpProvider/WfpCalculator/WfpCalculator";
import { WfpSplitter } from "./WfpProvider/WfpSplitter/WfpSplitter";
import sortPaths from "sort-paths";
import { v4 as uuidv4 } from "uuid";
let finishPromiseResolve;
let finishPromiseReject;
export class Scanner extends EventEmitter {
    constructor(scannerCfg = new ScannerCfg()) {
        super();
        this.scannerCfg = scannerCfg;
        this.scannerId = new Date().getTime().toString();
    }
    init() {
        this.scanFinished = false;
        this.processingNewData = false;
        this.running = true;
        this.processedFiles = 0;
        this.responseBuffer = [];
        this.filesToScan = {};
        this.filesNotScanned = {};
        this.obfuscateMap = {};
        this.wfpProvider = new WfpCalculator(this.scannerCfg);
        this.dispatcher = new Dispatcher(this.scannerCfg);
        this.finishPromise = new Promise((resolve, reject) => {
            finishPromiseResolve = resolve;
            finishPromiseReject = reject;
        });
        this.setWinnowerListeners();
        this.setDispatcherListeners();
        if (this.workDirectory === undefined)
            this.setWorkDirectory(`${os.tmpdir()}/scanner-${this.getScannerId()}`);
    }
    setWorkDirectory(workDirectory) {
        this.workDirectory = workDirectory;
        this.resultFilePath = `${this.workDirectory}/result.json`;
        this.wfpFilePath = `${this.workDirectory}/winnowing.wfp`;
        this.obfuscateMapFilePath = `${this.workDirectory}/obfuscate.map`;
        if (!fs.existsSync(this.workDirectory))
            fs.mkdirSync(this.workDirectory);
        if (fs.existsSync(this.resultFilePath))
            throw new Error(`${this.resultFilePath}, already exist! Please remove this file and run the scanner again`);
        if (fs.existsSync(this.wfpFilePath))
            throw new Error(`${this.workDirectory}, already exist! Please remove this file and run the scanner again`);
    }
    getWorkDirectory() {
        return this.workDirectory;
    }
    cleanWorkDirectory() {
        if (fs.existsSync(this.resultFilePath))
            fs.unlinkSync(this.resultFilePath);
        if (fs.existsSync(this.wfpFilePath))
            fs.unlinkSync(this.wfpFilePath);
    }
    scan(scannerInput) {
        this.init();
        this.createOutputFiles();
        this.scannerInput = scannerInput;
        this.reportLog(`[ SCANNER ]: Scanner instance id ${this.getScannerId()}`);
        if (!this.isValidInput(scannerInput)) {
            this.finishScan();
            return this.finishPromise;
        }
        if (scannerInput[0]?.wfpPath) {
            this.wfpProvider = new WfpSplitter(this.scannerCfg);
            this.setWinnowerListeners();
            this.wfpProvider.start(scannerInput[0]);
        }
        else {
            const folderRoot = this.scannerInput[0].folderRoot;
            const winnowingMode = this.scannerInput[0]?.winnowing?.mode;
            const obfuscate = this.scannerCfg.WFP_OBFUSCATION;
            const fileList = this.scannerInput[0].fileList;
            this.wfpProvider.start({
                folderRoot,
                winnowingMode,
                fileList,
                obfuscate,
            });
        }
        return this.finishPromise;
    }
    getScannerId() {
        return this.scannerId;
    }
    stop() {
        this.reportLog(`[ SCANNER ]: Stopping scanner`);
        this.abort();
        finishPromiseResolve();
    }
    isRunning() {
        return this.running;
    }
    setWinnowerListeners() {
        this.wfpProvider.on(ScannerEvents.WINNOWING_NEW_CONTENT, (fingerprintPackage) => {
            this.emit(ScannerEvents.WINNOWING_NEW_CONTENT, fingerprintPackage);
            this.reportLog(`[ SCANNER ]: New WFP content`);
            if (fingerprintPackage.isObfuscated())
                this.obfuscateMap = {
                    ...this.obfuscateMap,
                    ...fingerprintPackage.getObfuscationMap(),
                };
            const item = new DispatchableItem();
            item.setFingerprintPackage(fingerprintPackage);
            item.uuid = uuidv4();
            if (this.scannerInput[0]?.engineFlags)
                item.setEngineFlags(this.scannerInput[0]?.engineFlags);
            if (this.scannerInput[0]?.sbom && this.scannerInput[0]?.sbomMode)
                item.setSbom(this.scannerInput[0]?.sbom, this.scannerInput[0]?.sbomMode);
            this.dispatcher.dispatchItem(item);
        });
        this.wfpProvider.on(ScannerEvents.WINNOWING_STATUS, (newFilesProcessed) => {
            this.emit(ScannerEvents.WINNOWING_STATUS, newFilesProcessed);
        });
        this.wfpProvider.on(ScannerEvents.WINNOWER_LOG, (msg) => {
            this.reportLog(msg);
        });
        this.wfpProvider.on(ScannerEvents.ERROR, (error) => {
            this.errorHandler(error, ScannerEvents.MODULE_WINNOWER);
        });
    }
    setDispatcherListeners() {
        this.dispatcher.on(ScannerEvents.DISPATCHER_QUEUE_SIZE_MAX_LIMIT, () => {
            this.reportLog(`[ SCANNER ]: Maximum queue size reached. Winnower will be paused`);
            this.wfpProvider.pause();
        });
        this.dispatcher.on(ScannerEvents.DISPATCHER_QUEUE_SIZE_MIN_LIMIT, () => {
            this.reportLog(`[ SCANNER ]: Minimum queue size reached. Winnower will be resumed`);
            this.wfpProvider.resume();
        });
        this.dispatcher.on(ScannerEvents.DISPATCHER_NEW_DATA, async (response) => {
            this.processedFiles += response.getNumberOfFilesScanned();
            this.reportLog(`[ SCANNER ]: Received results of ${response.getNumberOfFilesScanned()} files`);
            this.emit(ScannerEvents.DISPATCHER_NEW_DATA, response);
            this.insertIntoBuffer(response);
            if (this.bufferReachedLimit())
                this.bufferToFiles(); //Uses sync to ensure no new data is appended to the buffer
        });
        this.dispatcher.on(ScannerEvents.DISPATCHER_FINISHED, async () => {
            if (!this.wfpProvider.hasPendingFiles()) {
                await this.finishJob();
            }
        });
        this.dispatcher.on(ScannerEvents.DISPATCHER_ITEM_NO_DISPATCHED, (disptItem) => {
            const filesNotScanned = disptItem.getFingerprintPackage().getFilesFingerprinted();
            this.appendFilesToNotScanned(filesNotScanned);
        });
        this.dispatcher.on(ScannerEvents.DISPATCHER_LOG, (msg) => {
            this.reportLog(msg);
        });
        this.dispatcher.on(ScannerEvents.ERROR, (error, disptItem, response) => {
            const wfpContent = disptItem.getFingerprintPackage().getContent();
            const requestId = disptItem.uuid;
            let plainResponse = response ? response : "";
            const dump = `---Request ID Begin---\n${requestId}\n---Request ID End---\n` +
                `---WFP Begin---\n${wfpContent}\n---WFP End---\n` +
                `---Server Response Begin---\n${plainResponse}\n---Server Response End---\n`;
            `---Error Message Begin---\n${error.message}\n---Error Message End---\n`;
            const filePath = `${this.workDirectory}/bad_request-${this.scannerId}-${requestId}.txt`;
            fs.writeFileSync(filePath, dump, "utf8");
            error.message += `\n\nDebug file located at ${filePath}`;
            this.errorHandler(error, ScannerEvents.MODULE_DISPATCHER);
        });
    }
    appendFilesToNotScanned(fileList) {
        const obj = {};
        // eslint-disable-next-line no-restricted-syntax
        for (const file of fileList)
            obj[file] = this.filesToScan[file];
        Object.assign(this.filesNotScanned, obj);
        return this.filesNotScanned;
    }
    insertIntoBuffer(dispatcherResponse) {
        this.responseBuffer.push(dispatcherResponse);
    }
    isBufferEmpty() {
        return this.responseBuffer.length === 0;
    }
    bufferReachedLimit() {
        if (this.responseBuffer.length >= this.scannerCfg.MAX_RESPONSES_IN_BUFFER)
            return true;
        return false;
    }
    deobfuscationResponses(responses, obfuscateMap) {
        const deObfuscation = {};
        Object.entries(responses).forEach(([key, value]) => {
            deObfuscation[obfuscateMap[key]] = value;
        });
        return deObfuscation;
    }
    bufferToFiles() {
        let wfpContent = "";
        const serverResponse = {};
        // eslint-disable-next-line no-restricted-syntax
        for (const dispatcherResponse of this.responseBuffer) {
            wfpContent += dispatcherResponse.getWfpContent();
            const serverResponseToAppend = dispatcherResponse.getServerResponse();
            Object.assign(serverResponse, serverResponseToAppend);
        }
        this.appendOutputFiles(wfpContent, serverResponse);
        this.responseBuffer = [];
        const r = this.scannerCfg.WFP_OBFUSCATION && this.scannerCfg.RESULTS_DEOBFUSCATION
            ? this.deobfuscationResponses(serverResponse, this.obfuscateMap)
            : serverResponse;
        const responses = new DispatcherResponse(r, wfpContent);
        this.reportLog(`[ SCANNER ]: Persisted results of ${responses.getNumberOfFilesScanned()} files...`);
        this.emit(ScannerEvents.RESULTS_APPENDED, responses, this.filesNotScanned);
        return responses;
    }
    async finishJob() {
        this.scannerInput.shift();
        this.reportLog(`[ SCANNER ]: Job finished. ${this.scannerInput.length} pendings`);
        if (this.scannerInput.length) {
            if (this.scannerInput[0].wfpPath) {
                this.wfpProvider = new WfpSplitter();
                this.setWinnowerListeners();
                this.wfpProvider.start(this.scannerInput[0]);
            }
            else {
                const folderRoot = this.scannerInput[0].folderRoot;
                const winnowingMode = this.scannerInput[0]?.winnowing?.mode;
                const obfuscate = this.scannerCfg.WFP_OBFUSCATION;
                const fileList = this.scannerInput[0].fileList;
                this.wfpProvider.start({
                    folderRoot,
                    winnowingMode,
                    fileList,
                    obfuscate,
                });
            }
        }
        else
            await this.finishScan();
    }
    async finishScan() {
        if (!this.isBufferEmpty())
            this.bufferToFiles();
        const results = JSON.parse(await fs.promises.readFile(this.resultFilePath, "utf8"));
        if (this.scannerCfg.WFP_OBFUSCATION && this.scannerCfg.RESULTS_DEOBFUSCATION) {
            for (const key of Object.keys(this.obfuscateMap)) {
                const component = results[key];
                const originalPath = this.obfuscateMap[key];
                results[originalPath] = component;
                delete results[key];
            }
        }
        const sortedPaths = sortPaths(Object.keys(results), "/");
        const resultSorted = {};
        // eslint-disable-next-line no-restricted-syntax
        for (const key of sortedPaths)
            resultSorted[key] = results[key];
        await fs.promises.writeFile(this.resultFilePath, JSON.stringify(resultSorted, null, 2));
        await fs.promises.writeFile(this.obfuscateMapFilePath, JSON.stringify(this.obfuscateMap, null, 2));
        this.reportLog(`[ SCANNER ]: Scan finished (Scanned: ${this.processedFiles}, Not Scanned: ${Object.keys(this.filesNotScanned).length})`);
        this.reportLog(`[ SCANNER ]: Results on: ${this.resultFilePath}`);
        this.running = false;
        this.emit(ScannerEvents.SCAN_DONE, this.resultFilePath, this.filesNotScanned);
        finishPromiseResolve(this.resultFilePath);
    }
    reportLog(txt, level = "info") {
        this.emit(ScannerEvents.SCANNER_LOG, txt, level);
    }
    errorHandler(error, origin) {
        this.abort();
        if (origin === ScannerEvents.MODULE_DISPATCHER) {
        }
        if (origin === ScannerEvents.MODULE_WINNOWER) {
        }
        this.reportLog(`[ SCANNER ]: Error reason ${error}`);
        this.emit(ScannerEvents.ERROR, error);
        if (this.finishPromise)
            finishPromiseReject(error);
    }
    createOutputFiles() {
        if (!fs.existsSync(this.wfpFilePath))
            fs.writeFileSync(this.wfpFilePath, "");
        if (!fs.existsSync(this.resultFilePath))
            fs.writeFileSync(this.resultFilePath, JSON.stringify({}));
        if (this.scannerCfg.WFP_OBFUSCATION) {
            if (!fs.existsSync(this.obfuscateMapFilePath))
                fs.writeFileSync(this.obfuscateMapFilePath, JSON.stringify({}));
        }
    }
    appendOutputFiles(wfpContent, serverResponse) {
        fs.appendFileSync(this.wfpFilePath, wfpContent);
        const storedResultStr = fs.readFileSync(this.resultFilePath, "utf-8");
        const storedResultObj = JSON.parse(storedResultStr);
        Object.assign(storedResultObj, serverResponse);
        const newResultStr = JSON.stringify(storedResultObj);
        fs.writeFileSync(this.resultFilePath, newResultStr);
    }
    isValidInput(scannerInput) {
        if (!scannerInput) {
            this.reportLog("[ SCANNER ]: No input provided", "warning");
            return false;
        }
        if (!Array.isArray(scannerInput)) {
            this.reportLog("[ SCANNER ]: Input must be an array", "warning");
            return false;
        }
        if (!scannerInput.length) {
            this.reportLog("[ SCANNER ]: Input array is empty", "warning");
            return false;
        }
        if (scannerInput.some((input) => !input.fileList.length && !input.wfpPath)) {
            this.reportLog("[ SCANNER ]: Input array contains an element with no file list", "warning");
            return false;
        }
        return true;
    }
    abort() {
        this.running = false;
        this.wfpProvider.removeAllListeners();
        this.dispatcher.removeAllListeners();
        this.dispatcher.stop();
        this.wfpProvider.stop();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Nhbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZGsvc2Nhbm5lci9TY2FubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixNQUFNO0FBQ04sT0FBTyxZQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFFcEIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRXJELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFFLGFBQWEsRUFBZ0MsTUFBTSxnQkFBZ0IsQ0FBQztBQUk3RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDMUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRXBFLE9BQU8sU0FBUyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUUsRUFBRSxJQUFJLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUVwQyxJQUFJLG9CQUFvQixDQUFDO0FBQ3pCLElBQUksbUJBQW1CLENBQUM7QUFFeEIsTUFBTSxPQUFPLE9BQVEsU0FBUSxZQUFZO0lBdUN2QyxZQUFZLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRTtRQUN2QyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuRCxDQUFDO0lBRU0sSUFBSTtRQUNULElBQUks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