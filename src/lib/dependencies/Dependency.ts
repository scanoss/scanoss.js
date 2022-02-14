import os from "os";
import fs from "fs";

import { IDependencyResponse, IFile, IDependency } from "./DependencyTypes";
import { FileListDependency } from "./parsers/types";
import { generateDependenciesPurls } from "./PurlGenerator";

export class Dependency {

  private workDirectory: string;

  private resultFilePath: string;

  constructor () {
    this.setWorkDirectory(`${os.tmpdir()}/depscanner-${new Date().getTime()}`);
  }

  public async scan (fileList: Array<string>): Promise<IDependencyResponse> {
    const toGrpc = await generateDependenciesPurls(fileList);
    // Here we should call to the grpc server
    return this.adapterToDependencyResponse(toGrpc);
  }

  public setWorkDirectory(workDirectory: string) {
    this.workDirectory = workDirectory;
    this.resultFilePath = `${this.workDirectory}/dependencies.json`;

    if (!fs.existsSync(this.workDirectory)) fs.mkdirSync(this.workDirectory);
  }

  private adapterToDependencyResponse (dependencies: FileListDependency): IDependencyResponse {
    const results = <IDependencyResponse>{files: []};




    for (const dependency of dependencies.files){
      let depArr: Array<IDependency> = [];
      for (const purl of dependency.purls) {
        depArr.push({
          component: null,
          purl: purl.purl,
          version: null,
          licenses: [{name: null}]
        });
      }

      let fileArr = <IFile>{};
      fileArr = ({
        file: dependency.file,
        id: "dependency",
        status: "pending",
        dependencies: depArr
      });

      results.files.push(fileArr);
    }
    return results
  }
}
