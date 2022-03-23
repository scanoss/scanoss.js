import { ILocalDependencies } from "./LocalDependency/DependencyTypes";
import { GrpcDependencyService } from "../grpc/GrpcDependencyService";
import { DependencyRequest, DependencyResponse } from "../grpc/scanoss/api/dependencies/v2/scanoss-dependencies_pb";
import { LocalDependencies } from "./LocalDependency/LocalDependency";
import { DependencyScannerCfg } from "./DependencyScannerCfg";
import { IDependencyResponse } from "./DependencyTypes";

export class DependencyScanner {

  private localDependency: LocalDependencies;

  private grpcDependencyService: GrpcDependencyService;

  constructor(cfg = new DependencyScannerCfg()) {
    this.grpcDependencyService = new GrpcDependencyService(cfg.DEFAULT_GRPC_HOST, cfg.DEFAULT_GRPC_PORT);
    this.localDependency = new LocalDependencies();
  }


  public async scan(files: Array<string>): Promise<IDependencyResponse> {
    const localDependencies = await this.localDependency.search(files);
    if (localDependencies.files.length === 0) return {filesList: []};
    const request = this.buildRequest(localDependencies);
    const grpcResponse = await this.grpcDependencyService.get(request);
    const response = grpcResponse.toObject();


    // Extract scope from localDependencies and add it to response
    this.mergeScopeField(localDependencies, response);
    return response;
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

  private mergeScopeField(localdependency: ILocalDependencies, serverResponse: DependencyResponse.AsObject
    ): IDependencyResponse {

    const scopeHashMap = {};

    for (const file of localdependency.files) {
      const filename = file.file
      for (const dependency of file.purls) {
        if (dependency?.scope) scopeHashMap[filename + dependency.purl] = dependency.scope;
      }
    }

    for (const file of serverResponse.filesList) {
      const filename = file.file
      for (const dependency of file.dependenciesList) {
        const scope = scopeHashMap[filename + dependency.purl];
        if (scope) dependency['scope'] = scope;
      }
    }

    return serverResponse;
  }

}
