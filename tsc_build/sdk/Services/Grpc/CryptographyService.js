import { CryptographyClient } from './scanoss/api/cryptography/v2/scanoss-cryptography_grpc_pb';
import { BaseService } from './BaseService';
import { ERROR_SERVICES_GRPC_API_TOKEN_REQUIRED } from '../../Errors';
export class CryptographyService extends BaseService {
    constructor(token, proxy) {
        super();
        this.SERVICE_NAME = 'CryptographyService';
        this.IS_PREMIUM_SERVICE = true;
        this.API_TOKEN = token;
        if (this.IS_PREMIUM_SERVICE && !this.API_TOKEN)
            throw new Error(ERROR_SERVICES_GRPC_API_TOKEN_REQUIRED);
        if (proxy)
            process.env.grpc_proxy = proxy;
        this.client = new CryptographyClient(this.GRPC_ENDPOINT, this.generateChannelCredentials());
    }
    async getAlgorithms(req) {
        return new Promise((resolve, reject) => {
            this.client.getAlgorithms(this.buildGRPCPurlRequest(req), (err, response) => {
                if (err)
                    reject(err);
                try {
                    // @ts-ignore
                    resolve(this.handleResponse(response.toObject()));
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3J5cHRvZ3JhcGh5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZGsvU2VydmljZXMvR3JwYy9DcnlwdG9ncmFwaHlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDREQUE0RCxDQUFDO0FBRWhHLE9BQU8sRUFBRSxXQUFXLEVBQWUsTUFBTSxlQUFlLENBQUM7QUFDekQsT0FBTyxFQUFFLHNDQUFzQyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBS3RFLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxXQUFXO0lBR2xELFlBQVksS0FBYSxFQUFFLEtBQWM7UUFDdkMsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsWUFBWSxHQUFHLHFCQUFxQixDQUFDO1FBQzFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7UUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFFdkIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztZQUM1QyxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7UUFFMUQsSUFBSSxLQUFLO1lBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBRTFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxrQkFBa0IsQ0FDbEMsSUFBSSxDQUFDLGFBQWEsRUFDbEIsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQ2xDLENBQUM7SUFDSixDQUFDO0lBRU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQjtRQUN6QyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUN2QixJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEVBQzlCLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUNoQixJQUFJLEdBQUc7b0JBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQixJQUFJO29CQUNGLGFBQWE7b0JBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDbkQ7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ1YsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNYO1lBQ0gsQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRiJ9