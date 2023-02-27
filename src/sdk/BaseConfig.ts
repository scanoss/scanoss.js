import { Utils } from './Utils/Utils';
import { Logger, logger } from './Logger';

export abstract class BaseConfig {
  public PAC: string = '';  //Read here for more information: https://en.wikipedia.org/wiki/Proxy_auto-config
  public PROXY: string = '';
  public API_URL: string = '';

  public async validate() {
    if (this.PROXY && this.PAC) throw new Error("Cannot define PROXY and PAC settings at same time. Choose only one.");

    if(this.PAC) {
      logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]: Fetching PAC file from URI: ${this.PAC}`);
      const proxyStringPAC = await Utils.PACProxyResolver(this.PAC, this.API_URL);

      const proxyListPAC = proxyStringPAC.split(";").filter(item => item.trim().length > 0 );
      if (!proxyListPAC.length) {
        logger.log("[ SCANOSS_SDK.BASE_CONFIG ]: No proxy returned from PAC file. Trying to scan anyway with direct connection", Logger.Level.warn);
        return;
      }

      //Endpoint to test the proxy
      let host = new URL(this.API_URL).origin;
      let healthEndpoint = `${host}/api/health`;

      for (const proxyPAC of proxyListPAC ) {
        this.PROXY = Utils.PACProxyURLBuilder(proxyPAC);

        if (this.PROXY) {
          logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]: Proxy parsed ${this.PROXY}   `);
          logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]: Testing proxy connection against ${healthEndpoint}... `);
          if (await Utils.testProxyConnection(healthEndpoint, this.PROXY)) return;
        } else {
          logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]:  No using proxy. DIRECT detected`);
          logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]: Testing direct connection against ${healthEndpoint}... `);
          if (await Utils.testConnection(healthEndpoint)) return;
        }
      }

      this.PROXY = Utils.PACProxyURLBuilder(proxyListPAC[0]);
      logger.log(`[ SCANOSS_SDK.BASE_CONFIG ]: No successful connection with ${proxyListPAC}. Trying to scan anyway with ${this.PROXY}`);

    }
  }
}
