import { Scanner } from '../lib/scanner/Scanner';
import { ScannerEvents } from '../lib/scanner/ScannerEvents';
import { ScannerCfg } from '../lib/scanner/ScannerCfg';
import { Tree } from '../lib/tree/Tree';
import File from '../lib/tree/File';

export async function scanHandler(rootPath: string, options: any): Promise<boolean> {


  // Build tree
  process.stdout.write('Building tree...  ');
  const tree = new Tree(rootPath);
  tree.buildTree();
  process.stdout.write('DONE\n');

  // Get files to scan
  const fileList = tree.getRootFolder().getFiles();


  // Converts to scanner input format
  // This is temporary, until the scanner is ready to receive a list of files with parameters
  const scannerInput = fileList.map((file: File) => {
    const fPath = file.getPath().substring(1);  // Remove first slash
    const f = {[rootPath + fPath]: 'FULL_SCAN'};
    return f;
  });


  // ****** Launch scan ****** //
  // Create default scannerCfg and change according to options
  // new ScannerCfg()

  const scanner = new Scanner();


  // if verbose mode
  scanner.on(ScannerEvents.SCANNER_LOG, (logText) => console.log(logText));


  return new Promise(resolve => setTimeout(() => {
    console.log("Finished")
    resolve(true)}, 3000));




}


