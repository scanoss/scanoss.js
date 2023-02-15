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
        if (proxyPAC.includes("PROXY")) {
          console.log(new URL(this.API_URL));
          const requestProtocol = new URL(this.API_URL).protocol;   //By default, the PROXY keyword means that a proxy corresponding to the protocol of the original request
          const proxyAddr = proxyPAC.replace(/PROXY/, '').trim();
          this.PROXY = `${requestProtocol}//${proxyAddr}`;
          console.log(this.PROXY)
          return;
        } else if (proxyPAC === "DEFAULT") {
          this.PROXY = "";
          return;
        }
        //Todo: Implement a fail over strategy instead of using the first proxy
      }
    }
  }

}
