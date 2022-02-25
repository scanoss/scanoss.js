import path from "path";
import fs from 'fs';

import { ILocalDependencies, ParserDefinitions } from "./DependencyTypes";
import { pomParser } from "./parsers/mavenParser";
import { packageParser, packagelockParser } from "./parsers/npmParser";
import { requirementsParser } from "./parsers/pyParser";
import { gemfileParser, gemfilelockParser } from "./parsers/rubyParser";
import { GrpcDependencyService } from "../grpc/GrpcDependencyService";
import { DependencyResponse, DependencyRequest } from "../grpc/scanoss/api/dependencies/v2/scanoss-dependencies_pb";

/*
 This is a hash map that connect a filename with it's own parser function
 Any parser function must return a ILocalDependencies object (See DependencyTypes.ts)
*/
const Parser: ParserDefinitions = {
  'requirements.txt': requirementsParser,
  'pom.xml': pomParser,
  'package.json': packageParser,
  'package-lock.json': packagelockParser,
  'Gemfile': gemfileParser,
  'Gemfile.lock': gemfilelockParser
};


export class DependencyScanner {

  private grpcDependencyService: GrpcDependencyService;

  constructor() {
    this.grpcDependencyService = new GrpcDependencyService();
  }


  public async scan(files: Array<string>): Promise<DependencyResponse> {
    try {
      const localDependencies = await this.localDependencySearch(files);
      const request = this.buildRequest(localDependencies);
      return await this.grpcDependencyService.get(request);
    } catch(e) {
      console.error(e);
      return null;
    }
  }


  private buildRequest(localDependencies: ILocalDependencies): DependencyRequest {
    try {
      const depRequest = new DependencyRequest();
      for (const file of localDependencies.files) {
        const fileMsg = new DependencyRequest.Files();
        fileMsg.setFile(file.file);
        for (const purl of file.purls) {
          const purlMsg = new DependencyRequest.Purls();
          purlMsg.setPurl(purl.purl);
          purlMsg.setRequirement(purl.requirements);
          fileMsg.addPurls(purlMsg);
        }
        depRequest.addFiles(fileMsg);
      }
      return depRequest;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public async localDependencySearch(files: Array<string>): Promise<ILocalDependencies> {
    let results: ILocalDependencies = {files: []};
    for (const filePath of files) {
        const fileName = path.basename(filePath);
        if(Parser[fileName] != null) {
          try{
            const fileContent = await fs.promises.readFile(filePath, 'utf8');
            const dependency = Parser[fileName](fileContent, filePath);
            if(dependency.purls.length != 0)
                results.files.push(dependency);
          } catch(e) {
            console.error(e);
            continue;
          }
        }
    }
    return results;
  }

}
