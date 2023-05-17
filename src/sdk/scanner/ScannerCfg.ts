import { BaseConfig } from '../BaseConfig';


export class ScannerCfg extends BaseConfig {
  // Client Timestamp, default value is scanoss-js/${version}
  public CLIENT_TIMESTAMP = ""
  // API URL
  public API_URL = 'https://osskb.org/api/scan/direct';

  public API_KEY = '';

  public CA_CERT = '';

  //Set to true to ignore self certificates issues
  public IGNORE_CERT_ERRORS = false;

  // Level of concurrency
  public CONCURRENCY_LIMIT = 15;

  // Timeout for each transaction
  public TIMEOUT = 60000;

  // The maximum size for each .wfp file
  public WFP_FILE_MAX_SIZE = 64 * 1000;

  public WFP_OBFUSCATION = false;

  //After processing #WINNOWING_AFTER_X_REPORT_STATUS files,
  // the winnowing algorithm will report a ScannerEvents.WINNOWING_STATUS event.
  public WINNOWING_REPORT_STATUS_AFTER_X = 10;

  public MAX_RETRIES_FOR_RECOVERABLES_ERRORS = 5;

  public ABORT_ON_MAX_RETRIES = true;

  // Persist results after [ X ] server responses
  public MAX_RESPONSES_IN_BUFFER = 300;

  public DISPATCHER_QUEUE_SIZE_MAX_LIMIT = 300;

  public DISPATCHER_QUEUE_SIZE_MIN_LIMIT = 200;

};
