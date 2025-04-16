import path from 'path';
import { Settings } from "./ScannnerResultPostProcessor/interfaces/types";


export enum ScannerEvents {
  WINNOWING_STARTING = 'WINNOWING_STARTING',
  WINNOWING_NEW_CONTENT = 'WINNOWING_NEW_CONTENT',
  WINNOWING_STATUS = 'WINNOWING_STATUS',
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

export interface BaseScannerInput {
  wfpPath?: string;
  sbom?: string;
  sbomMode?: SbomMode;
  settings?: Settings;
  engineFlags?: number;
  winnowing?: {
    mode: WinnowingMode,
  }
}

export interface ScannerInput extends BaseScannerInput {
  fileList: Array<string>;
  folderRoot?: string;
};

export interface ContentScannerInput extends BaseScannerInput{
  content: string,
  key: string,
}

/********************** Scanner results types **********************/

export type ScannerResults = Record<string , ScannerComponent[]>;

export enum ScannerComponentId {NONE = 'none', FILE = 'file' , SNIPPET = 'snippet'};

export interface ScannerComponent {
  id: ScannerComponentId;
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
    source: string;
    incompatible_with?: string;
  }[];
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
  health: {
    creation_date: string;
    issues: number;
    last_push: string;
    last_update: string;
    watchers: number;
    country: string;
    stars: number;
    forks: number;
  };
  server: {
    version: string;
    kb_version: { monthly: string; daily: string; }
    hostname: string;
    flags: string;
    elapsed: string;
  };
}
/********************** Scanner results types **********************/
