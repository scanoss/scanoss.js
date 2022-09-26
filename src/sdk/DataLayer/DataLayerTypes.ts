import { Component } from '../modules/reports/types';

/*************  Component interface definition  *************/
export interface ComponentDataLayer {
  key: string; // purl[0]
  purls: string[];
  name: string;
  vendor: string;
  url: string;
  versions: Version[];
}

export interface Version {
  version: string;
  licenses:  string[]
  copyrights: Copyright[]
}

export interface Copyright {
  name: string;
  source: string;
}
/*************  Component interface definition  *************/

/*************  Dependency interface definition  *************/
export interface DependencyDataLayer {
  file: string;
  dependencies: Dependency[];
}

export interface License {
  name: string;
  spdxid: string;
}

export interface Dependency {
  purl: string;
  component: string;
  version: string;
  licenses: License[]
}
/*************  Dependency interface definition  *************/

/*************  Vulnerability interface definition  *************/
export interface Vulnerability {
  id: string;
  cve: string;
  url: string;
  summary: string;
  severity: string;
  published: string;
  modified: string;
  source: string;
}

export interface VulnerabilityDataLayer {
  purl: string;
  vulnerability: Vulnerability[];
}
/*************  Vulnerability interface definition  *************/


/*************  License interface definition  *************/
export interface LicenseDataLayer {
  label: string;
  value: number;  //Number of licenses found
  components: Array<LicenseComponent>;
  incompatibleWith: Array<string>;
  hasIncompatibles: Array<string>;
  copyleft:boolean;
}


export interface LicenseComponent {
  purl: string;
  name: string;
  versions: Array<string>;
  url:string;
  vendor:string;
}
/*************  License interface definition  *************/

export interface SummaryDataLayer {
  projectName: string;
  timestamp: Date;
  matchedFiles: number;
  noMatchFiles: number;
  totalFiles: number;
}


export interface IDataLayers {
  licenses: LicenseDataLayer[];
  component: ComponentDataLayer[];
  dependencies: DependencyDataLayer[];
  vulnerabilities: VulnerabilityDataLayer[];
  summary: SummaryDataLayer;
}


export interface DataProvider {
  getData(): IDataLayers;
  getLayerName(): string;
}

