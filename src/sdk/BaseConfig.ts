export abstract class BaseConfig {
  public HTTPS_PROXY: string = '';
  public HTTP_PROXY: string = '';
  public NO_PROXY: string = '';   //comma separated values
  public API_URL: string = '';
  public GRPC_PROXY: string = '';

  public async validate() {}

  public static getDefaultURL (): string {
    return 'https://api.osskb.org/scan/direct';
  }
}
