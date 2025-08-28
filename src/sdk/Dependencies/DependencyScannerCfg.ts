import { BaseConfig } from "../BaseConfig";
const DEFAULT_CHUNK_REQUEST_SIZE = 15;

export class DependencyScannerCfg extends BaseConfig {

  _IGNORE_CERT_ERRORS = false;

  _API_KEY: string = '';

  _CHUNK_REQUEST_SIZE = DEFAULT_CHUNK_REQUEST_SIZE;
  constructor(config?: DependencyScannerCfg) {
    super(config);
    if(config){
      this.CHUNK_REQUEST_SIZE = config.CHUNK_REQUEST_SIZE ? config.CHUNK_REQUEST_SIZE : DEFAULT_CHUNK_REQUEST_SIZE;
      this.API_KEY =  config.API_KEY ? config.API_KEY : '';
      this.IGNORE_CERT_ERRORS = config.IGNORE_CERT_ERRORS ? config.IGNORE_CERT_ERRORS : false;
    }
  }

  get CHUNK_REQUEST_SIZE(): number {
    return this._CHUNK_REQUEST_SIZE;
  }

  set CHUNK_REQUEST_SIZE(value: number) {
    this._CHUNK_REQUEST_SIZE = value;
  }

  get API_KEY(): string{
    return this._API_KEY;
  }

  set API_KEY(value: string){
    this._API_KEY = value;
  }

  get IGNORE_CERT_ERRORS(): boolean {
    return this._IGNORE_CERT_ERRORS;
  }

  set IGNORE_CERT_ERRORS(value: boolean) {
    this._IGNORE_CERT_ERRORS = value;
  }

  /**
   * Resolves the appropriate scanner URL based on API key presence and current URL.
   * If an API key is provided and the current URL is the default, returns the premium
   * scanner URL, otherwise appends '/scan/direct' to the current URL.
   * @param apiKey - The API key (if any)
   * @param currentUrl - The current API URL
   * @returns The resolved scanner URL
   */
  protected resolveApiUrl(apiKey: string, currentUrl: string): string {
    // Case 1: Has API key and using default URL -> upgrade to premium scanner URL
    if (apiKey && currentUrl === BaseConfig.getDefaultURL())
      return  BaseConfig.getPremiumURL();
    // Case 2: Has API key and using custom URL
    if (apiKey && currentUrl !== BaseConfig.getDefaultURL()) {
      // Only remove /scan/direct for official SCANOSS API endpoints
      if (currentUrl.startsWith(BaseConfig.getPremiumURL()) || currentUrl.startsWith(BaseConfig.getDefaultURL())) {
        return currentUrl.replace(/\/scan\/direct$/, '');
      }
      // For other custom URLs, return as-is
      return currentUrl;
    }
    // Case 3: No API key but using custom URL -> append /scan/direct to custom URL
    if (!apiKey && currentUrl !== BaseConfig.getDefaultURL())
      return currentUrl;
    // Case 4: No API key and default/empty URL -> use default URL with /scan/direct
    return BaseConfig.getDefaultURL();
  }

  get API_URL(): string {
    return this.resolveApiUrl(this.API_KEY, super.API_URL);
  }

  set API_URL(url: string) {
    super.API_URL = url;
  }

}
