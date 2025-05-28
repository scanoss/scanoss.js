import fs from 'fs';
import { URL } from "url";
import * as Buffer from "buffer";

export interface IBaseConfig {
  HTTPS_PROXY?: string;
  HTTP_PROXY?: string;
  NO_PROXY?: string;
  API_URL?: string;
  GRPC_PROXY?: string;
  CA_CERT?: string;
}

export class BaseConfig {
  protected _HTTPS_PROXY: string = '';
  protected _HTTP_PROXY: string = '';
  protected _NO_PROXY: string = '';   //comma separated values
  protected _API_URL: string = '';
  protected _GRPC_PROXY: string = '';
  protected _CA_CERT = '';            // Path to the certificate
  protected _CA_CERT_BUFF: Buffer = null;   // Certificate buffer

  constructor(config?: IBaseConfig) {
    if (config) {
      this._HTTPS_PROXY = config.HTTPS_PROXY || '';
      this._HTTP_PROXY = config.HTTP_PROXY || '';
      this._NO_PROXY = config.NO_PROXY || '';
      this._API_URL = config.API_URL || '';
      this._GRPC_PROXY = config.GRPC_PROXY || '';
      this._CA_CERT = config.CA_CERT || '';
    }

    this.validate();
  }

  public validate() {
    // Validates certificate path
    if (this._CA_CERT) {
      this._CA_CERT_BUFF = fs.readFileSync(this._CA_CERT);
    }
    this.API_URL = this._API_URL
  }

  public static getDefaultURL (): string {
    return 'https://api.osskb.org/scan/direct';
  }

  get NO_PROXY(): string {
    return this._NO_PROXY;
  }

  get HTTPS_PROXY(): string {
    return this._HTTPS_PROXY;
  }

  get HTTP_PROXY(): string {
    return this._HTTP_PROXY;
  }

  get API_URL(): string {
    return this._API_URL;
  }

  set API_URL(apiUrl: string) {
    if (apiUrl.startsWith('http://')) {
      const apiURL = new URL(apiUrl);
      let hostname: string;
      let port: string;

      if (!apiURL.port) port = apiURL.protocol === 'https:' ? '443' : '80';
      hostname = apiURL.host;
      this._API_URL = `${hostname}:${port}`;
      return;
    }
    this._API_URL = apiUrl;
  }

  get GRPC_PROXY(): string {
    return this._GRPC_PROXY;
  }

  get CA_CERT(): string {
    return this._CA_CERT;
  }

  get CA_CERT_BUFF(): Buffer {
    return this._CA_CERT_BUFF;
  }
}
