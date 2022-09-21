import fs from "fs";
import { DependencyScanner } from "../lib/dependencies/DependencyScanner";
import { DependencyScannerCfg } from "../lib/dependencies/DependencyScannerCfg";
import { Tree } from "../lib/tree/Tree";
import { isFolder } from "./helpers";
import { DependencyFilter } from '../lib/tree/Filters/DependencyFilter';

export async function depHandler(rootPath: string, options: any): Promise<void> {

  rootPath = rootPath.replace(/\/$/, '');  // Remove trailing slash if exists
  rootPath = rootPath.replace(/^\./, process.env.PWD);  // Convert relative path to absolute path.
  const pathIsFolder = await isFolder(rootPath);
  const dependencyScannerCfg = new DependencyScannerCfg();
  if(options.grpcHost) dependencyScannerCfg.DEFAULT_GRPC_HOST = options.grpcHost;
  if(options.grpcPort) dependencyScannerCfg.DEFAULT_GRPC_PORT = options.grpcPort;

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
