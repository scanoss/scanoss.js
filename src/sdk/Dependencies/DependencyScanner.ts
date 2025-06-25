import { ILocalDependencies, ILocalPurl } from "./LocalDependency/DependencyTypes";
import { DependencyService } from '../Services/Grpc/DependencyService';
import {
  DependencyRequest,
  DependencyResponse,
} from '../Services/Grpc/scanoss/api/dependencies/v2/scanoss-dependencies_pb';
import { LocalDependencies } from './LocalDependency/LocalDependency';
import { DependencyScannerCfg } from './DependencyScannerCfg';
import { IDependencyResponse } from './DependencyTypes';
import { PackageURL } from 'packageurl-js';
import fs from 'fs';
import { Tree } from '../tree/Tree';
import { logger } from "../Logger";

export class DependencyScanner {
  private localDependency: LocalDependencies;

  private grpcDependencyService: DependencyService;

  private config: DependencyScannerCfg = new DependencyScannerCfg();

  constructor(cfg?: DependencyScannerCfg) {

    if (cfg) this.config = cfg;
    this.grpcDependencyService = new DependencyService(this.config.API_URL, this.config.GRPC_PROXY, this.config.CA_CERT);
    this.localDependency = new LocalDependencies();
  }

  public async scanFolder(path: string) {
    if (!(await fs.promises.lstat(path)).isDirectory())
      throw new Error('Specified path is not a directory');
    const tree = new Tree(path);
    tree.build();
    return await this.scan(tree.getFileList());
  }

  public async scan(files: Array<string>): Promise<IDependencyResponse> {
    let localDependencies = await this.localDependency.search(files);
    if (localDependencies.files.length === 0) return { filesList: [] };
    localDependencies = this.purlAdapter(localDependencies);
    const requests: DependencyRequest[] = this.buildRequests(localDependencies);
    const response: IDependencyResponse = await this.getDependencies(requests);
    this.repairOutput(localDependencies, response);
    return response;
  }

  private async getDependencies(requests: Array<DependencyRequest>): Promise<IDependencyResponse> {
    const responseMapper = new Map<string,IDependencyResponse>;
    for (const request of requests) {
      try {
        const grpcResponse = await this.grpcDependencyService.get(request);
        const file = grpcResponse.getFilesList()[0].getFile();
        const responseToObject = grpcResponse.toObject();
        if(responseMapper.has(file)){
          responseMapper.get(file).filesList[0].dependenciesList.push(...responseToObject.filesList[0].dependenciesList);
          // Change response status if one response is not success
          if(responseToObject.status.message!=="Success"){
            responseMapper.get(file).status = responseToObject.status.message;
          }
        }else{
          responseMapper.set(file,responseToObject as any);
        }
      }catch(e) {
        console.error(e);
        logger.log(`Error while scanning dependencies.", ${request.getFilesList()[0].getFile()}, ${request.getFilesList()[0].getPurlsList()}`)
      }
    }
    const response: IDependencyResponse = {
      filesList: [],
      status: 'Success',
    }
    responseMapper.forEach((depResponse: IDependencyResponse)=>{
      response.filesList.push(depResponse.filesList[0]);
      if(depResponse.status !== 'Success'){
        response.status = depResponse.status;
      }
    });
    return response;
  }

  private purlAdapter(
    localDependencies: ILocalDependencies
  ): ILocalDependencies {
    for (const file of localDependencies.files) {
      for (const purl of file.purls) {
        //If purl has a specific version, remove it and place the "version" value into requirement field.
        const version = PackageURL.fromString(purl.purl).version;
        if (version) {
          purl.requirement = version;
          purl.purl = purl.purl.replace('@' + version, '');
        }

        if (purl.purl.includes('%2F'))
          purl.purl = purl.purl.replace(/%2F/g, '/');
      }
    }
    return localDependencies;
  }

  private chunkPurls(purls: Array<ILocalPurl>): Array<Array<ILocalPurl>> {
    const chunks = [];
    for (let i = 0; i < purls.length; i += this.config.CHUNK_REQUEST_SIZE) {
      chunks.push(purls.slice(i, i + this.config.CHUNK_REQUEST_SIZE));
    }
    return chunks;
  }

  private buildRequests(
    localDependencies: ILocalDependencies
  ): Array<DependencyRequest> {
    try {
      const requests = [];
      for (const file of localDependencies.files) {
        const chunkedPurls = this.chunkPurls(file.purls)
        for (const purls of chunkedPurls) {
          const depRequest = new DependencyRequest();
          depRequest.setDepth(1);
          const fileMsg = new DependencyRequest.Files();
          fileMsg.setFile(file.file);
            for (const purl of purls) {
              const purlMsg = new DependencyRequest.Purls();
              purlMsg.setPurl(purl.purl);
              if (purl?.requirement) purlMsg.setRequirement(purl.requirement);
              fileMsg.addPurls(purlMsg);
            }
            depRequest.addFiles(fileMsg);
            requests.push(depRequest);
        }
      }
      return requests;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private repairOutput(
    localdependency: ILocalDependencies,
    serverResponse: IDependencyResponse
  ) {
    // Create a map with key = [filename + purl] and the value is an object containing:
    // * The scope of the local dependency
    // * The requirement of the local dependency
    // Later this map is used to add information in the server response
    const localDependencyInfo = {};
    for (const file of localdependency.files) {
      const filename = file.file;
      for (const localDependency of file.purls) {
        const localInfo = {};
        if (localDependency?.scope) localInfo['scope'] = localDependency.scope;
        if (localDependency?.requirement)
          localInfo['requirement'] = localDependency.requirement;
        localDependencyInfo[filename + localDependency.purl] = localInfo;
      }
    }

    for (const file of serverResponse.filesList) {
      const filename = file.file;
      for (const dependency of file.dependenciesList) {
        const localDependencyData =
          localDependencyInfo[filename + dependency.purl];
        if (localDependencyData?.scope)
          dependency['scope'] = localDependencyData.scope;
        if (localDependencyData?.requirement && dependency.version == '') {
          dependency.version = localDependencyData.requirement;
        }
      }
    }
  }
}
