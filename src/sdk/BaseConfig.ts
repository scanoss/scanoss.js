import fs from 'fs';

export abstract class BaseConfig {
  public HTTPS_PROXY: string = '';
  public HTTP_PROXY: string = '';
  public NO_PROXY: string = '';   //comma separated values
  public API_URL: string = '';
  public GRPC_PROXY: string = '';
  public CA_CERT = '';
  public CA_CERT_BUFF: Buffer = null;

  public async validate() {
    if (this.CA_CERT)
      this.CA_CERT_BUFF = await fs.promises.readFile(this.CA_CERT)
  }

  public static getDefaultURL (): string {
    return 'https://api.osskb.org/scan/direct';
  }
}
