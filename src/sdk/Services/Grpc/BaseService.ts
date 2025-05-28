import * as grpc from '@grpc/grpc-js';
import * as CommonMessages from './scanoss/api/common/v2/scanoss-common_pb';
import { Logger, logger } from '../../Logger';
import { HEADER_NAME_API_TOKEN, SCANOSS_GRPC_ENDPOINT } from '../../Constants';
import Level = Logger.Level;
import { ERROR_SERVICES_GRPC_API_TOKEN_REQUIRED } from '../../Errors';
import { BaseConfig } from "../../BaseConfig";
import * as buffer from "node:buffer";

export interface PurlRequest extends CommonMessages.PurlRequest.AsObject {}

export interface EchoRequest extends CommonMessages.EchoRequest.AsObject {}

export class BaseService {
  protected HOSTNAME: string = SCANOSS_GRPC_ENDPOINT;
  protected API_TOKEN: string = '';
  protected IS_PREMIUM_SERVICE: boolean = false;
  protected SERVICE_NAME: string = '';
  protected CA_CERT: string;    //This is
  protected PROXY_URL: string;

  constructor({
                HOSTNAME,
                PROXY_URL,
                API_TOKEN,
                IS_PREMIUM_SERVICE,
                SERVICE_NAME,
                CA_CERT,
              }: {
    HOSTNAME: string;
    PROXY_URL?: string
    API_TOKEN?: string;
    IS_PREMIUM_SERVICE?: boolean;
    SERVICE_NAME?: string;
    CA_CERT?: string;
  }) {

    this.HOSTNAME = HOSTNAME;
    this.API_TOKEN = API_TOKEN;
    this.PROXY_URL = PROXY_URL
    this.IS_PREMIUM_SERVICE = IS_PREMIUM_SERVICE;
    this.SERVICE_NAME = SERVICE_NAME;
    this.CA_CERT_BUFF = CA_CERT_BUFF;

    if (PROXY_URL) process.env.grpc_proxy = PROXY_URL;
  }


  protected handleResponse(response: {
    status: CommonMessages.StatusResponse.AsObject;
  }) {
    const { status, ...responseWithoutStatus } = response;
    if (status.status === CommonMessages.StatusCode.FAILED) {
      logger.log(
        `[ GRPC ${this.SERVICE_NAME} ] - Server GRPC Code: ${status.status} - ${status.message}`,
        Level.error
      );
      throw new Error(status.message);
    } else if (
      status.status === CommonMessages.StatusCode.WARNING ||
      status.status === CommonMessages.StatusCode.SUCCEEDED_WITH_WARNINGS ||
      status.status === CommonMessages.StatusCode.UNSPECIFIED
    ) {
      logger.log(
        `[ GRPC ${this.SERVICE_NAME} ] - Server GRPC Code: ${status.status} - ${status.message}`,
        Level.warn
      );
    } else if (status.status === CommonMessages.StatusCode.SUCCESS) {
      logger.log(
        `[ GRPC ${this.SERVICE_NAME} ] - Server GRPC Code: ${status.status} - ${status.message}`,
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

    if (this.CA_CERT_BUFF) {

    }
    const channelCredentials = grpc.credentials.createSsl();
    /*
    static createSsl(
        rootCerts?: Buffer | null,
        privateKey?: Buffer | null,
        certChain?: Buffer | null,
        verifyOptions?: VerifyOptions,
        ): ChannelCredentials
     */

    if (this.IS_PREMIUM_SERVICE && !this.API_TOKEN)
      throw new Error(ERROR_SERVICES_GRPC_API_TOKEN_REQUIRED);

    if (!this.IS_PREMIUM_SERVICE && !this.API_TOKEN)
      return grpc.credentials.createSsl();

    const channelCredentials = grpc.credentials.createSsl();
    const metaCallback = (_params, callback) => {
      const metadata = new grpc.Metadata();
      metadata.add(HEADER_NAME_API_TOKEN, this.API_TOKEN);
      callback(null, metadata);
    };
    const callCredentials =
      grpc.credentials.createFromMetadataGenerator(metaCallback);
    return grpc.credentials.combineChannelCredentials(
      channelCredentials,
      callCredentials
    );
  }
}
