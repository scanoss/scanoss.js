import fetch, { Response } from 'node-fetch';
import { ProxyAgent } from 'proxy-agent';
import { Transport } from '../Transport/Transport';
import { Utils } from '../../Utils/Utils';
export interface HttpProxyConfig {
    API_KEY?: string;
    NO_PROXY: string;
    HTTP_PROXY: string;
    HTTPS_PROXY: string;
    IGNORE_CERT_ERRORS: boolean;
    CA_CERT: string;

}
export class HttpProxy  extends Transport<Response>  {

    private readonly proxyAgent: ProxyAgent;
    private cfg: HttpProxyConfig;

    constructor(cfg: HttpProxyConfig){
      super();
      this.cfg = cfg;
      process.env.NO_PROXY = process.env.NO_PROXY || cfg.NO_PROXY
      process.env.HTTP_PROXY = process.env.HTTP_PROXY || cfg.HTTP_PROXY
      process.env.HTTPS_PROXY = process.env.HTTPS_PROXY ||cfg.HTTPS_PROXY
      if (cfg.IGNORE_CERT_ERRORS ) {  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED='1';
      }
      const caCertPath =
        cfg.CA_CERT || process.env.NODE_EXTRA_CA_CERTS;

      if (caCertPath) Utils.loadCaCertFromFile(caCertPath);

      this.proxyAgent = new ProxyAgent();
    }

    async get(url: string): Promise<Response> {
        return await fetch(url, {
            agent: this.proxyAgent,
            method: 'get',
            headers: {
               ...(this.cfg.API_KEY && { 'X-Session': this.cfg.API_KEY }),
             },
        });
    }


}
