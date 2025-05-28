import fs from 'fs';
import { URL } from "url";
import * as Buffer from "buffer";


export class BaseConfig {
  public HTTPS_PROXY: string = '';
  public HTTP_PROXY: string = '';
  public NO_PROXY: string = '';   //comma separated values
  protected _API_URL: string = '';
  public GRPC_PROXY: string = '';
  public _CA_CERT = '';            // Path to the certificate
  protected CA_CERT_BUFF: Buffer = null;   // Certificate buffer

  constructor(config?: BaseConfig) {
    if (config) {
      this.HTTPS_PROXY = config.HTTPS_PROXY || '';
      this.HTTP_PROXY = config.HTTP_PROXY || '';
      this.NO_PROXY = config.NO_PROXY || '';
      this._API_URL = config.API_URL || '';
      this.GRPC_PROXY = config.GRPC_PROXY || '';
      this._CA_CERT = config.CA_CERT || '';
    }

    this.validate();
  }

  public validate() {
    this.CA_CERT = this._CA_CERT || '';
    this.API_URL = this._API_URL
  }

  public static getDefaultURL (): string {
    return 'https://api.osskb.org/scan/direct';
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


  get CA_CERT(): string {
    return this._CA_CERT;
  }

  set CA_CERT(caCert:string) {
      if(fs.readFileSync(caCert)){
        this._CA_CERT = caCert;
      }
  }
}
