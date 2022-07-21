import { ILocalDependencies } from "./LocalDependency/DependencyTypes";
import { GrpcDependencyService } from "../grpc/GrpcDependencyService";
import { DependencyRequest, DependencyResponse } from "../grpc/scanoss/api/dependencies/v2/scanoss-dependencies_pb";
import { LocalDependencies } from "./LocalDependency/LocalDependency";
import { DependencyScannerCfg } from "./DependencyScannerCfg";
import { IDependencyResponse } from "./DependencyTypes";
import { PackageURL } from "packageurl-js";

export class DependencyScanner {

  private localDependency: LocalDependencies;

  private grpcDependencyService: GrpcDependencyService;

  constructor(cfg = new DependencyScannerCfg()) {
    this.grpcDependencyService = new GrpcDependencyService(cfg.DEFAULT_GRPC_HOST, cfg.DEFAULT_GRPC_PORT);
    this.localDependency = new LocalDependencies();
  }


  public async scan(files: Array<string>): Promise<IDependencyResponse> {
    let localDependencies = await this.localDependency.search(files);
    if (localDependencies.files.length === 0) return {filesList: []};
    localDependencies = this.purlAdapter(localDependencies);
    const request = this.buildRequest(localDependencies);
    const grpcResponse = await this.grpcDependencyService.get(request);
    const response = grpcResponse.toObject();

    // Extract scope from localDependencies and add it to response
    // Also adds the requirements field from localDependency to the response if the server didn't
    // replay back a version
    this.repairOutput(localDependencies, response);
    return response;
  }

  private purlAdapter(localDependencies: ILocalDependencies): ILocalDependencies {
    for (const file of localDependencies.files) {
      for (const purl of file.purls) {

        const version = PackageURL.fromString(purl.purl).version;
        purl.requirement = version;
        purl.purl = purl.purl.replace('@'+version, '');

        if (purl.purl.includes('%2F'))
          purl.purl = purl.purl.replace(/%2F/g, '/');

      }
    }
    return localDependencies;
  }


  private buildRequest(localDependencies: ILocalDependencies): DependencyRequest {
    try {
      const depRequest = new DependencyRequest();
      depRequest.setDepth(1);
      for (const file of localDependencies.files) {
        const fileMsg = new DependencyRequest.Files();
        fileMsg.setFile(file.file);
        for (const purl of file.purls) {
          const purlMsg = new DependencyRequest.Purls();
          purlMsg.setPurl(purl.purl);
          if(purl?.requirement) purlMsg.setRequirement(purl.requirement);
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

  private repairOutput(localdependency: ILocalDependencies, serverResponse: DependencyResponse.AsObject) {

    // Create a map with key = [filename + purl] and the value is an object containing:
    // * The scope of the local dependency
    // * The requirement of the local dependency
    // Later this map is used to add information in the server response
    const localDependencyInfo = {};
    for (const file of localdependency.files) {
      const filename = file.file
      for (const localDependency of file.purls) {
        const localInfo = {}
        if (localDependency?.scope) localInfo['scope'] = localDependency.scope
        if(localDependency?.requirement) localInfo['requirement'] = localDependency.requirement
        localDependencyInfo[filename + localDependency.purl] = localInfo;
      }
    }

    for (const file of serverResponse.filesList) {
      const filename = file.file
      for (const dependency of file.dependenciesList) {
        const localDependencyData = localDependencyInfo[filename + dependency.purl];
        if (localDependencyData?.scope) dependency['scope'] = localDependencyData.scope;
        if (localDependencyData?.requirement && dependency.version == "") {
          dependency.version = localDependencyData.requirement;
        }
      }
    }
  }


}
