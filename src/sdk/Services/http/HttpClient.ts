import fetch, { Response } from 'node-fetch';
import { ProxyAgent } from 'proxy-agent';
import { Transport } from '../Transport/Transport';
import { Utils } from '../../Utils/Utils';
import FormData from 'form-data';
export interface HttpProxyConfig {
    PAC_PROXY?: string;
    API_KEY?: string;
    NO_PROXY?: Array<string>;
    HTTP_PROXY?: string;
    HTTPS_PROXY?: string;
    IGNORE_CERT_ERRORS?: boolean;
    CA_CERT?: string;

}
export class HttpClient  extends Transport<Response>  {

    private readonly proxyAgent: ProxyAgent;
    private cfg: HttpProxyConfig;

    constructor(cfg?: HttpProxyConfig){
      super();
      this.cfg = cfg;
      this.init();
      this.proxyAgent = new ProxyAgent();
    }

    private init(){
      const PAC_URL = this.cfg?.PAC_PROXY ? `pac+${this.cfg.PAC_PROXY.trim()}` : null;
        const proxyConfig = {
        HTTP_PROXY: PAC_URL || this.cfg?.HTTP_PROXY || '',
        HTTPS_PROXY:  PAC_URL || this.cfg?.HTTPS_PROXY || '',
        NO_PROXY: this.cfg?.NO_PROXY ? this.cfg?.NO_PROXY.join(',') : null,
        CA_CERT: this.cfg?.CA_CERT || null,
        IGNORE_CERT_ERRORS: this.cfg?.IGNORE_CERT_ERRORS || false
      }

      process.env.NO_PROXY = process.env.NO_PROXY || proxyConfig.NO_PROXY
      process.env.HTTP_PROXY = process.env.HTTP_PROXY || proxyConfig.HTTP_PROXY
      process.env.HTTPS_PROXY = process.env.HTTPS_PROXY ||proxyConfig.HTTPS_PROXY
      if (proxyConfig.IGNORE_CERT_ERRORS ) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED='1';
      }
      const caCertPath =
        proxyConfig.CA_CERT || process.env.NODE_EXTRA_CA_CERTS;

      if (caCertPath) Utils.loadCaCertFromFile(caCertPath);
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

  async post(url: string, body: FormData): Promise<Response> {
    return await fetch(url, {
      agent: this.proxyAgent,
      method: 'post',
      body: body,
      headers: {
        ...(this.cfg.API_KEY && { 'X-Session': this.cfg.API_KEY })
      },
    });
  }

  async delete(url: string): Promise<Response> {
    return await fetch(url, {
      agent: this.proxyAgent,
      method: 'delete',
      headers: {
        ...(this.cfg.API_KEY && { 'X-Session': this.cfg.API_KEY }),
      },
    });
  }

  async put(url: string, body: FormData): Promise<Response> {
    return await fetch(url, {
      agent: this.proxyAgent,
      method: 'put',
      body: body,
      headers: {
        ...(this.cfg.API_KEY && { 'X-Session': this.cfg.API_KEY })
      },
    });
  }


}
