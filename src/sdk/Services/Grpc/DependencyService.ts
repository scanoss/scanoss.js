import * as grpc from '@grpc/grpc-js';
import { DependenciesClient } from './scanoss/api/dependencies/v2/scanoss-dependencies_grpc_pb';
import * as DependenciesMessages from './scanoss/api/dependencies/v2/scanoss-dependencies_pb';
import * as CommonMessages from './scanoss/api/common/v2/scanoss-common_pb';
import { BaseService } from "./BaseService";

export class DependencyService extends BaseService{
  private client: DependenciesClient;

  private metadata;

  constructor(hostname: string, proxyUrl?: string, ca_cert?: Buffer) {
    super({
      HOSTNAME: hostname,
      IS_PREMIUM_SERVICE: false,
      PROXY_URL: proxyUrl,
      CA_CERT_BUFF: ca_cert,
    });

    this.client = new DependenciesClient(
      hostname,
      this.generateChannelCredentials()
    );
  }

  public async get(
    req: DependenciesMessages.DependencyRequest
  ): Promise<DependenciesMessages.DependencyResponse> {
    return new Promise((resolve, reject) => {
      this.client.getDependencies(req, (err, response) => {
        if (err) reject(err);
        resolve(response);
      });
    });
  }

  public buildDependencyRequestMsg(
    plainObj: DependenciesMessages.DependencyRequest.AsObject
  ): DependenciesMessages.DependencyRequest {
    try {
      const depMessage = new DependenciesMessages.DependencyRequest();
      for (const dependency of plainObj.filesList) {
        const fileMsg = new DependenciesMessages.DependencyRequest.Files();
        fileMsg.setFile(dependency.file);
        for (const purl of dependency.purlsList) {
          const purlMsg = new DependenciesMessages.DependencyRequest.Purls();
          purlMsg.setPurl(purl.purl);
          purlMsg.setRequirement(purl?.requirement);
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

  public async echo(
    req: CommonMessages.EchoRequest
  ): Promise<CommonMessages.EchoResponse> {
    return new Promise((resolve, reject) => {
      this.client.echo(req, (err, response) => {
        if (err) reject(err);
        resolve(response);
      });
    });
  }

  public buildEchoRequestMsg(
    plainObj: CommonMessages.EchoRequest.AsObject
  ): CommonMessages.EchoRequest {
    try {
      const echoMessage = new CommonMessages.EchoRequest();
      echoMessage.setMessage(plainObj.message);
      return echoMessage;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
