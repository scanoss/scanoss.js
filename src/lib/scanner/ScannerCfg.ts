export class ScannerCfg {
  // Client Timestamp
  CLIENT_TIMESTAMP = "SCANNER JS"

  // API URL
  API_URL = 'https://osskb.org/api/scan/direct';

  API_KEY = '';

  // Level of concurrency
  CONCURRENCY_LIMIT = 15;

  // Timeout for each transaction
  TIMEOUT = 60000;

  // The maximum size for each .wfp file
  WFP_FILE_MAX_SIZE = 64 * 1000;

  MAX_RETRIES_FOR_RECOVERABLES_ERRORS = 5;

  ABORT_ON_MAX_RETRIES = true;

  // Persist results after [ X ] server responses
  MAX_RESPONSES_IN_BUFFER = 300;

  DISPATCHER_QUEUE_SIZE_MAX_LIMIT = 300;

  DISPATCHER_QUEUE_SIZE_MIN_LIMIT = 200;

};
