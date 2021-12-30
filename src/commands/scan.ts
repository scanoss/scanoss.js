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
  OnlyMD5: boolean;
};

const clearLastLines = (count) => {
  process.stdout.moveCursor(0, -count)
  process.stdout.clearScreenDown()
}


export async function scanHandler(rootPath: string, options: any): Promise<void> {

  //TODO: Sanitize inputs


  const filter = new FilterList('');
  if (options.filter) {
    console.log('Loading filter from file: ' + options.filter);
    filter.loadFromFile(options.filter);
  } else {
    console.log('Loading default filters...');
    filter.load(defaultFilter as FilterList);
  }




  console.log('Reading directory...  ');
  const tree = new Tree(rootPath);
  tree.loadFilter(filter);
  tree.buildTree();

  const fileList = tree.getFileList();


  // Converts to scanner input format
  // This is temporary, until the scanner is ready to receive a ScannerInput object
  let scannerInput = {};
  for(let f of fileList) {
    scannerInput = Object.assign(scannerInput, {[f]: 'FULL_SCAN'});
  }

  const scanner = new Scanner();

  if (!options.verbose) {
    clearLastLines(2);
    const optBar1 = { format: 'Scan Progress: [{bar}] {percentage}% | Scanned {value} files of {total}' };
    const bar1 = new cliProgress.SingleBar(optBar1, cliProgress.Presets.shades_classic);
    bar1.start(fileList.length, 0);

    let totalFilesScanned = 0;
    scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, (dispResp: DispatcherResponse) => {
      totalFilesScanned += dispResp.getFilesScanned().length;
      bar1.update(totalFilesScanned);
    });

    scanner.on(ScannerEvents.SCAN_DONE, (resultPath) => {
      bar1.stop();
      console.log(`Results saved in ${resultPath}`);
    });
  } else {
    scanner.on(ScannerEvents.SCANNER_LOG, (logText) => console.log(logText));
  }

  scanner.on(ScannerEvents.ERROR, (e) => {throw e;});
  await scanner.scanList(scannerInput);

}


