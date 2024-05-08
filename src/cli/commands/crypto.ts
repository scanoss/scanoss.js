import { isFolder } from './helpers';
import {
  DependencyScannerCfg
} from '../../sdk/Dependencies/DependencyScannerCfg';
import { DependencyScanner } from '../../sdk/Dependencies/DependencyScanner';
import {
  CryptographyScanner
} from '../../sdk/Cryptography/CryptographyScanner';
import { Tree } from '../../sdk/tree/Tree';
import { DependencyFilter } from '../../sdk/tree/Filters/DependencyFilter';
import { CryptoCfg } from '../../sdk/Cryptography/CryptoCfg';
import fs from 'fs';

export async function cryptoHandler(rootPath: string, options: any){
  rootPath = rootPath.replace(/\/$/, '');  // Remove trailing slash if exists
  rootPath = rootPath.replace(/^\./, process.env.PWD);  // Convert relative path to absolute path.
  const pathIsFolder = await isFolder(rootPath);

  let cryptoRules = null;
  if(options.rules) cryptoRules = options.rules;


  const cryptoScanner = new CryptographyScanner(new CryptoCfg(cryptoRules));


  let fileList: Array<string> = [];
  fileList.push(rootPath);

  if (pathIsFolder) {
    const tree = new Tree(rootPath);
    tree.build();
    fileList = tree.getFileList(null);
  }

  console.log("Searching for local cryptography...")
  const results = await cryptoScanner.scan(fileList);

  if (options.output) {
    await fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));
    console.log(`Results found in ${options.output}`);
  } else {
    console.log(JSON.stringify(results, null, 2));
  }

}
