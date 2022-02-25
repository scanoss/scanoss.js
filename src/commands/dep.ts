import fs from "fs";
import { DependencyScanner } from "../lib/dependencies/DependencyScanner";
import { Tree } from "../lib/tree/Tree";

export async function depHandler(rootPath: string, options: any): Promise<void> {
  rootPath = rootPath.replace(/\/$/, '');  // Remove trailing slash if exists
  rootPath = rootPath.replace(/^\./, process.env.PWD);  // Convert relative path to absolute path.

  const tree = new Tree(rootPath);
  tree.buildTree();

  const fileList = tree.getRootFolder().getFiles().map((path) => {return rootPath+path});

  const dependencyScanner = new DependencyScanner();
  const results = await dependencyScanner.scan(fileList);

  if(options.output) {
    fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));
  } else {
    console.log(JSON.stringify(results.toObject(), null, 2));
  }

}
