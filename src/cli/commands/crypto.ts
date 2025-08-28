import { isFolder } from './helpers';
import { Tree } from '../../sdk/tree/Tree';
import { CryptoCfg } from '../../sdk/Cryptography/CryptoCfg';
import fs from 'fs';
import { BinaryFilter } from '../../sdk/tree/Filters/BinaryFilter';
import { ScanFilter } from '../../sdk/tree/Filters/ScanFilter';
import { FilterAND } from '../../sdk/tree/Filters/FilterAND';
import {
  CryptographyScanner
} from "../../sdk/Cryptography/CryptographyScanner";


export async function cryptoHandler(rootPath: string, options: any): Promise<void> {
  rootPath = rootPath.replace(/\/$/, '');  // Remove trailing slash if exists
  rootPath = rootPath.replace(/^\./, process.env.PWD);  // Convert relative path to absolute path.
  const pathIsFolder = await isFolder(rootPath);

  const cfg = new CryptoCfg();
  if(options.algorithmRules) cfg.ALGORITHM_RULES_PATH = options.algorithmRules;
  if(options.libraryRules) cfg.LIBRARY_RULES_PATH = options.libraryRules;
  if(options.threads) cfg.THREADS = options.threads;
  if(options.key) cfg.API_KEY = options.key;
  if (options.caCert) cfg.CA_CERT = options.caCert;
  if (options.ignoreCertErrors) cfg.IGNORE_CA_CERT_ERR = true;
  if (options.apiurl) cfg.API_URL = options.apiurl;

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
