import { Scanner } from '../lib/scanner/Scanner';
import { ScannerEvents } from '../lib/scanner/ScannerEvents';
import { ScannerCfg } from '../lib/scanner/ScannerCfg';
import { Tree } from '../lib/tree/Tree';
import File from '../lib/tree/File';

import cliProgress from 'cli-progress';
import { WinnowerResponse } from '../lib/scanner/Winnower/WinnowerResponse';
import { DispatcherResponse } from '../lib/scanner/Dispatcher/DispatcherResponse';
import { defaultFilter } from '../lib/filters/defaultFilter';
import { FilterList } from '../lib/filters/filtering';

import fs from 'fs';

enum FilterTypes {
  BANNED = 'BANNED',
  WHITELIST = 'WHITELIST',
  FULL_SCAN = 'FULL_SCAN',
  QUICK_SCAN = 'QUICK_SCAN',
}


interface ScannerInput {
  EngineFlags: string;
  FolderRoot?: string;
  FileList: Array<string>;
  Snippets: boolean;
};

// Async function that verify if a path is a folder. If the path is not valid the promise will be rejected
const isFolder = (path: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.isDirectory());
      }
    });
  });
}

async function printJSON(path: string) {
  const jsonTxt = await fs.promises.readFile(path, 'utf8');
  console.log(jsonTxt);
}



export async function scanHandler(rootPath: string, options: any): Promise<void> {

  let fileList = [];
  let scannerInput = {};
  let filesCounter = 0; // Used by the progress bar
  const pathIsFolder = await isFolder(rootPath);

  // Create scanner and set connections parameters
  const scannerCfg = new ScannerCfg();
  if(options.concurrency) scannerCfg.CONCURRENCY_LIMIT = parseInt(options.concurrency);
  if(options.postSize) scannerCfg.WFP_FILE_MAX_SIZE = parseInt(options.postSize) * 1024;
  if(options.apiUrl) scannerCfg.API_URL = options.apiurl;
  if(options.key) scannerCfg.API_KEY = options.key;
  if(options.timeout) scannerCfg.TIMEOUT = options.timeout * 1000;
  if(options.maxRetry) scannerCfg.MAX_RETRIES_FOR_RECOVERABLES_ERRORS = options.maxRetry;

  const scanner = new Scanner(scannerCfg);

  if(!options.wfp) {  // --wfp change the behaviour of the scanner. Scan a WFP File instead of a folder
    if(pathIsFolder) { // If a folder is specified, we scan the folder and all its subfolders
      if(rootPath.charAt(rootPath.length -1) !== '/') rootPath += '/';

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

      fileList = tree.getFileList();
      filesCounter = fileList.length;

      // Converts to scanner input format
      // This is temporary, until the scanner is ready to receive a ScannerInput object
      for(let f of fileList) scannerInput = Object.assign(scannerInput, {[f]: 'FULL_SCAN'});
    } else {
      scannerInput = {[rootPath]: 'FULL_SCAN'};
      filesCounter = 1;
    }
  } else {
    const winnowing = fs.readFileSync(rootPath, {encoding: 'utf-8'});
    const reg = /file=/g;
    filesCounter = [...winnowing.matchAll(reg)].length;
  }

  if (!options.verbose) {
    const optBar1 = { format: 'Scan Progress: [{bar}] {percentage}% | Scanned {value} files of {total}' };
    const bar1 = new cliProgress.SingleBar(optBar1, cliProgress.Presets.shades_classic);
    bar1.start(filesCounter, 0);

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
  else await scanner.scanList(scannerInput);

}


