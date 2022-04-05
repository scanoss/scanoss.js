export enum ScannerEvents {
  WINNOWING_STARTING = 'WINNOWING_STARTING',
  WINNOWING_NEW_CONTENT = 'WINNOWING_NEW_CONTENT',
  WINNOWING_FINISHED = 'WINNOWING_FINISHED',
  WINNOWER_LOG = 'WINNOWER_LOG',

  DISPATCHER_WFP_SENDED = 'DISPATCHER_WFP_SENDED',
  DISPATCHER_NEW_DATA = 'DISPATCHER_NEW_DATA',
  DISPATCHER_FINISHED = 'DISPATCHER_FINISHED',
  DISPATCHER_ITEM_NO_DISPATCHED = 'DISPATCHER_ITEM_NO_DISPATCHED',
  DISPATCHER_QUEUE_SIZE_MAX_LIMIT = 'DISPATCHER_QUEUE_FULL',
  DISPATCHER_QUEUE_SIZE_MIN_LIMIT = 'DISPATCHER_QUEUE_SIZE_MIN_LIMIT',
  DISPATCHER_LOG = 'DISPATCHER_LOG',

  ERROR_SCANNER_ABORTED = 'ERROR_SCANNER_ABORTED',

  ERROR_SERVER_SIDE = 'ERROR_SERVER_SIDE',
  ERROR_CLIENT_SIDE = 'ERROR_CLIENT_SIDE',

  MODULE_DISPATCHER = 'MODULE_DISPATCHER',
  MODULE_WINNOWER = 'MODULE_WINNOWER',

  SCAN_DONE = 'SCAN_DONE',
  RESULTS_APPENDED = 'RESULTS_APPENDED',

  SCANNER_LOG = 'SCANNER_LOG',

  ERROR = 'error',
};

export enum WinnowingMode {
  FULL_WINNOWING = 'FULL_WINNOWING',
  WINNOWING_ONLY_MD5 = 'WINNOWING_ONLY_MD5',
};

export interface ScannerInput {
  engineFlags?: number;
  folderRoot?: string;
  fileList: Array<string>;
  winnowingMode?: WinnowingMode;  // Enable winnowing algorithm, otherwise is scanned only MD5
  wfpPath?: string;
};
