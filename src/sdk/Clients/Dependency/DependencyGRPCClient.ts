import { DependenciesClient } from "../Grpc/scanoss/api/dependencies/v2/scanoss-dependencies_grpc_pb";
import * as DependenciesMessages from '../Grpc/scanoss/api/dependencies/v2/scanoss-dependencies_pb';
import * as CommonMessages from '../Grpc/scanoss/api/common/v2/scanoss-common_pb';
import { BaseGRPCClient } from "../Grpc/BaseGRPCClient";

export class DependencyGRPCClient extends BaseGRPCClient{
  public static readonly clientName = 'Dependency gRPC Client';
  private client: DependenciesClient;

  /**
   * Creates DependencyService Instance.
   * @param {string} hostName - Optional. Destination Host.
   * @param {string} proxyHost -Optional. Proxy Host.
   * @param {string} caCertPath - Optional. Path to certificates.
   */
  constructor(hostName?: string, proxyHost?: string, caCertPath?: string) {
    super({
      HOSTNAME: hostName,
      CLIENT_NAME: DependencyGRPCClient.clientName,
      PROXY_URL: proxyHost,
      CA_CERT: caCertPath,
    });

    this.client = new DependenciesClient(
      this.HOSTNAME,
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
