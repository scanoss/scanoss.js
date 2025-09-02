import { BaseConfig } from "../BaseConfig";

/**
 * Represents a configuration for cryptography scanner.
 */
export class CryptoCfg extends BaseConfig {

   private readonly DEFAULT_THREADS = 5;

   ALGORITHM_RULES_PATH: string;

   LIBRARY_RULES_PATH: string;

   THREADS: number = this.DEFAULT_THREADS;

   API_KEY: string = '';

   constructor(cfg?: CryptoCfg) {
     super(cfg);
     if(cfg) {
       this.API_KEY = cfg.API_KEY ? cfg.API_KEY : '';
     }
   }

  /**
   * Resolves the appropriate API URL based on API key presence and current URL.
   * If an API key is provided and the current URL is the default, returns the premium
   * URL, otherwise returns the current URL.
   * @param apiKey - The API key (if any)
   * @param currentUrl - The current API URL
   * @returns The resolved API URL
   */
   protected resolveApiUrl(apiKey: string, currentUrl: string): string {
    // Case 1: Has API key and using default URL -> upgrade to premium URL. The default URL is set on the BaseConfig.ts file
    if (apiKey && currentUrl === BaseConfig.getDefaultURL())
      return BaseConfig.getPremiumURL();
    // Case 2: Has API key and using custom URL -> keep custom URL
    if (apiKey && currentUrl.startsWith(BaseConfig.getPremiumURL()) || currentUrl.startsWith(BaseConfig.getDefaultURL())){
      // Check if custom URL is not the same as the default one.
      if (currentUrl.startsWith(BaseConfig.getPremiumURL()) || currentUrl.startsWith(BaseConfig.getDefaultURL())) {
        return currentUrl.replace(/\/scan\/direct$/, '');
      }
      return currentUrl;
    }
    // Case 4: No API key and default/empty URL -> use default URL
    return BaseConfig.getDefaultURL();
   }

   public get API_URL(): string{
     return this.resolveApiUrl(this.API_KEY, super.API_URL);
   }

   public set API_URL(value: string) {
     super.API_URL = value;
   }

}
