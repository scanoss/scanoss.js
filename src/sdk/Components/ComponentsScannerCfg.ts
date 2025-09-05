import { BaseConfig } from "../BaseConfig";

export class ComponentsScannerCfg extends BaseConfig {

  _API_KEY: string = '';
  _USE_GRPC: boolean = false;

  constructor(config?: ComponentsScannerCfg) {
    super(config);
    if(config){
      this.API_KEY = config.API_KEY ? config.API_KEY : '';
      this.USE_GRPC = config.USE_GRPC !== undefined ? config.USE_GRPC : false;
    }
  }

  get API_KEY(): string{
    return this._API_KEY;
  }

  set API_KEY(value: string){
    this._API_KEY = value;
  }

  get USE_GRPC(): boolean {
    return this._USE_GRPC;
  }

  set USE_GRPC(value: boolean) {
    this._USE_GRPC = value;
  }

  /**
   * Resolves the appropriate scanner URL based on API key presence and current URL.
   * If an API key is provided and the current URL is the default, returns the premium
   * scanner URL, otherwise removes '/scan/direct' suffix from the URL.
   * @param apiKey - The API key (if any)
   * @param currentUrl - The current API URL
   * @returns The resolved scanner URL
   */
  protected resolveApiUrl(apiKey: string, currentUrl: string): string {
    // Case 1: Has API key and using default URL -> upgrade to premium URL
    if (apiKey && currentUrl === BaseConfig.getDefaultURL())
      return BaseConfig.getPremiumURL();
    
    // Case 2: Has API key and using custom URL -> keep custom URL but remove /scan/direct
    if (apiKey && (currentUrl.startsWith(BaseConfig.getPremiumURL()) || currentUrl.startsWith(BaseConfig.getDefaultURL()))){
      return currentUrl.replace(/\/scan\/direct$/, '');
    }
    
    // Case 3: No API key -> use default URL
    return BaseConfig.getDefaultURL();
  }

  get API_URL(): string {
    return this.resolveApiUrl(this.API_KEY, super.API_URL);
  }

  set API_URL(url: string) {
    super.API_URL = url;
  }
}