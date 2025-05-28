import fs from 'fs';

export class BaseConfig {
  public HTTPS_PROXY: string = '';
  public HTTP_PROXY: string = '';
  public NO_PROXY: string = '';   //comma separated values
  public API_URL: string = '';
  public GRPC_PROXY: string = '';
  public CA_CERT = '';            // Path to the certificate
  public CA_CERT_BUFF: Buffer = null;   // Certificate buffer

  constructor(config?: {
    HTTPS_PROXY?: string;
    HTTP_PROXY?: string;
    NO_PROXY?: string;
    API_URL?: string;
    GRPC_PROXY?: string;
    CA_CERT?: string;
  }) {
    if (config) {
      this.HTTPS_PROXY = config.HTTPS_PROXY || '';
      this.HTTP_PROXY = config.HTTP_PROXY || '';
      this.NO_PROXY = config.NO_PROXY || '';
      this.API_URL = config.API_URL || '';
      this.GRPC_PROXY = config.GRPC_PROXY || '';
      this.CA_CERT = config.CA_CERT || '';
    }
  }

  public async validate() {
    if (this.CA_CERT)
      this.CA_CERT_BUFF = await fs.promises.readFile(this.CA_CERT);


    if (this.API_URL.startsWith('http')) {
      const apiURL = new URL(cfg.API_URL);
      let hostname: string;
      let port: string;

      if (!apiURL.port) port = apiURL.protocol === 'https:' ? '443' : '80';
      hostname = apiURL.host;
      cfg.API_URL = `${hostname}:${port}`;
    }

  }

  public static getDefaultURL (): string {
    return 'https://api.osskb.org/scan/direct';
  }
}
