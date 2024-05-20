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
import { BinaryFilter } from '../../sdk/tree/Filters/BinaryFilter';

export async function cryptoHandler(rootPath: string, options: any): Promise<void> {
  rootPath = rootPath.replace(/\/$/, '');  // Remove trailing slash if exists
  rootPath = rootPath.replace(/^\./, process.env.PWD);  // Convert relative path to absolute path.
  const pathIsFolder = await isFolder(rootPath);

  let cryptoRules = null;
  if(options.rules) cryptoRules = options.rules;

  let threads = null;
  if(options.threads) threads = options.threads;

  const cryptoScanner = new CryptographyScanner(new CryptoCfg({threads, rulesPath: cryptoRules}));

  let fileList: Array<string> = [];
  fileList.push(rootPath);

  if (pathIsFolder) {
    const tree = new Tree(rootPath);
    tree.build();
    fileList = tree.getFileList(new BinaryFilter());
  }

  console.log("Searching for local cryptography...")
  const results = await cryptoScanner.scan(fileList);

  if(options.output) {
    await fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));
    console.log(`Results found in ${options.output}`);
  } else {
    console.log(JSON.stringify(results, null, 2));
  }

}
