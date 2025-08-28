import fs from "fs";
import { DependencyScanner } from "../../sdk/Dependencies/DependencyScanner";
import { DependencyScannerCfg } from "../../sdk/Dependencies/DependencyScannerCfg";
import { Tree } from "../../sdk/tree/Tree";
import { DependencyFilter } from '../../sdk/tree/Filters/DependencyFilter';
import { isFolder } from "./helpers";
import { Logger, logger } from "../../sdk/Logger";

export async function depHandler(rootPath: string, options: any): Promise<void> {
  logger.setLevel(Logger.Level.info);
  if(options.debug)
    logger.setLevel(Logger.Level.debug);
  rootPath = rootPath.replace(/\/$/, '');  // Remove trailing slash if exists
  rootPath = rootPath.replace(/^\./, process.env.PWD);  // Convert relative path to absolute path.
  const pathIsFolder = await isFolder(rootPath);
  const dependencyScannerCfg = new DependencyScannerCfg();
  if (options.caCert) dependencyScannerCfg.CA_CERT = options.caCert;
  if (options.apiurl) dependencyScannerCfg.API_URL = options.apiurl;
  if (options.proxy) {
    dependencyScannerCfg.HTTPS_PROXY = options.proxy;
    dependencyScannerCfg.HTTP_PROXY = options.proxy;
  }
  if (options.key) dependencyScannerCfg.API_KEY = options.key;
  if (options.ignoreCertErrors) dependencyScannerCfg.IGNORE_CERT_ERRORS = true;

  const dependencyScanner = new DependencyScanner(dependencyScannerCfg);

  let fileList: Array<string> = [];
  fileList.push(rootPath);

  if (pathIsFolder) {
    const tree = new Tree(rootPath);
    tree.build();
    fileList = tree.getFileList(new DependencyFilter(""));
  }

  const results = await dependencyScanner.scan(fileList);

  if(options.output) {
    fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));
  } else {
    console.log(JSON.stringify(results, null, 2));
  }

}
