import * as grpc from '@grpc/grpc-js';
import { GrpcConfig } from './GrpcConfig';
import { DependenciesClient } from './scanoss/api/dependencies/v2/scanoss-dependencies_grpc_pb';
import * as DependenciesMessages from './scanoss/api/dependencies/v2/scanoss-dependencies_pb.js';

import * as CommonMessages from './scanoss/api/common/v2/scanoss-common_pb'

export class GrpcDependencyService {

  private client: DependenciesClient;

  private config: GrpcConfig;

  constructor(cfg = new GrpcConfig()) {
    this.config = cfg;

    this.client = new DependenciesClient(
                this.config.DEFAULT_GRPC_HOST+':'+this.config.DEFAULT_GRPC_PORT,
                grpc.credentials.createInsecure());
  }

  public async get(req: DependenciesMessages.DependencyRequest): Promise<DependenciesMessages.DependencyResponse> {
    //const msg = this.buildDepRequestFromPlainObject(request);
    return new Promise((resolve, reject) => {
      this.client.getDependencies(req, (err, response) => {
        if (err) reject(err);
        resolve(response);
      });
    });
  }

  private buildDepRequestFromPlainObject(plainObj: DependenciesMessages.DependencyRequest.AsObject): DependenciesMessages.DependencyRequest {
    try {
      const depMessage = new DependenciesMessages.DependencyRequest();
      for (const dependency of plainObj.filesList) {
        const fileMsg = new DependenciesMessages.DependencyRequest.Files();
        fileMsg.setFile(dependency.file);
        for (const purl of dependency.purlsList) {
          const purlMsg = new DependenciesMessages.DependencyRequest.Purls();
          purlMsg.setPurl(purl.purl);
          purlMsg.setRequirement(purl.requirement);
          fileMsg.addPurls(purlMsg);
        }
        depMessage.addFiles(fileMsg);
      }
      return depMessage;
    } catch (e) {
      console.error(e);
      return null;
    }
  }


  public async echo(req: CommonMessages.EchoRequest): Promise<CommonMessages.EchoResponse> {
    //const msg = this.buildEchoRequestFromPlainObject(request);
    return new Promise((resolve, reject) => {
      this.client.echo(req, (err, response) => {
        if (err) reject(err);
        resolve(response);
      });
    });
  }


  private buildEchoRequestFromPlainObject(plainObj: CommonMessages.EchoRequest.AsObject): CommonMessages.EchoRequest {
      const echoMessage = new CommonMessages.EchoRequest();
      echoMessage.setMessage(plainObj.message);
      return echoMessage;
  }

}
