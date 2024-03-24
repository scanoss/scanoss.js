import { Utils } from './Utils/Utils';
import { Logger, logger } from './Logger';
export class BaseConfig {
    constructor() {
        this.PAC = ''; //Read here for more information: https://en.wikipedia.org/wiki/Proxy_auto-config
        this.PROXY = '';
        this.API_URL = '';
    }
    async validate() {
        if (this.PROXY && this.PAC)
            throw new Error("Cannot define PROXY and PAC settings at same time. Choose only one.");
        if (this.PAC) {
            logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]: Fetching PAC file from URI: ${this.PAC}`);
            const proxyStringPAC = await Utils.PACProxyResolver(this.PAC, this.API_URL);
            const proxyListPAC = proxyStringPAC.split(";").filter(item => item.trim().length > 0);
            if (!proxyListPAC.length) {
                logger.log("[ SCANOSS_SDK.BASE_CONFIG ]: No proxy returned from PAC file. Trying to scan anyway with direct connection", Logger.Level.warn);
                return;
            }
            logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]: Proxy list from PAC: ${proxyStringPAC} - Split: ${proxyListPAC}`);
            //Endpoint to test the proxy
            let host = new URL(this.API_URL).origin;
            let healthEndpoint = `${host}/api/health`;
            for (const proxyPAC of proxyListPAC) {
                this.PROXY = Utils.PACProxyURLBuilder(proxyPAC);
                if (this.PROXY) {
                    logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]: Detected proxy ${this.PROXY}   `);
                    logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]: Testing proxy connection against ${healthEndpoint}... `);
                    if (await Utils.testProxyConnection(healthEndpoint, this.PROXY))
                        return;
                }
                else {
                    logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]: DIRECT detected, no using proxy`);
                    logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]: Testing direct connection against ${healthEndpoint}... `);
                    if (await Utils.testConnection(healthEndpoint))
                        return;
                }
            }
            this.PROXY = Utils.PACProxyURLBuilder(proxyListPAC[0]);
            logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]: No successful connection with ${proxyListPAC}. Trying to scan anyway with ${this.PROXY}`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZUNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZGsvQmFzZUNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTFDLE1BQU0sT0FBZ0IsVUFBVTtJQUFoQztRQUNTLFFBQUcsR0FBVyxFQUFFLENBQUMsQ0FBRSxpRkFBaUY7UUFDcEcsVUFBSyxHQUFXLEVBQUUsQ0FBQztRQUNuQixZQUFPLEdBQVcsRUFBRSxDQUFDO0lBdUM5QixDQUFDO0lBckNRLEtBQUssQ0FBQyxRQUFRO1FBQ25CLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMscUVBQXFFLENBQUMsQ0FBQztRQUVuSCxJQUFHLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDWCxNQUFNLENBQUMsR0FBRyxDQUFDLDREQUE0RCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNuRixNQUFNLGNBQWMsR0FBRyxNQUFNLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU1RSxNQUFNLFlBQVksR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFFLENBQUM7WUFDdkYsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUU7Z0JBQ3hCLE1BQU0sQ0FBQyxHQUFHLENBQUMsNEdBQTRHLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUksT0FBTzthQUNSO1lBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxREFBcUQsY0FBYyxhQUFhLFlBQVksRUFBRSxDQUFDLENBQUM7WUFFM0csNEJBQTRCO1lBQzVCLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDeEMsSUFBSSxjQUFjLEdBQUcsR0FBRyxJQUFJLGFBQWEsQ0FBQztZQUUxQyxLQUFLLE1BQU0sUUFBUSxJQUFJLFlBQVksRUFBRztnQkFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRWhELElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDZCxNQUFNLENBQUMsR0FBRyxDQUFDLCtDQUErQyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQztvQkFDM0UsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpRUFBaUUsY0FBYyxNQUFNLENBQUMsQ0FBQztvQkFDbEcsSUFBSSxNQUFNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQzt3QkFBRSxPQUFPO2lCQUN6RTtxQkFBTTtvQkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLDhEQUE4RCxDQUFDLENBQUM7b0JBQzNFLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0VBQWtFLGNBQWMsTUFBTSxDQUFDLENBQUM7b0JBQ25HLElBQUksTUFBTSxLQUFLLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQzt3QkFBRSxPQUFPO2lCQUN4RDthQUNGO1lBRUQsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4REFBOEQsWUFBWSxnQ0FBZ0MsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7U0FFcEk7SUFDSCxDQUFDO0NBQ0YifQ==