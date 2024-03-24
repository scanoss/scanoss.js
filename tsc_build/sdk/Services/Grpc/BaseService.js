import * as grpc from '@grpc/grpc-js';
import * as CommonMessages from './scanoss/api/common/v2/scanoss-common_pb';
import { Logger, logger } from '../../Logger';
import { HEADER_NAME_API_TOKEN, SCANOSS_GRPC_ENDPOINT } from '../../Constants';
var Level = Logger.Level;
import { ERROR_SERVICES_GRPC_API_TOKEN_REQUIRED } from '../../Errors';
export class BaseService {
    constructor() {
        this.GRPC_ENDPOINT = SCANOSS_GRPC_ENDPOINT;
        this.API_TOKEN = '';
        this.IS_PREMIUM_SERVICE = false;
        this.SERVICE_NAME = '';
    }
    handleResponse(response) {
        const { status, ...responseWithoutStatus } = response;
        if (status.status === CommonMessages.StatusCode.FAILED) {
            logger.log(`[ GRPC ${this.SERVICE_NAME} ] - Server GRPC Code: ${status.status} - ${status.message}`, Level.error);
            throw new Error(status.message);
        }
        else if (status.status === CommonMessages.StatusCode.WARNING ||
            status.status === CommonMessages.StatusCode.SUCCEEDED_WITH_WARNINGS ||
            status.status === CommonMessages.StatusCode.UNSPECIFIED) {
            logger.log(`[ GRPC ${this.SERVICE_NAME} ] - Server GRPC Code: ${status.status} - ${status.message}`, Level.warn);
        }
        else if (status.status === CommonMessages.StatusCode.SUCCESS) {
            logger.log(`[ GRPC ${this.SERVICE_NAME} ] - Server GRPC Code: ${status.status} - ${status.message}`, Level.info);
        }
        return responseWithoutStatus;
    }
    buildGRPCPurlRequest(purlRequest) {
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
    buildGRPCEchoRequest(echoRequest) {
        const gRPCEchoRequest = new CommonMessages.EchoRequest();
        gRPCEchoRequest.setMessage(echoRequest.message);
        return gRPCEchoRequest;
    }
    generateChannelCredentials() {
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
        const callCredentials = grpc.credentials.createFromMetadataGenerator(metaCallback);
        return grpc.credentials.combineChannelCredentials(channelCredentials, callCredentials);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2RrL1NlcnZpY2VzL0dycGMvQmFzZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLElBQUksTUFBTSxlQUFlLENBQUM7QUFDdEMsT0FBTyxLQUFLLGNBQWMsTUFBTSwyQ0FBMkMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM5QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvRSxJQUFPLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQzVCLE9BQU8sRUFBRSxzQ0FBc0MsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQU10RSxNQUFNLE9BQU8sV0FBVztJQUF4QjtRQUNZLGtCQUFhLEdBQVcscUJBQXFCLENBQUM7UUFDOUMsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUN2Qix1QkFBa0IsR0FBWSxLQUFLLENBQUM7UUFDcEMsaUJBQVksR0FBVyxFQUFFLENBQUM7SUE0RXRDLENBQUM7SUExRVcsY0FBYyxDQUFDLFFBRXhCO1FBQ0MsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLHFCQUFxQixFQUFFLEdBQUcsUUFBUSxDQUFDO1FBRXRELElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxjQUFjLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUN0RCxNQUFNLENBQUMsR0FBRyxDQUNSLFVBQVUsSUFBSSxDQUFDLFlBQVksMEJBQTBCLE1BQU0sQ0FBQyxNQUFNLE1BQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUN4RixLQUFLLENBQUMsS0FBSyxDQUNaLENBQUM7WUFDRixNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNqQzthQUFNLElBQ0wsTUFBTSxDQUFDLE1BQU0sS0FB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