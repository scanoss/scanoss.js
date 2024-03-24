import * as grpc from '@grpc/grpc-js';
import * as CommonMessages from './scanoss/api/common/v2/scanoss-common_pb';
export interface PurlRequest extends CommonMessages.PurlRequest.AsObject {
}
export interface EchoRequest extends CommonMessages.EchoRequest.AsObject {
}
export declare class BaseService {
    protected GRPC_ENDPOINT: string;
    protected API_TOKEN: string;
    protected IS_PREMIUM_SERVICE: boolean;
    protected SERVICE_NAME: string;
    protected handleResponse(response: {
        status: CommonMessages.StatusResponse.AsObject;
    }): {};
    protected buildGRPCPurlRequest(purlRequest: PurlRequest): CommonMessages.PurlRequest;
    protected buildGRPCEchoRequest(echoRequest: EchoRequest): CommonMessages.EchoRequest;
    protected generateChannelCredentials(): grpc.ChannelCredentials;
}
