import { BaseConfig } from '../BaseConfig';

export class ScannerCfg extends BaseConfig {
  // Client Timestamp, default value is scanoss-js/${version}
  public CLIENT_TIMESTAMP = '';

  // API URL
  public API_URL = null;

  public API_KEY = '';

  //Set to true to ignore self certificates issues
  public IGNORE_CERT_ERRORS = false;

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
    this.API_URL = ScannerCfg.getDefaultURL();
  }
}
