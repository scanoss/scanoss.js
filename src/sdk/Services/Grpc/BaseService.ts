import * as grpc from '@grpc/grpc-js';
import * as CommonMessages from './scanoss/api/common/v2/scanoss-common_pb';
import { Logger, logger } from '../../Logger';
import { HEADER_NAME_API_TOKEN, SCANOSS_GRPC_ENDPOINT } from '../../Constants';
import Level = Logger.Level;
import { ERROR_SERVICES_GRPC_API_TOKEN_REQUIRED } from '../../Errors';

export interface PurlRequest extends CommonMessages.PurlRequest.AsObject {}

export interface EchoRequest extends CommonMessages.EchoRequest.AsObject {}

export class BaseService {
  protected GRPC_ENDPOINT: string = SCANOSS_GRPC_ENDPOINT;
  protected API_TOKEN: string = '';
  protected IS_PREMIUM_SERVICE: boolean = false;
  protected SERVICE_NAME: string = '';

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
