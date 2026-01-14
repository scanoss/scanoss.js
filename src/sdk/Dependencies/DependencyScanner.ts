import { ILocalDependencies, ILocalPurl } from "./LocalDependency/DependencyTypes";
import { LocalDependencies } from './LocalDependency/LocalDependency';
import { DependencyScannerCfg } from './DependencyScannerCfg';
import { PackageURL } from 'packageurl-js';
import fs from 'fs';
import { Tree } from '../tree/Tree';
import { logger } from "../Logger/Logger";
import { DependencyHttpClient } from "../Clients/Dependency/DependencyHttpClient";
import {
  DependencyFile, DependencyRequest,
  DependencyResponse,
  IDependencyClient,
  Status
} from "../Clients/Dependency/IDependencyClient";
import { ClientConfig } from "../Clients/interfaces/ClientConfig";
import { IDependencyResponse } from "./DependencyTypes";


export class DependencyScanner {
  private localDependency: LocalDependencies;

  private dependencyClient: IDependencyClient;

  private config: DependencyScannerCfg = new DependencyScannerCfg();

  constructor(cfg?: DependencyScannerCfg) {
    if (cfg) this.config = cfg;
    else this.config = new DependencyScannerCfg();

    const clientCfg: ClientConfig = {
      API_KEY: this.config.API_KEY,
      HTTP_PROXY: this.config.HTTP_PROXY,
      HTTPS_PROXY: this.config.HTTPS_PROXY,
      NO_PROXY: this.config.NO_PROXY,
      CA_CERT: this.config.CA_CERT,
      IGNORE_CERT_ERRORS: this.config.IGNORE_CERT_ERRORS,
      HOST_URL: this.config.API_URL, // Only map the one that differs. TODO: Migrate to HOST URL on v1 version
    };
    this.dependencyClient = new DependencyHttpClient(clientCfg);
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
    if (localDependencies.files.length === 0) return { filesList: [], status:{ status: 'success', message: 'No dependencies found' } };
    localDependencies = this.purlAdapter(localDependencies);
    const requests: DependencyRequest[] = this.buildRequests(localDependencies);
    const response: IDependencyResponse = await this.getDependencies(requests);
    this.repairOutput(localDependencies, response);
    return response;
  }

  private async getDependencies(requests: Array<DependencyRequest>): Promise<IDependencyResponse> {
    const responseMapper = new Map<string, DependencyFile>();
    let overallStatus: Status = { status: 'success', message: 'Success' };
    const failedRequests = [];
    let err = null;
    for (const request of requests) {
      try {
        const dependencyResponse = await this.dependencyClient.getDependencies(request);
        dependencyResponse.filesList.forEach((file) => {
          if (responseMapper.has(file.file)) {
            const existingFile = responseMapper.get(file.file)!;
            existingFile.dependenciesList.push(...file.dependenciesList);
            // Update status if current file has an error
            if (file.status !== 'success' && existingFile.status === 'success') {
              existingFile.status = file.status;
            }
          } else {
            responseMapper.set(file.file, {
              file: file.file,
              dependenciesList: [...file.dependenciesList],
              status: file.status,
              id: file.id
            });
          }
        });

        // Update overall status if any request failed
        if (dependencyResponse.status.status !== 'success') {
          overallStatus = dependencyResponse.status;
        }
      } catch (e) {
        logger.debug(`Error while scanning dependencies: ${JSON.stringify(request, null, 2)}`);
        err = e;
        failedRequests.push(request);
      }
    }

    if (err) {
      logger.error(err);
    }

    if (failedRequests.length > 0) {
      overallStatus = { status: 'SUCCEEDED WITH WARNINGS', message: 'Warning: some dependencies were not scanned' };
    }
    if(failedRequests.length > 0 && failedRequests.length >= requests.length){
      overallStatus = { status: 'FAILED', message: 'Error while scanning dependencies' };
    }
    return {
      filesList: Array.from(responseMapper.values()),
      status: overallStatus
    };
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
      const requests: DependencyRequest[] = [];
      for (const file of localDependencies.files) {
        const chunkedPurls = this.chunkPurls(file.purls);
        for (const purls of chunkedPurls) {
          const depRequest: DependencyRequest = {
            files: [
              {
                file: file.file,
                purls: purls.map(purl => ({
                  purl: purl.purl,
                  requirement: purl.requirement
                }))
              }
            ]
          };
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
        if (localDependencyData?.scope){
          dependency["scope"] = localDependencyData.scope;
        }
      }
    }
  }
}
