export class ScannerCfg {
  // Client Timestamp, default value is scanoss-js/${version}
  CLIENT_TIMESTAMP = ""

  // API URL
  API_URL = 'https://osskb.org/api/scan/direct';

  API_KEY = '';

  CA_CERT = '';

  PROXY = '';

  //Set to true to ignore self certificates issues
  IGNORE_CERT_ERRORS = false;

  // Level of concurrency
  CONCURRENCY_LIMIT = 15;

  // Timeout for each transaction
  TIMEOUT = 60000;

  // The maximum size for each .wfp file
  WFP_FILE_MAX_SIZE = 64 * 1000;

  //After processing #WINNOWING_AFTER_X_REPORT_STATUS files,
  // the winnowing algorithm will report a ScannerEvents.WINNOWING_STATUS event.
  WINNOWING_REPORT_STATUS_AFTER_X = 10;

  MAX_RETRIES_FOR_RECOVERABLES_ERRORS = 5;

  ABORT_ON_MAX_RETRIES = true;

  // Persist results after [ X ] server responses
  MAX_RESPONSES_IN_BUFFER = 300;

  DISPATCHER_QUEUE_SIZE_MAX_LIMIT = 300;

  DISPATCHER_QUEUE_SIZE_MIN_LIMIT = 200;



};
