/* eslint-disable no-console */
// 2.0
import EventEmitter from 'eventemitter3';
import os from 'os';
import fs from 'fs';
import readline from 'readline';

import { Dispatcher } from './Dispatcher/Dispatcher';

import { DispatchableItem } from './Dispatcher/DispatchableItem';
import { DispatcherResponse } from './Dispatcher/DispatcherResponse';
import { ScannerCfg } from './ScannerCfg';
import { BaseConfig } from '../BaseConfig';
import {
  ContentScannerInput, SbomMode, ScannerComponent,
  ScannerEvents,
  ScannerInput,
  ScannerResults
} from "./ScannerTypes";

import { WfpProvider } from './WfpProvider/WfpProvider';
import { FingerprintPackage } from './WfpProvider/FingerprintPackage';
import { WfpCalculator } from './WfpProvider/WfpCalculator/WfpCalculator';
import { WfpSplitter } from './WfpProvider/WfpSplitter/WfpSplitter';

import sortPaths from 'sort-paths';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { Settings } from "./ScannnerResultPostProcessor/interfaces/types";
import {
  ScannerResultsRuleFactory
} from "./ScannnerResultPostProcessor/rules/rule-factory";
import { RemoveRule } from "./ScannnerResultPostProcessor/rules/remove-rule";
import { validateSettingsFile } from "../../cli/commands/helpers";
import { logger } from "../Logger/Logger";

let finishPromiseResolve;
let finishPromiseReject;

export class Scanner extends EventEmitter {

  private readonly SCAN_FOLDER_NAME = 'scanner';


  private scannerCfg: ScannerCfg;

  private workDirectory: string;

  private resultFilePath: string;

  private wfpFilePath: string;

  private obfuscateMapFilePath: string;

  private obfuscateMap: Record<string, string>;

  private scanRoot: string;

  private scannerId: string;

  private wfpProvider: WfpProvider;

  private dispatcher: Dispatcher;

  private finishPromise: Promise<string>;

  private scannerInput: Array<ScannerInput>;

  private scanFinished: boolean; // Both flags are used to prevent a race condition between DISPATCHER.NEW_DATA and DISPATCHER_FINISHED

  private processingNewData: boolean; // Both flags are used to prevent a race condition between DISPATCHER.NEW_DATA and DISPATCHER_FINISHED

  private processedFiles: number;

  private running: boolean;

  private filesToScan;

  private responseBuffer;

  private filesNotScanned;

  private settings: Settings;

  private wfpWriteStream: fs.WriteStream;

