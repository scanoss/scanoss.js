import { isFolder } from './helpers';
import {
  DependencyScannerCfg
} from '../../sdk/Dependencies/DependencyScannerCfg';
import { DependencyScanner } from '../../sdk/Dependencies/DependencyScanner';
import {
  FileCryptographyAlgorithmScanner
} from '../../sdk/Cryptography/Algorithm/Files/FileCryptographyAlgorithmScanner';
import { Tree } from '../../sdk/tree/Tree';
import { DependencyFilter } from '../../sdk/tree/Filters/DependencyFilter';
import { CryptoCfg } from '../../sdk/Cryptography/CryptoCfg';
import fs from 'fs';
import { BinaryFilter } from '../../sdk/tree/Filters/BinaryFilter';
import { ScanFilter } from '../../sdk/tree/Filters/ScanFilter';
import { FilterAND } from '../../sdk/tree/Filters/FilterAND';
import {
  CryptographyScanner
} from "../../sdk/Cryptography/CryptographyScanner";
import path from "path";


export async function cryptoHandler(rootPath: string, options: any): Promise<void> {
  rootPath = rootPath.replace(/\/$/, '');  // Remove trailing slash if exists
  rootPath = rootPath.replace(/^\./, process.env.PWD);  // Convert relative path to absolute path.
  const pathIsFolder = await isFolder(rootPath);
  let algorithmRules = null;
  let libraryRules = null;
  if(options.algorithmRules) algorithmRules = options.algorithmRules;
  if(options.libraryRules) libraryRules = options.libraryRules;

  let threads = null;
  if(options.threads) threads = options.threads;

  const cfg = new CryptoCfg({threads, algorithmRulesPath: algorithmRules, libraryRulesPath: libraryRules })

  const cryptoScanner = new CryptographyScanner(cfg);

  let fileList: Array<string> = [];
  fileList.push(rootPath);

  if (pathIsFolder) {
    const tree = new Tree(rootPath);
    tree.build();
    fileList = tree.getFileList(new FilterAND([new BinaryFilter(), new ScanFilter('')]));
  }

  console.log("Searching for local cryptography...")
  const results = await cryptoScanner.scanFiles(fileList);
  results.fileList.forEach((c)=>{
    c.file = c.file.replace(rootPath, "");
  });

  if(options.output) {
    await fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));
    console.log(`Results found in ${options.output}`);
  } else {
    console.log(JSON.stringify(results, null, 2));
  }

}
