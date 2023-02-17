import { Utils } from './Utils/Utils';

export abstract class BaseConfig {
  public PAC: string = '';  //Read here for more information: https://en.wikipedia.org/wiki/Proxy_auto-config
  public PROXY: string = '';
  public API_URL: string = '';

  public async validate() {
    if (this.PROXY && this.PAC) throw new Error("Cannot define PROXY and PAC settings at same time. Choose only one.")

    if(this.PAC) {
      const proxyStringPAC = await Utils.PACProxyResolver(this.PAC, this.API_URL);
      const proxyListPAC = proxyStringPAC.split(";");
      for (const proxyPAC of proxyListPAC ) {
        if(/(?:HTTPS|HTTP)/.test(proxyPAC)) {
          //The following line replaces the HTTPS/HTTP substring and appends
          //the protocol to the proxy address.
          this.PROXY = proxyPAC.replace(/(HTTPS|HTTP)\s+/,
            (match, g1) => {return `${g1.toLowerCase()}://`});
        } else if (/PROXY/i.test(proxyPAC)) {
          this.PROXY = "http://" + proxyPAC.replace(/PROXY/, '').trim();
        } else if (/DEFAULT/.test(proxyPAC)) {
          this.PROXY = null;
        }

        console.log("Read proxy config from PAC file: ", this.PROXY);
        if (!this.PROXY && await Utils.testConnection(this.API_URL)) return;
        if (await Utils.testProxyConnection(this.PROXY, this.API_URL)) return;
        console.log("Proxy not valid...")
      }
    throw new Error("PAC file does not contains any valid proxy")
    }
  }
}
