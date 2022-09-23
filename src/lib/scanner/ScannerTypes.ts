import path from 'path';

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
  FULL_WINNOWING_HPSM = 'FULL_WINNOWING_HPSM',
  WINNOWING_ONLY_MD5 = 'WINNOWING_ONLY_MD5',
};

export enum SbomMode {
  SBOM_IGNORE = 'blacklist',
  SBOM_IDENTIFY = 'identify'
}

export interface ScannerInput {
  fileList: Array<string>;
  folderRoot?: string;
  engineFlags?: number;
  winnowingMode?: WinnowingMode;  // Enable winnowing algorithm, otherwise is scanned only MD5
  wfpPath?: string;
  sbom?: string;
  sbomMode?: SbomMode;
};


export type ScannerResults = Map<string , ScannerRawComponent[]>;

export interface ScannerRawComponent {
  id: string;
  status: string;
  lines: string;
  oss_lines: string;
  matched: string;
  purl: string[];
  vendor: string
  component: string;
  version: string;
  latest: string;
  url: string;
  release_date: string;
  file: string;
  url_hash: string;
  file_hash: string;
  source_hash: string;
  file_url: string;
  licenses: {
    name: string;
    patent_hints: string;
    copyleft: string;
    checklist_url: string;
    osadl_updated: string;
    source: string; }[];
  dependencies: {
    vendor: string;
    component: string;
    version: string;
    source: string; }[];
  copyrights: {
    name: string;
    source: string; }[];
  vulnerabilities: {
    ID: string;
    CVE: string;
    severity: string;
    reported: string;
    introduced: string;
    patched: string;
    summary: string;
    source: string; }[];
  quality: {
    score: string;
    source: string; }[];
  cryptography: any[];
  server: {
    version: string;
    kb_version: { monthly: string; daily: string; }
    hostname: string;
    flags: string;
    elapsed: string;
  };
}
