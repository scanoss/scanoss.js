import { BaseConfig, IBaseConfig } from "../BaseConfig";

export interface IScannerCfg extends IBaseConfig {
  CLIENT_TIMESTAMP?: string;
  API_KEY?: string;
  IGNORE_CERT_ERRORS?: boolean;
  CONCURRENCY_LIMIT?: number;
  // Timeout for each transaction
  TIMEOUT?: number;
  // The maximum size for each .wfp file in bytes
  WFP_FILE_MAX_SIZE?: number ;
  WFP_OBFUSCATION?: boolean;
  RESULTS_DEOBFUSCATION?: boolean;
  //After processing #WINNOWING_AFTER_X_REPORT_STATUS files,
  // the winnowing algorithm will report a ScannerEvents.WINNOWING_STATUS event.
  WINNOWING_REPORT_STATUS_AFTER_X?: number;
  MAX_RETRIES_FOR_RECOVERABLES_ERRORS?: number;
  ABORT_ON_MAX_RETRIES?: boolean;

  // Persist results after [ X ] server responses
  MAX_RESPONSES_IN_BUFFER?: number;
  DISPATCHER_QUEUE_SIZE_MAX_LIMIT?: number;
  DISPATCHER_QUEUE_SIZE_MIN_LIMIT?: number;
}

export class ScannerCfg extends BaseConfig {
  public CLIENT_TIMESTAMP = '';
  public API_KEY = '';
  public IGNORE_CERT_ERRORS = false;
  public CONCURRENCY_LIMIT=  5;
  public TIMEOUT = 180000;
  public WFP_FILE_MAX_SIZE = 32 * 1024;
  public WFP_OBFUSCATION = false;
  public RESULTS_DEOBFUSCATION = true;
  public WINNOWING_REPORT_STATUS_AFTER_X = 10;
  public MAX_RETRIES_FOR_RECOVERABLES_ERRORS = 6;
  public ABORT_ON_MAX_RETRIES = true;
  // Persist results after [ X ] server responses
  public MAX_RESPONSES_IN_BUFFER= 300;
  public DISPATCHER_QUEUE_SIZE_MAX_LIMIT = 2000;
  public DISPATCHER_QUEUE_SIZE_MIN_LIMIT = 1000;

  constructor(cfg?: IScannerCfg) {
    super(cfg);
    this._API_URL = BaseConfig.getDefaultURL()
    if (Object.keys(cfg).length > 0) {
      Object.assign(this,cfg);
    }
  }

}
