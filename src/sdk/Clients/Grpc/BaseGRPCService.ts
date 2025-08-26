import * as grpc from '@grpc/grpc-js';
import * as CommonMessages from './scanoss/api/common/v2/scanoss-common_pb';
import { Logger, logger } from '../../Logger';
import { HEADER_NAME_API_TOKEN, SCANOSS_GRPC_ENDPOINT } from '../../Constants';
import Level = Logger.Level;
import { ERROR_SERVICES_GRPC_API_TOKEN_REQUIRED } from '../../Errors';
import fs from "fs";

export interface PurlRequest extends CommonMessages.PurlRequest.AsObject {}

export interface EchoRequest extends CommonMessages.EchoRequest.AsObject {}

export class BaseGRPCService {
  protected _HOSTNAME: string = SCANOSS_GRPC_ENDPOINT;
  protected _API_TOKEN: string = '';
  protected _IS_PREMIUM_SERVICE: boolean = false;
  protected _SERVICE_NAME: string = '';
  protected _CA_CERT: string;
  protected _PROXY_URL: string;

  constructor({
                HOSTNAME,
                PROXY_URL,
                API_TOKEN,
                IS_PREMIUM_SERVICE,
                SERVICE_NAME,
                CA_CERT,
              }: {
    HOSTNAME?: string;
    PROXY_URL?: string
    API_TOKEN?: string;
    IS_PREMIUM_SERVICE?: boolean;
    SERVICE_NAME?: string;
    CA_CERT?: string;
  }) {
    this.API_TOKEN = API_TOKEN;
    this.PROXY_URL = PROXY_URL;
    this.IS_PREMIUM_SERVICE = IS_PREMIUM_SERVICE;
    this.SERVICE_NAME = SERVICE_NAME;
    this.CA_CERT = CA_CERT;
    this.HOSTNAME = HOSTNAME;


    if (this.PROXY_URL) process.env.grpc_proxy = this.PROXY_URL;

    if (this.IS_PREMIUM_SERVICE && !this.API_TOKEN)
      throw new Error(ERROR_SERVICES_GRPC_API_TOKEN_REQUIRED);
  }


  protected handleResponse(response: {
    status: CommonMessages.StatusResponse.AsObject;
  }) {
    const { status, ...responseWithoutStatus } = response;
    if (status.status === CommonMessages.StatusCode.FAILED) {
      logger.log(
        `[ GRPC ${this._SERVICE_NAME} ] - Server GRPC Code: ${status.status} - ${status.message}`,
        Level.error
      );
      throw new Error(status.message);
    } else if (
      status.status === CommonMessages.StatusCode.WARNING ||
      status.status === CommonMessages.StatusCode.SUCCEEDED_WITH_WARNINGS ||
      status.status === CommonMessages.StatusCode.UNSPECIFIED
    ) {
      logger.log(
        `[ GRPC ${this._SERVICE_NAME} ] - Server GRPC Code: ${status.status} - ${status.message}`,
        Level.warn
      );
    } else if (status.status === CommonMessages.StatusCode.SUCCESS) {
      logger.log(
        `[ GRPC ${this._SERVICE_NAME} ] - Server GRPC Code: ${status.status} - ${status.message}`,
        Level.info
      );
    }

    return responseWithoutStatus;
  }

  protected buildGRPCPurlRequest(
    purlRequest: PurlRequest
  ): CommonMessages.PurlRequest {
    const GRPCPurlList = purlRequest.purlsList.map(({ purl, requirement }) => {
      const gRPCPurlMessage = new CommonMessages.PurlRequest.Purls();
      gRPCPurlMessage.setPurl(purl);
      gRPCPurlMessage.setRequirement(requirement);
      return gRPCPurlMessage;
    });
    const gRPCPurlRequest = new CommonMessages.PurlRequest();
    gRPCPurlRequest.setPurlsList(GRPCPurlList);

    return gRPCPurlRequest;
  }

  protected buildGRPCEchoRequest(
    echoRequest: EchoRequest
  ): CommonMessages.EchoRequest {
    const gRPCEchoRequest = new CommonMessages.EchoRequest();
    gRPCEchoRequest.setMessage(echoRequest.message);
    return gRPCEchoRequest;
  }

  protected generateChannelCredentials(): grpc.ChannelCredentials {
    let cc = grpc.credentials.createSsl();

    if (this.CA_CERT && this.PROXY_URL) {
      const caCert = fs.readFileSync(this.CA_CERT);
      cc = grpc.credentials.createSsl(caCert);
    }

    if (this.API_TOKEN) {
      const metaCallback = (_params, callback) => {
        const metadata = new grpc.Metadata();
        metadata.add(HEADER_NAME_API_TOKEN, this.API_TOKEN);
        callback(null, metadata);
      };
      const callCredentials= grpc.credentials.createFromMetadataGenerator(metaCallback);
      cc = grpc.credentials.combineChannelCredentials( cc, callCredentials );
    }

    return cc;
  }

  set SERVICE_NAME(serviceName: string) {
    this._SERVICE_NAME = serviceName;
  }

  get SERVICE_NAME() {
    return this._SERVICE_NAME;
  }

  set HOSTNAME(host: string) {
    if(host !== null && host !== ''){
      //Extract host from URL  (hostname:port)
      if (host.startsWith('http')) {
        const apiURL = new URL(host);
        let hostname: string;
        let port: string;

        if (!apiURL.port) port = apiURL.protocol === 'https:' ? '443' : '80';
        hostname = apiURL.host;
        this._HOSTNAME = `${hostname}:${port}`;
        return;
      }
      this._HOSTNAME = host;
    }
  }

  get HOSTNAME() {
    return this._HOSTNAME;
  }

  set API_TOKEN(apiToken: string) {
    if (apiToken != null && apiToken != '') this._API_TOKEN = apiToken;
  }

  get API_TOKEN() {
    return this._API_TOKEN;
  }

  set IS_PREMIUM_SERVICE(isPremiumService: boolean) {
    if (isPremiumService != null) this._IS_PREMIUM_SERVICE = isPremiumService;
  }

  get IS_PREMIUM_SERVICE() {
    return this._IS_PREMIUM_SERVICE;
  }

  set CA_CERT(caCertPath: string) {
    if (caCertPath != null && caCertPath!='') this._CA_CERT = caCertPath;
  }

  get CA_CERT() {
    return this._CA_CERT;
  }

  set PROXY_URL(proxyURL: string) {
    if (proxyURL != null && proxyURL!=''){
      this._PROXY_URL = proxyURL;
    }
  }

  get PROXY_URL() {
    return this._PROXY_URL;
  }
}
