import { BaseConfig } from '../BaseConfig';

export class ScannerCfg extends BaseConfig {
  // Client Timestamp, default value is scanoss-js/${version}
  public CLIENT_TIMESTAMP = '';

  public API_KEY = '';

  // Level of concurrency
  public CONCURRENCY_LIMIT = 5;

  // Timeout for each transaction
  public TIMEOUT = 180000;

  // The maximum size for each .wfp file in bytes
  public WFP_FILE_MAX_SIZE = 32 * 1024;

  public WFP_OBFUSCATION = false;

  public RESULTS_DEOBFUSCATION = true;
  //After processing #WINNOWING_AFTER_X_REPORT_STATUS files,
  // the winnowing algorithm will report a ScannerEvents.WINNOWING_STATUS event.
  public WINNOWING_REPORT_STATUS_AFTER_X = 10;

  public MAX_RETRIES_FOR_RECOVERABLES_ERRORS = 6;

  public ABORT_ON_MAX_RETRIES = true;

  // Persist results after [ X ] server responses
  public MAX_RESPONSES_IN_BUFFER = 300;

  public DISPATCHER_QUEUE_SIZE_MAX_LIMIT = 2000;

  public DISPATCHER_QUEUE_SIZE_MIN_LIMIT = 1000;

  constructor() {
    super();
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
      return  BaseConfig.getPremiumURL() + '/scan/direct';
    // Case 2: Has API key and using custom URL -> append /scan/direct to custom URL
    if (apiKey && currentUrl !== BaseConfig.getDefaultURL())
      return currentUrl;
    // Case 3: No API key but using custom URL -> append /scan/direct to custom URL
    if (!apiKey && currentUrl !== BaseConfig.getDefaultURL())
      return currentUrl;
    // Case 4: No API key and default/empty URL -> use default URL with /scan/direct
    return BaseConfig.getDefaultURL() + '/scan/direct';
  }

  get API_URL(): string {
    return this.resolveApiUrl(this.API_KEY, super.API_URL);
  }

  set API_URL(url: string) {
    super.API_URL = url;
  }
}
