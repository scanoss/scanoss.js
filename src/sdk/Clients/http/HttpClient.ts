import fetch, { Response } from 'node-fetch';
import { ProxyAgent } from 'proxy-agent';
import { Transport } from '../Transport/Transport';
import { Utils } from '../../Utils/Utils';
import FormData from 'form-data';
import { ClientConfig } from "../interfaces/ClientConfig";
import { logger } from "../../Logger/Logger";


export class HttpClient extends Transport<Response>  {

    private proxyAgent: ProxyAgent;
    protected cfg: ClientConfig;

    constructor(cfg?: ClientConfig){
      super();
      this.cfg = cfg;
      this.init();
    }

    private init(){
      const PAC_URL = this.cfg?.PAC_PROXY ? `pac+${this.cfg.PAC_PROXY.trim()}` : null;
      const proxyConfig = {
        HTTP_PROXY: PAC_URL || this.cfg?.HTTP_PROXY || '',
        HTTPS_PROXY:  PAC_URL || this.cfg?.HTTPS_PROXY || '',
        NO_PROXY: this.cfg?.NO_PROXY ? this.cfg?.NO_PROXY : null,
        CA_CERT: this.cfg?.CA_CERT || process.env.NODE_EXTRA_CA_CERTS || null,
        IGNORE_CERT_ERRORS: this.cfg?.IGNORE_CERT_ERRORS ?? process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0'
      }


      // Build TLS options
      const caCerts = proxyConfig.CA_CERT ? Utils.readCaCertsFromFile(proxyConfig.CA_CERT) : undefined;

      logger.debug(`[${this.constructor.name}] TLS Config:', {
        ignoreCertErrors: ${proxyConfig.IGNORE_CERT_ERRORS},
        rejectUnauthorized: ${!this.cfg.IGNORE_CERT_ERRORS},
        caCertPath: ${this.cfg.CA_CERT || 'not set'},
        hasCaCerts:  ${!!caCerts || 'not set'}
      }`);

      logger.debug(`[${this.constructor.name}] Proxy Config:', {
        HTTP_PROXY: ${this.cfg.HTTP_PROXY || 'no set'},
        HTTPS_PROXY: ${this.cfg.HTTPS_PROXY || 'no set'},
        ENV_HTTP_PROXY: ${process.env.HTTP_PROXY || 'no set'},
        ENV_HTTPS_PROXY: ${process.env.HTTPS_PROXY || 'no set'}
      }`);

      // TLS options at root level are passed to proxy agents (http-proxy-agent, https-proxy-agent)
      // httpsAgent is only used when NO proxy is configured
      this.proxyAgent = new ProxyAgent({
        rejectUnauthorized: !proxyConfig.IGNORE_CERT_ERRORS,
        ca: caCerts,
        getProxyForUrl: (url) => {
          const isHttps = url.startsWith('https');
          let proxyUrl = isHttps
            ? (proxyConfig.HTTPS_PROXY || process.env.HTTPS_PROXY)
            : (proxyConfig.HTTP_PROXY || process.env.HTTP_PROXY);

          // Add http:// protocol if missing (required for URL parsing)
          if (proxyUrl && !proxyUrl.startsWith('http://') && !proxyUrl.startsWith('https://')) {
            proxyUrl = `http://${proxyUrl}`;
          }

          return proxyUrl || null;
        }
      });
    }

    public async get(url: string): Promise<Response> {
        return await fetch(url, {
            agent: this.proxyAgent,
            method: 'get',
            headers: {
               ...(this.cfg.API_KEY && { 'x-api-key': this.cfg.API_KEY }),
             },
        });
    }

  public async post(url: string, body: any): Promise<Response> {
    return await fetch(url, {
      agent: this.proxyAgent,
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...(this.cfg.API_KEY && { 'x-api-key': this.cfg.API_KEY })
      },
    });
  }

  public async delete(url: string): Promise<Response> {
    return await fetch(url, {
      agent: this.proxyAgent,
      method: 'delete',
      headers: {
        ...(this.cfg.API_KEY && { 'x-api-key': this.cfg.API_KEY }),
      },
    });
  }

  public async put(url: string, body: FormData): Promise<Response> {
    return await fetch(url, {
      agent: this.proxyAgent,
      method: 'put',
      body: body,
      headers: {
        ...(this.cfg.API_KEY && { 'x-api-key': this.cfg.API_KEY })
      },
    });
  }

  protected handleError(error: unknown, context: string): Error {
    if (error instanceof Error) {
      return new Error(`${context}: ${error.message}`);
    }
    return new Error(`${context}: Unknown error occurred`);
  }

  protected hostURL():string {
      return this.cfg.HOST_URL;
  }
}