  private resultWriteStream: fs.WriteStream;


  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.scannerCfg = scannerCfg;
    this.scannerId = new Date().getTime().toString();
  }

  private getScanFolderId(){
    return `${this.SCAN_FOLDER_NAME}-${this.getScannerId()}`;
  }

  private async removeWorkingDir(){
    try {
      await fs.promises.rm(this.workDirectory,{ recursive: true , force: true });
    }catch(e) {
      this.reportLog(`[ SCANNER ]: Unable to remove Working Dir: ${this.workDirectory}`);
    }
  }

  public init() {
    this.scanFinished = false;
    this.processingNewData = false;
    this.running = true;
    this.processedFiles = 0;
    this.responseBuffer = [];
    this.filesToScan = {};
    this.filesNotScanned = {};
    this.obfuscateMap = {};

    // Use premium URL if API KEY is set and not API URL was set.
   // this.scannerCfg.API_URL = BaseConfig.resolveScannerUrl(this.scannerCfg.API_KEY, this.scannerCfg.API_URL);

    this.wfpProvider = new WfpCalculator(this.scannerCfg);
    this.dispatcher = new Dispatcher(this.scannerCfg);

    this.finishPromise = new Promise((resolve, reject) => {
      finishPromiseResolve = resolve;
      finishPromiseReject = reject;
    });

    this.setWinnowerListeners();
    this.setDispatcherListeners();

    if (this.workDirectory === undefined)
      this.setWorkDirectory(`${os.tmpdir()}/${this.getScanFolderId()}`);
  }

  public setWorkDirectory(workDirectory: string) {
    this.workDirectory = workDirectory;
    this.resultFilePath = `${this.workDirectory}/result.json`;
    this.wfpFilePath = `${this.workDirectory}/winnowing.wfp`;
    this.obfuscateMapFilePath = `${this.workDirectory}/obfuscate.map`;

    if (!fs.existsSync(this.workDirectory)) fs.mkdirSync(this.workDirectory);
    if (fs.existsSync(this.resultFilePath))
      throw new Error(
        `${this.resultFilePath}, already exist! Please remove this file and run the scanner again`
      );
    if (fs.existsSync(this.wfpFilePath))
      throw new Error(
        `${this.workDirectory}, already exist! Please remove this file and run the scanner again`
      );
  }

  public getWorkDirectory(): string {
    return this.workDirectory;
  }

  public cleanWorkDirectory(): void {
    if (fs.existsSync(this.resultFilePath)) fs.unlinkSync(this.resultFilePath);
    if (fs.existsSync(this.wfpFilePath)) fs.unlinkSync(this.wfpFilePath);
  }

  public async scan(scannerInput: Array<ScannerInput>):Promise<string> {

    this.init();
    this.createOutputFiles();
    this.scannerInput = scannerInput;
    this.settings = scannerInput[0]?.settings ?  { ...scannerInput[0].settings } : null;

    if (scannerInput[0]?.settings) {
      scannerInput.forEach((si)=>{
        validateSettingsFile(si.settings);
        let components = [];
        const { bom } = si.settings;
        const sbomMode = bom?.include && bom.include.length > 0
          ? SbomMode.SBOM_IDENTIFY : undefined;

        // Only use ignore if include isn't present
        if (bom?.include?.length) {
          components = bom.include.map(item => ({ purl: item.purl }));
        }
        // Set legacy BOM
        si.sbom = JSON.stringify({ components });
        si.sbomMode = sbomMode;
      });
    }

    this.reportLog(`[ SCANNER ]: Scanner instance id ${this.getScannerId()}`);

    if (!this.isValidInput(scannerInput)) {
      this.finishScan();
      return this.finishPromise;
    }

    if (scannerInput[0]?.wfpPath) {
      this.wfpProvider = new WfpSplitter(this.scannerCfg);
      this.setWinnowerListeners();
      this.wfpProvider.start(scannerInput[0]);
    } else {
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

  /**
   * Scans the provided content.
   *
   * @param {ContentScannerInput} contentScannerInput - The input containing content and file name.
   * @param {string} contentScannerInput.content - The content to be scanned.
   * @param {string} contentScannerInput.key - Unique key to be referenced on scan result .
   * @returns {Promise<ScannerComponent | null>} - The scan result as a `ScannerComponent` or `null` if no content is provided.
   *
   * @throws {Error} - Throws an error if there is an issue during the scan.
   *
   * */
  public async scanContents(contentScannerInput: ContentScannerInput):Promise<ScannerComponent | null> {
      if (!contentScannerInput.content) {
        this.reportLog('[ SCANNER ]: No input provided', 'warning');
        return null;
      }
      const workingDir = `${os.tmpdir()}/${this.getScanFolderId()}`;
      this.setWorkDirectory(workingDir);
      this.workDirectory = workingDir;

      await fs.promises.writeFile(`${workingDir}/${contentScannerInput.key}`, contentScannerInput.content, 'utf-8');

      const rootPath = path.resolve(`${workingDir}/${contentScannerInput.key}`);

      // Build the input for a common scan
      const scannerInput: ScannerInput = {
        folderRoot: workingDir,
        fileList: [rootPath],
      };
      const input = {...contentScannerInput, ...scannerInput};

      // Perform a common scan
      const resultPath = await this.scan([input]);

      const results  = JSON.parse(await fs.promises.readFile(resultPath, 'utf-8')) as ScannerComponent;

      // Only removes working dir on scan content
      await this.removeWorkingDir();

      return results;
  }

  public getScannerId() {
    return this.scannerId;
  }

  public stop() {
    this.reportLog(`[ SCANNER ]: Stopping scanner`);
    this.abort();
    finishPromiseResolve();
  }

  public isRunning() {
    return this.running;
  }

  private setWinnowerListeners() {
    this.wfpProvider.on(
      ScannerEvents.WINNOWING_NEW_CONTENT,
      (fingerprintPackage: FingerprintPackage) => {
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

        if (this.scannerInput[0]?.sc)
          item.setSc(this.scannerInput[0]?.sc);

        if (this.scannerInput[0]?.context)
          item.setContext(this.scannerInput[0]?.context);

        if (this.scannerInput[0]?.sbom && this.scannerInput[0]?.sbomMode)
          item.setSbom(
            this.scannerInput[0]?.sbom,
            this.scannerInput[0]?.sbomMode
          );

        this.dispatcher.dispatchItem(item);
      }
    );

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

  private setDispatcherListeners() {
    this.dispatcher.on(ScannerEvents.DISPATCHER_QUEUE_SIZE_MAX_LIMIT, () => {
      this.reportLog(
        `[ SCANNER ]: Maximum queue size reached. Winnower will be paused`
      );
      this.wfpProvider.pause();
    });

    this.dispatcher.on(ScannerEvents.DISPATCHER_QUEUE_SIZE_MIN_LIMIT, () => {
      this.reportLog(
        `[ SCANNER ]: Minimum queue size reached. Winnower will be resumed`
      );
      this.wfpProvider.resume();
    });

    this.dispatcher.on(
      ScannerEvents.DISPATCHER_NEW_DATA,
      async (response: DispatcherResponse) => {
        this.processedFiles += response.getNumberOfFilesScanned();
        this.reportLog(
          `[ SCANNER ]: Received results of ${response.getNumberOfFilesScanned()} files`
        );
        this.emit(ScannerEvents.DISPATCHER_NEW_DATA, response);
        this.insertIntoBuffer(response);
        if (this.bufferReachedLimit()) this.bufferToFiles(); //Uses sync to ensure no new data is appended to the buffer
      }
    );

    this.dispatcher.on(ScannerEvents.DISPATCHER_FINISHED, async () => {
      if (!this.wfpProvider.hasPendingFiles()) {
        await this.finishJob();
      }
    });

    this.dispatcher.on(
      ScannerEvents.DISPATCHER_ITEM_NO_DISPATCHED,
      (disptItem: DispatchableItem) => {
        const filesNotScanned = disptItem
          .getFingerprintPackage()
          .getFilesFingerprinted();
        this.appendFilesToNotScanned(filesNotScanned);
      }
    );

    this.dispatcher.on(ScannerEvents.DISPATCHER_LOG, (msg) => {
      this.reportLog(msg);
    });

    this.dispatcher.on(
      ScannerEvents.ERROR,
      (error: Error, disptItem: DispatchableItem, response: string) => {
        const wfpContent = disptItem.getFingerprintPackage().getContent();
        const requestId = disptItem.uuid;

        let plainResponse = response ? response : '';

        const dump =
          `---Request ID Begin---\n${requestId}\n---Request ID End---\n` +
          `---WFP Begin---\n${wfpContent}\n---WFP End---\n` +
          `---Server Response Begin---\n${plainResponse}\n---Server Response End---\n`;
        `---Error Message Begin---\n${error.message}\n---Error Message End---\n`;

        const filePath = `${this.workDirectory}/bad_request-${this.scannerId}-${requestId}.txt`;
        fs.writeFileSync(filePath, dump, 'utf8');

        error.message += `\n\nDebug file located at ${filePath}`;
        this.errorHandler(error, ScannerEvents.MODULE_DISPATCHER);
      }
    );
  }

  private appendFilesToNotScanned(fileList) {
    const obj = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const file of fileList) obj[file] = this.filesToScan[file];
    Object.assign(this.filesNotScanned, obj);
    return this.filesNotScanned;
  }

  private insertIntoBuffer(dispatcherResponse) {
    this.responseBuffer.push(dispatcherResponse);
  }

  private isBufferEmpty() {
    return this.responseBuffer.length === 0;
  }

  private bufferReachedLimit() {
    return this.responseBuffer.length >= this.scannerCfg.MAX_RESPONSES_IN_BUFFER;
  }

  private deobfuscationResponses(
    responses: Record<string, any>,
    obfuscateMap: Record<string, string>
  ): Record<string, any> {
    const deObfuscation = {};
    Object.entries(responses).forEach(([key, value]: [string, any]) => {
      deObfuscation[obfuscateMap[key]] = value;
    });
    return deObfuscation;
  }

  private bufferToFiles() {
    logger.debug(`[ SCANNER ]: Buffer size: ${this.responseBuffer.length}`);
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
    const r =
      this.scannerCfg.WFP_OBFUSCATION && this.scannerCfg.RESULTS_DEOBFUSCATION
        ? this.deobfuscationResponses(serverResponse, this.obfuscateMap)
        : serverResponse;
    const responses = new DispatcherResponse(r, wfpContent);
    this.reportLog(
      `[ SCANNER ]: Persisted results of ${responses.getNumberOfFilesScanned()} files...`
    );

/*    if (this.settings) {
      console.log("SERVER RESPONSE: ", responses.serverResponse);
      const removeRule = new RemoveRule(responses.serverResponse, this.settings);
      responses.serverResponse = removeRule.run();
    }*/

    this.emit(ScannerEvents.RESULTS_APPENDED, responses, this.filesNotScanned);
    return responses;
  }

  private async finishJob() {
    this.scannerInput.shift();
    this.reportLog(
      `[ SCANNER ]: Job finished. ${this.scannerInput.length} pendings`
    );

    if (this.scannerInput.length) {
      if (this.scannerInput[0].wfpPath) {
        this.wfpProvider = new WfpSplitter();
        this.setWinnowerListeners();
        this.wfpProvider.start(this.scannerInput[0]);
      } else {
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
    } else await this.finishScan();
  }

  private async finishScan() {
    if (!this.isBufferEmpty()) this.bufferToFiles();

    // Close write streams before reading the files
    await this.closeWriteStreams();

    // Convert NDJSON to JSON using streaming and write back to file
    await this.convertNDJSONToJSON();

    await fs.promises.writeFile(
      this.obfuscateMapFilePath,
      JSON.stringify(this.obfuscateMap, null, 2)
    );
    this.reportLog(
      `[ SCANNER ]: Scan finished (Scanned: ${
        this.processedFiles
      }, Not Scanned: ${Object.keys(this.filesNotScanned).length})`
    );


    this.reportLog(`[ SCANNER ]: Results on: ${this.resultFilePath}`);
    this.running = false;
    this.emit(
      ScannerEvents.SCAN_DONE,
      this.resultFilePath,
      this.filesNotScanned
    );
    finishPromiseResolve(this.resultFilePath);
  }

  /**
   * Convert NDJSON file to a single JSON object using streams
   * Reads NDJSON line by line and writes formatted JSON
   */
  private async convertNDJSONToJSON(): Promise<void> {
    const tempFilePath = `${this.resultFilePath}.tmp`;

    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(this.resultFilePath, { encoding: 'utf8' });
      const writeStream = fs.createWriteStream(tempFilePath);
      const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity
      });

      let isFirstEntry = true;

      // Write opening brace
      writeStream.write('{\n');

      rl.on('line', (line: string) => {
        if (line.trim()) {
          try {
            const entry = JSON.parse(line);
            // Each entry is an object with one key-value pair
            Object.entries(entry).forEach(([filePath, result]) => {
              if (!isFirstEntry) {
                writeStream.write(',\n');
              }
              writeStream.write(`  ${JSON.stringify(filePath)}: ${JSON.stringify(result, null, 2).replace(/\n/g, '\n  ')}`);
              isFirstEntry = false;
            });
          } catch (e) {
            this.reportLog(`[ SCANNER ]: Error formatting JSON line: ${e}`);
          }
        }
      });

      rl.on('close', () => {
        // Write closing brace
        writeStream.write('\n}');
        writeStream.end();
      });

      writeStream.on('finish', () => {
        // Replace original file with temp file
        fs.rename(tempFilePath, this.resultFilePath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      readStream.on('error', (error) => {
        writeStream.destroy();
        try {
          fs.rmSync(tempFilePath);
        } catch (cleanupError) {
          this.reportLog(`[ SCANNER ]: Warning: Could not delete temp file ${tempFilePath}: ${cleanupError}`, 'warning');
        }
        reject(error);
      });

      writeStream.on('error', (error) => {
        rl.close();
        readStream.destroy();
        try {
          fs.rmSync(tempFilePath);
        } catch (cleanupError) {
          this.reportLog(`[ SCANNER ]: Warning: Could not delete temp file ${tempFilePath}: ${cleanupError}`, 'warning');
        }
        reject(error);
      });
    });
  }

  private reportLog(txt, level = 'info') {
    this.emit(ScannerEvents.SCANNER_LOG, txt, level);
  }

  private errorHandler(error, origin) {
    this.abort();
    if (origin === ScannerEvents.MODULE_DISPATCHER) {
    }
    if (origin === ScannerEvents.MODULE_WINNOWER) {
    }

    this.reportLog(`[ SCANNER ]: Error reason ${error}`);

    this.emit(ScannerEvents.ERROR, error);
    if (this.finishPromise) finishPromiseReject(error);
  }

  private createOutputFiles() {
    if (!fs.existsSync(this.wfpFilePath))
      fs.writeFileSync(this.wfpFilePath, '');
    // Initialize result file as empty for NDJSON format
    logger.debug(`[ SCANNER ]: Creating output files on ${this.resultFilePath}`);
    if (!fs.existsSync(this.resultFilePath))
      fs.writeFileSync(this.resultFilePath, '');

    if (this.scannerCfg.WFP_OBFUSCATION) {
      if (!fs.existsSync(this.obfuscateMapFilePath))
        fs.writeFileSync(this.obfuscateMapFilePath, JSON.stringify({}));
    }

    this.initializeWriteStreams();
  }

  private initializeWriteStreams() {
    this.wfpWriteStream = fs.createWriteStream(this.wfpFilePath, { flags: 'a' });
    this.resultWriteStream = fs.createWriteStream(this.resultFilePath, { flags: 'a' });
  }

  private closeWriteStreams(): Promise<void> {
    return new Promise((resolve, reject) => {
      let wfpClosed = false;
      let resultClosed = false;

      const checkBothClosed = () => {
        if (wfpClosed && resultClosed) {
          resolve();
        }
      };

      if (this.wfpWriteStream) {
        this.wfpWriteStream.end(() => {
          wfpClosed = true;
          checkBothClosed();
        });
      } else {
        wfpClosed = true;
      }

      if (this.resultWriteStream) {
        this.resultWriteStream.end(() => {
          resultClosed = true;
          checkBothClosed();
        });
      } else {
        resultClosed = true;
      }

      checkBothClosed();
    });
  }

  private appendOutputFiles(
    wfpContent: string,
    serverResponse: ScannerResults
  ) {
    // Append WFP content using write stream
    this.wfpWriteStream.write(wfpContent);

    // Apply deobfuscation if needed
    let processedResponse = serverResponse;
    if (this.scannerCfg.WFP_OBFUSCATION && this.scannerCfg.RESULTS_DEOBFUSCATION) {
      processedResponse = {};
      Object.entries(serverResponse).forEach(([filePath, result]) => {
        const originalPath = this.obfuscateMap[filePath] || filePath;
        processedResponse[originalPath] = result;
      });
    }

    // Apply settings rules if needed
    if (this.settings) {
      const scannerResultsRules = ScannerResultsRuleFactory.create(this.settings, processedResponse);
      scannerResultsRules.forEach(r => {
        processedResponse = r.run();
      });
    }

    // Append each result entry as NDJSON (newline-delimited JSON)
    // Each line contains a complete JSON object for a file result
    Object.entries(processedResponse).forEach(([filePath, result]) => {
      const entry = JSON.stringify({ [filePath]: result }) + '\n';
      this.resultWriteStream.write(entry);
    });
  }

  private isValidInput(scannerInput: Array<ScannerInput>): boolean {
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

    if (
      scannerInput.some((input) => !input.fileList.length && !input.wfpPath)
    ) {
      this.reportLog(
        '[ SCANNER ]: Input array contains an element with no file list',
        'warning'
      );
      return false;
    }

    return true;
  }

  private abort() {
    this.running = false;
    this.wfpProvider.removeAllListeners();
    this.dispatcher.removeAllListeners();
    this.dispatcher.stop();
    this.wfpProvider.stop();

    // Close write streams to prevent resource leaks
    if (this.wfpWriteStream) {
      this.wfpWriteStream.end();
    }
    if (this.resultWriteStream) {
      this.resultWriteStream.end();
    }
  }
}
