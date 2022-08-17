export interface IReportEntry{
  resultPath: string,
  dependencyPath?: string,
  vulnerabilityPath?: string,
  outputPath: string,
  templatePath?: string
}

export interface ILicenses{
  label: string,
  value: number;
  components: Array<Component>;
  incompatibleWith: Array<string>;
  hasIncompatibles: Array<string>;
}


export interface IReportData {
  licenses: Array<ILicenses>;
  summary: Summary;
}

export interface Component {
  purl:string,
  versions: Array<string>,
  url:string,
  name:string,
  vendor:string,
}

export interface ISaveResponse{
  status: SaveStatus,
  path: string,
  format: string,
  message?:string;
}

export enum SaveStatus {
  OK,
  FAILED
}

export interface Summary {
  matchedFiles: number;
  noMatchFiles: number;
  totalFiles:number;
}
