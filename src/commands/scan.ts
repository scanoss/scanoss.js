import { Scanner } from '../lib/scanner/Scanner';
import { ScannerEvents } from '../lib/scanner/ScannerEvents';
import { ScannerCfg } from '../lib/scanner/ScannerCfg';
import { Tree } from '../lib/tree/Tree';
import File from '../lib/tree/File';

import cliProgress from 'cli-progress';
import { WinnowerResponse } from '../lib/scanner/Winnower/WinnowerResponse';
import { DispatcherResponse } from '../lib/scanner/Dispatcher/DispatcherResponse';

export async function scanHandler(rootPath: string, options: any): Promise<void> {

  // Build tree
  process.stdout.write('Building tree...  ');
  const tree = new Tree(rootPath);
  tree.buildTree();
  process.stdout.write('DONE\n');


  // Get files to scan
  const fileList = tree.getRootFolder().getFiles();




  // Converts to scanner input format
  // This is temporary, until the scanner is ready to receive a list of files with parameters
  const filesArray = fileList.map((file: File) => {
    const fPath = file.getPath().substring(1);  // Remove first slash
    const f = {[rootPath + fPath]: 'FULL_SCAN'};
    return f;
  });
  let scannerInput = {};
  for(let f of filesArray) {
    scannerInput = Object.assign(scannerInput, f);
  }


  // Creates progress bar
  const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true

  }, cliProgress.Presets.shades_grey);


    // add bars
  const b1 = multibar.create(fileList.length, 0);
  const b2 = multibar.create(fileList.length, 0);


  // ****** Launch scan ****** //
  // Create default scannerCfg and change according to options
  // new ScannerCfg()

  let scanner = new Scanner();




  // if verbose mode is not active {
  let totalFilesWinnowed = 0;
  scanner.on(ScannerEvents.WINNOWING_NEW_CONTENT, (winResp: WinnowerResponse) => {
    totalFilesWinnowed += winResp.getFilesWinnowed().length;
    b1.update(totalFilesWinnowed);
  });

  let totalFilesScanned = 0;
  scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, (dispResp: DispatcherResponse) => {
    totalFilesScanned += dispResp.getFilesScanned().length;
    b2.update(totalFilesScanned);
  });
// } else {}
// scanner.on(ScannerEvents.SCANNER_LOG, (logText) => console.log(logText));


  try {
    await scanner.scanList(scannerInput);
    multibar.stop();
    console.log(`Results saved in ${scanner.getWorkDirectory()}/result.json`);
  } catch (error) {
    console.log(error);
  }

}


