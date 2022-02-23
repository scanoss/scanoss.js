import os from "os";
import fs from "fs";
import util from "util";

import { IDependencyResponse, IFile, IDependency } from "./DependencyTypes";
import { FileListDependency } from "./parsers/types";
import { generateDependenciesPurls } from "./PurlGenerator";

import * as grpc from '@grpc/grpc-js';
import { DependenciesClient } from '../../scanoss/api/dependencies/v2/scanoss-dependencies_grpc_pb';
import * as DependenciesMessages from '../../scanoss/api/dependencies/v2/scanoss-dependencies_pb.js';

import * as CommonMessages from '../../scanoss/api/common/v2/scanoss-common_pb.js';

export class Dependency {

  private workDirectory: string;

  private resultFilePath: string;

  constructor () {
    this.setWorkDirectory(`${os.tmpdir()}/depscanner-${new Date().getTime()}`);
  }

  public async scan (fileList: Array<string>): Promise<IDependencyResponse> {
    const toGrpc = await generateDependenciesPurls(fileList);

    const client = new DependenciesClient(
      'localhost:50051',
      grpc.credentials.createInsecure(),
    );





    const DependencyRequest = this.createDependencyRequest(toGrpc);
    const DepResponse = await getDependencies(client, DependencyRequest);
    const files = DepResponse.toObject().filesList as unknown as Array<IFile>;

    const readDep = util.promisify(client.getDependencies);
    const sarasa = await readDep(DependencyRequest) as DependenciesMessages.DependencyResponse;
      sarasa.toObject()

    return <IDependencyResponse>{files: files }
  }

  public setWorkDirectory(workDirectory: string) {
    this.workDirectory = workDirectory;
    this.resultFilePath = `${this.workDirectory}/dependencies.json`;
    if (!fs.existsSync(this.workDirectory)) fs.mkdirSync(this.workDirectory);
  }

  private createDependencyRequest(dependencies: FileListDependency): DependenciesMessages.DependencyRequest {
    const depMessage = new DependenciesMessages.DependencyRequest();
    for (const dependency of dependencies.files){
      const fileMsg = new DependenciesMessages.DependencyRequest.Files();
      fileMsg.setFile(dependency.file);
      for (const purl of dependency.purls) {
        const purlMsg = new DependenciesMessages.DependencyRequest.Purls();
        purlMsg.setPurl(purl.purl);
        fileMsg.addPurls(purlMsg);
      }
      depMessage.addFiles(fileMsg);
    }
    return depMessage;
  }
}


async function getDependencies(client: DependenciesClient, depReq: DependenciesMessages.DependencyRequest): Promise<DependenciesMessages.DependencyResponse> {
  return new Promise((resolve, reject) => {
    client.getDependencies(depReq, (err, response) => {
      if (err) reject(err);
      resolve(response);
    });
  });
}


/*
 Dependencias
 Escaneo


     const DependenciService = new DependenciesClient(
      'localhost:50051',
      grpc.credentials.createInsecure(),
    );


    DependenciService.getDependencies(DependencyRequest, (err, response) => {});
    const Dependencyresponse = await DependencyService.getDependencies(DependencyRequest)


    this.store.components.getAll()
*/
