import { Scanner } from '../lib/scanner/Scanner';
import { ScannerEvents, ScannerInput } from '../lib/scanner/ScannerTypes';
import { ScannerCfg } from '../lib/scanner/ScannerCfg';
import { Tree } from '../lib/tree/Tree';

import cliProgress from 'cli-progress';
import { DispatcherResponse } from '../lib/scanner/Dispatcher/DispatcherResponse';
import { defaultFilter } from '../lib/filters/defaultFilter';
import { FilterList } from '../lib/filters/filtering';

import { isFolder } from './helpers';

import fs from 'fs';



export async function scanHandler(rootPath: string, options: any): Promise<void> {

  let scannerInput: ScannerInput = {fileList: []};

  rootPath = rootPath.replace(/\/$/, '');  // Remove trailing slash if exists
  rootPath = rootPath.replace(/^\./, process.env.PWD);  // Convert relative path to absolute path.
  const pathIsFolder = await isFolder(rootPath);

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
    //filesCounter = [...winnowing.matchAll(/file=/g)].length;
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

  scanner.on(ScannerEvents.SCAN_DONE, async (resultPath) => {
    if(options.output)
      await fs.promises.copyFile(resultPath, options.output);
    else
      console.log(await fs.promises.readFile(resultPath, 'utf8'));
  });

  if (options.wfp) await scanner.scanFromWinnowingFile(rootPath);
  else await scanner.scan([scannerInput]);

}


