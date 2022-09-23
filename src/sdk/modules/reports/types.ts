export interface IReportEntry{
  resultPath: string;
  dependencyPath?: string;
  vulnerabilityPath?: string;
  outputPath: string;
  templatePath?: string;
  projectName: string;
}

export interface ILicenses{
  label: string;
  value: number;
  components: Array<Component>;
  incompatibleWith: Array<string>;
  hasIncompatibles: Array<string>;
  copyleft:boolean;
}


export interface IReportData {
  projectName: string;
  licenses: Array<ILicenses>;
  summary: Summary;
  date: string,
}

export interface Component {
  purl:string;
  versions: Array<string>;
  url:string;
  name:string;
  vendor:string;
}

export interface ISaveResponse{
  status: SaveStatus;
  path: string;
  format: string;
  message?:string;
}

export enum SaveStatus {
  OK,
  FAILED
}

export interface Summary {
  matchedFiles: number;
  noMatchFiles: number;
  totalFiles: number;
}
