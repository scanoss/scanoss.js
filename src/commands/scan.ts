import { Scanner } from '../lib/scanner/Scanner';
import {
  SbomMode,
  ScannerEvents,
  ScannerInput,
  WinnowingMode
} from '../lib/scanner/ScannerTypes';
import { ScannerCfg } from '../lib/scanner/ScannerCfg';
import { Tree } from '../lib/tree/Tree';

import cliProgress from 'cli-progress';
import {
  DispatcherResponse
} from '../lib/scanner/Dispatcher/DispatcherResponse';
import { FilterList } from '../lib/filters/filtering';

import { getProjectNameFromPath, isFolder } from './helpers';

import fs from 'fs';
import { DependencyScannerCfg } from '../lib/dependencies/DependencyScannerCfg';
import { DependencyScanner } from '../lib/dependencies/DependencyScanner';
import { IDependencyResponse } from '../lib/dependencies/DependencyTypes';
import os from 'os';
import { Report } from '../lib/modules/reports/Report';
import { IReportEntry } from '../lib/modules/reports/types';
import { HTMLReport } from '../lib/modules/reports/htmlReport/HTMLReport';
import { ScanFilter } from '../lib/tree/Filters/ScanFilter';
import { DependencyFilter } from '../lib/tree/Filters/DependencyFilter';


export async function scanHandler(rootPath: string, options: any): Promise<void> {


  rootPath = rootPath.replace(/\/$/, '');  // Remove trailing slash if exists
  rootPath = rootPath.replace(/^\./, process.env.PWD);  // Convert relative path to absolute path.
  const pathIsFolder = await isFolder(rootPath);


  const projectName = getProjectNameFromPath(rootPath)

  // Create dependency scanner and set parameters
  const dependencyScannerCfg = new DependencyScannerCfg();
  if (options.api2url) dependencyScannerCfg.DEFAULT_GRPC_HOST = options.api2url;
  const dependencyScanner = new DependencyScanner(dependencyScannerCfg);
  let dependencyInput: Array<string> = [];


  // Create scanner and set connections parameters
  const scannerCfg = new ScannerCfg();
  if(options.concurrency) scannerCfg.CONCURRENCY_LIMIT = parseInt(options.concurrency);
  if(options.postSize) scannerCfg.WFP_FILE_MAX_SIZE = parseInt(options.postSize) * 1024;
  if(options.apiurl) scannerCfg.API_URL = options.apiurl;
  if(options.key) scannerCfg.API_KEY = options.key;
  if(options.timeout) scannerCfg.TIMEOUT = options.timeout * 1000;
  if(options.maxRetry) scannerCfg.MAX_RETRIES_FOR_RECOVERABLES_ERRORS = options.maxRetry;
  const scanner = new Scanner(scannerCfg);

  let scannerInput: ScannerInput = {fileList: []};
  scannerInput.folderRoot = rootPath + '/'; // This will remove the project root path from the results.
  if(options.flags) scannerInput.engineFlags = options.flags;



  if(!options.wfp) {
    if(pathIsFolder) {
      console.error('Reading directory...  ');
      const tree = new Tree(rootPath);
      tree.build();
      scannerInput.fileList = tree.getFileList(new ScanFilter(""));
      dependencyInput = tree.getFileList(new DependencyFilter(""));
    } else {
      scannerInput.fileList = [rootPath];
      dependencyInput = [rootPath];
    }
  } else {
    const winnowing = fs.readFileSync(rootPath, {encoding: 'utf-8'});
    scannerInput.fileList.length = [...winnowing.matchAll(/file=/g)].length;
  }

  if (!options.verbose) {
    const optBar1 = { format: 'Scan Progress: [{bar}] {percentage}% | Scanned {value} files of {total}' };
    const bar1 = new cliProgress.SingleBar(optBar1, cliProgress.Presets.shades_classic);
    bar1.start(scannerInput.fileList.length, 0);

    scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, (dispResp: DispatcherResponse) => {
      bar1.increment(dispResp.getFilesScanned().length);
    });

    scanner.on(ScannerEvents.SCAN_DONE, async (resultPath) => {bar1.stop();});
  } else {
    scanner.on(ScannerEvents.SCANNER_LOG, (logText) => console.error(logText));
  }

  if (options.wfp) scannerInput.wfpPath = rootPath;
  if (options.hpsm) scannerInput.winnowingMode = WinnowingMode.FULL_WINNOWING_HPSM

  if (options.ignore) {
    scannerInput.sbom = fs.readFileSync(options.ignore, 'utf-8');
    scannerInput.sbomMode = SbomMode.SBOM_IGNORE
  }



  // Dependency scanner
  let pDependencyScanner = Promise.resolve(<IDependencyResponse>{});
  if (options.dependencies) {
    pDependencyScanner = dependencyScanner.scan(dependencyInput);
  }

  //Launch parallel scanners
  const pScanner = scanner.scan([scannerInput]);

  const [scannerResultPath, depResults] = await Promise.all([pScanner, pDependencyScanner])
  const scannerResults = JSON.parse(await fs.promises.readFile(scannerResultPath, 'utf-8'));


  const scannersResults = {
    scanner: scannerResults,
    ...(options.dependencies && {dependencies: depResults})
  };

  let scannerResultsString = JSON.stringify(scannersResults, null, 2);

  if (options.format && options.format.toLowerCase() === "html") {

    const depPath = `${os.tmpdir()}/scanoss-dependency.json`
    await fs.promises.writeFile(depPath, JSON.stringify(depResults, null, 2));

    const ReportEntry: IReportEntry = {
      projectName,
      resultPath: scannerResultPath,
      ...(options.dependencies && {dependencyPath: depPath}),
      outputPath: "",
    }

    const HTML = new HTMLReport(ReportEntry);
    scannerResultsString = await HTML.generate();
  }

  if(options.output)
    await fs.promises.writeFile(options.output, scannerResultsString)
  else
    console.log(scannerResultsString);
}


