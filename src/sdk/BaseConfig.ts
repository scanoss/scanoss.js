import fs from 'fs';

export interface IBaseConfig {
  HTTPS_PROXY?: string;
  HTTP_PROXY?: string;
  NO_PROXY?: string;
  API_URL?: string;
  GRPC_PROXY?: string;
  CA_CERT?: string;
}


export class BaseConfig {
  private _HTTPS_PROXY: string = '';
  private _HTTP_PROXY: string = '';
  private _NO_PROXY: string = '';   //comma separated values
  private _API_URL: string = '';
  private _GRPC_PROXY: string = '';
  private _CA_CERT = '';   // Path to the certificate to be used in SSL/TLS connection

  constructor(config?: IBaseConfig) {
    if (config) {
      this.HTTPS_PROXY = config.HTTPS_PROXY || '';
      this.HTTP_PROXY = config.HTTP_PROXY || '';
      this.NO_PROXY = config.NO_PROXY || '';
      this.API_URL = config.API_URL || '';
      this.GRPC_PROXY = config.GRPC_PROXY || '';
      this.CA_CERT = config.CA_CERT;
    }
  }

  public static getDefaultURL (): string {
    return 'https://api.osskb.org/scan/direct';
  }

  set HTTPS_PROXY(value: string) {
    this._HTTPS_PROXY = value;
  }

  set HTTP_PROXY(value: string) {
    this._HTTP_PROXY = value;
  }

  set NO_PROXY(value: string) {
    this._NO_PROXY = value;
  }

  /**
   * Sets the API URL for service connections with validation
   * @param value - The API URL (must start with http:// or https://)
   * @throws {Error} When the URL is empty, missing http/https protocol, or has invalid format
   */
  set API_URL(value: string) {
    if (!value) {
      throw new Error('API_URL is required and cannot be empty');
    }

    if (!value.startsWith('http')) {
      throw new Error(`API_URL must start with 'http://' or 'https://', got: '${value}'`);
    }

    try {
      new URL(value);
      this._API_URL = value;
    } catch (e) {
      throw new Error(`Invalid API_URL format '${value}': ${e.message}`);
    }
  }

  set GRPC_PROXY(value: string) {
    this._GRPC_PROXY = value;
  }

  /**
   * Sets the CA certificate file path for gRPC connections
   * @param caCertPath - Path to the CA certificate file
   * @throws {Error} When the certificate file does not exist or cannot be read
   */
  set CA_CERT(caCertPath: string) {
    if (caCertPath == null || caCertPath === '') return;
    try {
        fs.readFileSync(caCertPath);
        this._CA_CERT = caCertPath;
    } catch(e) {
      throw new Error(`Certificate file not found: '${caCertPath}'`);
    }
  }

  get HTTPS_PROXY(): string {
    return this._HTTPS_PROXY;
  }

  get HTTP_PROXY(): string {
    return this._HTTP_PROXY;
  }

  get NO_PROXY(): string {
    return this._NO_PROXY;
  }

  get API_URL(): string {
    return this._API_URL;
  }

  get GRPC_PROXY(): string {
    return this._GRPC_PROXY;
  }

  get CA_CERT(): string {
    return this._CA_CERT;
  }
}
