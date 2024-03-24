/* eslint-disable no-console */
// 2.0
import EventEmitter from 'eventemitter3';
import os from 'os';
import fs from 'fs';
import { Dispatcher } from './Dispatcher/Dispatcher';
import { DispatchableItem } from './Dispatcher/DispatchableItem';
import { DispatcherResponse } from './Dispatcher/DispatcherResponse';
import { ScannerCfg } from './ScannerCfg';
import { ScannerEvents } from './ScannerTypes';
import { WfpCalculator } from './WfpProvider/WfpCalculator/WfpCalculator';
import { WfpSplitter } from './WfpProvider/WfpSplitter/WfpSplitter';
import sortPaths from 'sort-paths';
import { v4 as uuidv4 } from 'uuid';
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
            console.log("ScannerEvents.DISPATCHER_NEW_DATA");
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
            const filesNotScanned = disptItem
                .getFingerprintPackage()
                .getFilesFingerprinted();
            this.appendFilesToNotScanned(filesNotScanned);
        });
        this.dispatcher.on(ScannerEvents.DISPATCHER_LOG, (msg) => {
            this.reportLog(msg);
        });
        this.dispatcher.on(ScannerEvents.ERROR, (error, disptItem, response) => {
            const wfpContent = disptItem.getFingerprintPackage().getContent();
            const requestId = disptItem.uuid;
            let plainResponse = response ? response : '';
            const dump = `---Request ID Begin---\n${requestId}\n---Request ID End---\n` +
                `---WFP Begin---\n${wfpContent}\n---WFP End---\n` +
                `---Server Response Begin---\n${plainResponse}\n---Server Response End---\n`;
            `---Error Message Begin---\n${error.message}\n---Error Message End---\n`;
            const filePath = `${this.workDirectory}/bad_request-${this.scannerId}-${requestId}.txt`;
            fs.writeFileSync(filePath, dump, 'utf8');
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
        let wfpContent = '';
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
        const results = JSON.parse(await fs.promises.readFile(this.resultFilePath, 'utf8'));
        if (this.scannerCfg.WFP_OBFUSCATION &&
            this.scannerCfg.RESULTS_DEOBFUSCATION) {
            for (const key of Object.keys(this.obfuscateMap)) {
                const component = results[key];
                const originalPath = this.obfuscateMap[key];
                results[originalPath] = component;
                delete results[key];
            }
        }
        const sortedPaths = sortPaths(Object.keys(results), '/');
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
    reportLog(txt, level = 'info') {
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
            fs.writeFileSync(this.wfpFilePath, '');
        if (!fs.existsSync(this.resultFilePath))
            fs.writeFileSync(this.resultFilePath, JSON.stringify({}));
        if (this.scannerCfg.WFP_OBFUSCATION) {
            if (!fs.existsSync(this.obfuscateMapFilePath))
                fs.writeFileSync(this.obfuscateMapFilePath, JSON.stringify({}));
        }
    }
    appendOutputFiles(wfpContent, serverResponse) {
        fs.appendFileSync(this.wfpFilePath, wfpContent);
        const storedResultStr = fs.readFileSync(this.resultFilePath, 'utf-8');
        const storedResultObj = JSON.parse(storedResultStr);
        Object.assign(storedResultObj, serverResponse);
        const newResultStr = JSON.stringify(storedResultObj);
        fs.writeFileSync(this.resultFilePath, newResultStr);
    }
    isValidInput(scannerInput) {
        if (!scannerInput) {
            this.reportLog('[ SCANNER ]: No input provided', 'warning');
            return false;
        }
        if (!Array.isArray(scannerInput)) {
            this.reportLog('[ SCANNER ]: Input must be an array', 'warning');
            return false;
        }
        if (!scannerInput.length) {
            this.reportLog('[ SCANNER ]: Input array is empty', 'warning');
            return false;
        }
        if (scannerInput.some((input) => !input.fileList.length && !input.wfpPath)) {
            this.reportLog('[ SCANNER ]: Input array contains an element with no file list', 'warning');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Nhbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZGsvc2Nhbm5lci9TY2FubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixNQUFNO0FBQ04sT0FBTyxZQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFFcEIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRXJELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDMUMsT0FBTyxFQUFFLGFBQWEsRUFBZ0MsTUFBTSxnQkFBZ0IsQ0FBQztBQUk3RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDMUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRXBFLE9BQU8sU0FBUyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUUsRUFBRSxJQUFJLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUVwQyxJQUFJLG9CQUFvQixDQUFDO0FBQ3pCLElBQUksbUJBQW1CLENBQUM7QUFFeEIsTUFBTSxPQUFPLE9BQVEsU0FBUSxZQUFZO0lBdUN2QyxZQUFZLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRTtRQUN2QyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuRCxDQUFDO0lBRU0sSUFBSTtRQUNULElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7UUFFdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuRCxvQkFBb0IsR0FBRyxPQUFPLENBQUM7WUFDL0IsbUJBQW1CLEdBQUcsTUFBTSxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFFOUIsSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVM7WUFDbEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxZQUFZLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVNLGdCQUFnQixDQUFDLGFBQXFCO1FBQzNDLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxjQUFjLENBQUM7UUFDMUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLGdCQUFnQixDQUFDO1FBQ3pELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLGdCQUFnQixDQUFDO1FBRWxFLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7WUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN6RSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUNwQyxNQUFNLElBQUksS0FBSyxDQUNiLEdBQUcsSUFBSSxDQUFDLGNBQWMsb0VBQW9FLENBQzNGLENBQUM7UUFDSixJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNqQyxNQUFNLElBQUksS0FBSyxDQUNiLEdBQUcsSUFBSSxDQUFDLGFBQWEsb0VBQW9FLENBQzFGLENBQUM7SUFDTixDQUFDO0lBRU0sZ0JBQWdCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QixDQUFDO0lBRU0sa0JBQWtCO1FBQ3ZCLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDM0UsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7WUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRU0sSUFBSSxDQUFDLFlBQWlDO1FBQzNDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBRWpDLElBQUksQ0FBQyxTQUFTLENBQUMsb0NBQW9DLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFMUUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDcEMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztTQUMzQjtRQUVELElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRTtZQUM1QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN6QzthQUFNO1lBQ0wsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFDbkQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDO1lBQzVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDO1lBQ2xELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1lBQy9DLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO2dCQUNyQixVQUFVO2dCQUNWLGFBQWE7Z0JBQ2IsUUFBUTtnQkFDUixTQUFTO2FBQ1YsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDNUIsQ0FBQztJQUVNLFlBQVk7UUFDakIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFFTSxJQUFJO1FBQ1QsSUFBSSxDQUFDLFNBQVMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNiLG9CQUFvQixFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVNLFNBQVM7UUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUVPLG9CQUFvQjtRQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FDakIsYUFBYSxDQUFDLHFCQUFxQixFQUNuQyxDQUFDLGtCQUFzQyxFQUFFLEVBQUU7WUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMsU0FBUyxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFFL0MsSUFBSSxrQkFBa0IsQ0FBQyxZQUFZLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxZQUFZLEdBQUc7b0JBQ2xCLEdBQUcsSUFBSSxDQUFDLFlBQVk7b0JBQ3BCLEdBQUcsa0JBQWtCLENBQUMsaUJBQWlCLEVBQUU7aUJBQzFDLENBQUM7WUFDSixNQUFNLElBQUksR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLEVBQUUsQ0FBQztZQUVyQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVztnQkFDbkMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBRXpELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRO2dCQUM5RCxJQUFJLENBQUMsT0FBTyxDQUNWLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FDL0IsQ0FBQztZQUVKLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FDRixDQUFDO1FBRUYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtZQUN4RSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQy9ELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ3RELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDakQsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzFELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLHNCQUFzQjtRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsK0JBQStCLEVBQUUsR0FBRyxFQUFFO1lBQ3JFLElBQUksQ0FBQyxTQUFTLENBQ1osa0VBQWtFLENBQ25FLENBQUM7WUFDRixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLCtCQUErQixFQUFFLEdBQUcsRUFBRTtZQUNyRSxJQUFJLENBQUMsU0FBUyxDQUNaLG1FQUFtRSxDQUNwRSxDQUFDO1lBQ0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUNoQixhQUFhLENBQUMsbUJBQW1CLEVBQ2pDLEtBQUssRUFBRSxRQUE0QixFQUFFLEVBQUU7WUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO1lBQ2hELElBQUksQ0FBQyxjQUFjLElBQUksUUFBUSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDMUQsSUFBSSxDQUFDLFNBQVMsQ0FDWixvQ0FBb0MsUUFBUSxDQUFDLHVCQUF1QixFQUFFLFFBQVEsQ0FDL0UsQ0FBQztZQUNGLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQywyREFBMkQ7UUFDbEgsQ0FBQyxDQUNGLENBQUM7UUFFRixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDL0QsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLEVBQUU7Z0JBQ3ZDLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQ3hCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FDaEIsYUFBYSxDQUFDLDZCQUE2QixFQUMzQyxDQUFDLFNBQTJCLEVBQUUsRUFBRTtZQUM5QixNQUFNLGVBQWUsR0FBRyxTQUFTO2lCQUM5QixxQkFBcUIsRUFBRTtpQkFDdkIscUJBQXFCLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUNGLENBQUM7UUFFRixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUNoQixhQUFhLENBQUMsS0FBSyxFQUNuQixDQUFDLEtBQVksRUFBRSxTQUEyQixFQUFFLFFBQWdCLEVBQUUsRUFBRTtZQUM5RCxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNsRSxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBRWpDLElBQUksYUFBYSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFN0MsTUFBTSxJQUFJLEdBQ1IsMkJBQTJCLFNBQVMsMEJBQTBCO2dCQUM5RCxvQkFBb0IsVUFBVSxtQkFBbUI7Z0JBQ2pELGdDQUFnQyxhQUFhLCtCQUErQixDQUFDO1lBQy9FLDhCQUE4QixLQUFLLENBQUMsT0FBTyw2QkFBNkIsQ0FBQztZQUV6RSxNQUFNLFFBQVEsR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLGdCQUFnQixJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsTUFBTSxDQUFDO1lBQ3hGLEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV6QyxLQUFLLENBQUMsT0FBTyxJQUFJLDZCQUE2QixRQUFRLEVBQUUsQ0FBQztZQUN6RCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM1RCxDQUFDLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFFTyx1QkFBdUIsQ0FBQyxRQUFRO1FBQ3RDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNmLGdEQUFnRDtRQUNoRCxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVE7WUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDekMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQzlCLENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxrQkFBa0I7UUFDekMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRU8sYUFBYTtRQUNuQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU8sa0JBQWtCO1FBQ3hCLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUI7WUFDdkUsT0FBTyxJQUFJLENBQUM7UUFDZCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFTyxzQkFBc0IsQ0FDNUIsU0FBOEIsRUFDOUIsWUFBb0M7UUFFcEMsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFnQixFQUFFLEVBQUU7WUFDaEUsYUFBYSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sYUFBYSxDQUFDO0lBQ3ZCLENBQUM7SUFFTyxhQUFhO1FBQ25CLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNwQixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDMUIsZ0RBQWdEO1FBQ2hELEtBQUssTUFBTSxrQkFBa0IsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3BELFVBQVUsSUFBSSxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNqRCxNQUFNLHNCQUFzQixHQUFHLGtCQUFrQixDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDdEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztTQUN2RDtRQUVELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDekIsTUFBTSxDQUFDLEdBQ0wsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUI7WUFDdEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUNoRSxDQUFDLENBQUMsY0FBYyxDQUFDO1FBQ3JCLE1BQU0sU0FBUyxHQUFHLElBQUksa0JBQWtCLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxTQUFTLENBQ1oscUNBQXFDLFNBQVMsQ0FBQyx1QkFBdUIsRUFBRSxXQUFXLENBQ3BGLENBQUM7UUFDRixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzNFLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFTyxLQUFLLENBQUMsU0FBUztRQUNyQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxTQUFTLENBQ1osOEJBQThCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxXQUFXLENBQ2xFLENBQUM7UUFFRixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFO1lBQzVCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDckMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM5QztpQkFBTTtnQkFDTCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztnQkFDbkQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDO2dCQUM1RCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQztnQkFDbEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO29CQUNyQixVQUFVO29CQUNWLGFBQWE7b0JBQ2IsUUFBUTtvQkFDUixTQUFTO2lCQUNWLENBQUMsQ0FBQzthQUNKO1NBQ0Y7O1lBQU0sTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVPLEtBQUssQ0FBQyxVQUFVO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2hELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQ3hCLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FDeEQsQ0FBQztRQUVGLElBQ0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlO1lBQy9CLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQ3JDO1lBQ0EsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDaEQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsU0FBUyxDQUFDO2dCQUNsQyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNyQjtTQUNGO1FBRUQsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDekQsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLGdEQUFnRDtRQUNoRCxLQUFLLE1BQU0sR0FBRyxJQUFJLFdBQVc7WUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQ3pCLElBQUksQ0FBQyxjQUFjLEVBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FDdEMsQ0FBQztRQUNGLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQ3pCLElBQUksQ0FBQyxvQkFBb0IsRUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FDM0MsQ0FBQztRQUNGLElBQUksQ0FBQyxTQUFTLENBQ1osd0NBQ0UsSUFBSSxDQUFDLGNBQ1Asa0JBQWtCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUM5RCxDQUFDO1FBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyw0QkFBNEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksQ0FDUCxhQUFhLENBQUMsU0FBUyxFQUN2QixJQUFJLENBQUMsY0FBYyxFQUNuQixJQUFJLENBQUMsZUFBZSxDQUNyQixDQUFDO1FBQ0Ysb0JBQW9CLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFTyxTQUFTLENBQUMsR0FBRyxFQUFFLEtBQUssR0FBRyxNQUFNO1FBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVPLFlBQVksQ0FBQyxLQUFLLEVBQUUsTUFBTTtRQUNoQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDYixJQUFJLE1BQU0sS0FBSyxhQUFhLENBQUMsaUJBQWlCLEVBQUU7U0FDL0M7UUFDRCxJQUFJLE1BQU0sS0FBSyxhQUFhLENBQUMsZUFBZSxFQUFFO1NBQzdDO1FBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUVyRCxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEMsSUFBSSxJQUFJLENBQUMsYUFBYTtZQUFFLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFTyxpQkFBaUI7UUFDdkIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNsQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUNyQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTVELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUU7WUFDbkMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO2dCQUMzQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDbkU7SUFDSCxDQUFDO0lBRU8saUJBQWlCLENBQ3ZCLFVBQWtCLEVBQ2xCLGNBQThCO1FBRTlCLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVoRCxNQUFNLGVBQWUsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNwRCxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUMvQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JELEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU8sWUFBWSxDQUFDLFlBQWlDO1FBQ3BELElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQ0FBZ0MsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM1RCxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQ0FBcUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNqRSxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUU7WUFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQ0FBbUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMvRCxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsSUFDRSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUN0RTtZQUNBLElBQUksQ0FBQyxTQUFTLENBQ1osZ0VBQWdFLEVBQ2hFLFNBQVMsQ0FDVixDQUFDO1lBQ0YsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLEtBQUs7UUFDWCxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxQixDQUFDO0NBQ0YifQ==