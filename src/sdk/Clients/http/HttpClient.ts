import fetch, { Response } from 'node-fetch';
import { ProxyAgent } from 'proxy-agent';
import { Transport } from '../Transport/Transport';
import { Utils } from '../../Utils/Utils';
import FormData from 'form-data';
import { ClientConfig } from "../interfaces/ClientConfig";


export class HttpClient extends Transport<Response>  {

    private readonly proxyAgent: ProxyAgent;
    protected cfg: ClientConfig;

    constructor(cfg?: ClientConfig){
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
        NO_PROXY: this.cfg?.NO_PROXY ? this.cfg?.NO_PROXY : null,
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
