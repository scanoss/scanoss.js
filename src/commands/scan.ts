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
import { defaultFilter } from '../lib/filters/defaultFilter';
import { FilterList } from '../lib/filters/filtering';

import { isFolder } from './helpers';

import fs from 'fs';
import { DependencyScannerCfg } from '../lib/dependencies/DependencyScannerCfg';
import { DependencyScanner } from '../lib/dependencies/DependencyScanner';
import { IDependencyResponse } from '../lib/dependencies/DependencyTypes';
import os from 'os';
import { Report } from '../lib/modules/reports/Report';
import { IReportEntry } from '../lib/modules/reports/types';
import { HTMLReport } from '../lib/modules/reports/htmlReport/HTMLReport';


export async function scanHandler(rootPath: string, options: any): Promise<void> {

  let scannerInput: ScannerInput = {fileList: []};

  rootPath = rootPath.replace(/\/$/, '');  // Remove trailing slash if exists
  rootPath = rootPath.replace(/^\./, process.env.PWD);  // Convert relative path to absolute path.
  const pathIsFolder = await isFolder(rootPath);

  // Create dependency scanner and set parameters
  const dependencyScannerCfg = new DependencyScannerCfg();
  if (options.grpcHost) dependencyScannerCfg.DEFAULT_GRPC_HOST = options.api2url;
  const dependencyScanner = new DependencyScanner(dependencyScannerCfg);


  // Create scanner and set connections parameters
  const scannerCfg = new ScannerCfg();
  if(options.concurrency) scannerCfg.CONCURRENCY_LIMIT = parseInt(options.concurrency);
  if(options.postSize) scannerCfg.WFP_FILE_MAX_SIZE = parseInt(options.postSize) * 1024;
  if(options.apiurl) scannerCfg.API_URL = options.apiurl;
  if(options.key) scannerCfg.API_KEY = options.key;
  if(options.timeout) scannerCfg.TIMEOUT = options.timeout * 1000;
  if(options.maxRetry) scannerCfg.MAX_RETRIES_FOR_RECOVERABLES_ERRORS = options.maxRetry;
  const scanner = new Scanner(scannerCfg);

  scannerInput.folderRoot = rootPath + '/'; // This will remove the project root path from the results.
  if(options.flags) scannerInput.engineFlags = options.flags;

  if(!options.wfp) {
    if(pathIsFolder) {
      const tree = new Tree(rootPath);
      const filter = new FilterList('');

      if (options.filter) {
        console.error('Loading filter from file: ' + options.filter);
        filter.loadFromFile(options.filter);
      } else {
        console.error('Loading default filters...');
        filter.load(defaultFilter as FilterList);
      }
      console.error('Reading directory...  ');
      tree.loadFilter(filter);
      tree.buildTree();
      scannerInput.fileList = tree.getFileList();
    } else {
      scannerInput.fileList = [rootPath];
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
    pDependencyScanner = dependencyScanner.scan(scannerInput.fileList);
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

  // path result.json: scannerResultPath
  // dependencyResult (JSON):
  if (options.format === "HTML") {

    // save dependency analizys to os.tmpdir()
    const depPath = `${os.tmpdir()}/scanoss-dependency.json`
    await fs.promises.writeFile(depPath, JSON.stringify(depResults, null, 2));

    const ReportEntry: IReportEntry = {
      resultPath: scannerResultPath,
      dependencyPath: depPath,
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


