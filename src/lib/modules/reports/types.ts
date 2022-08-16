export interface IReportEntry{
  resultPath: string,
  dependencyPath?: string,
  vulnerabilityPath?: string,
  outputPath: string,
  templatePath: string,
}

export interface ILicenses{
  label: string,
  value: number;
  components: Array<Component>;
}

export interface ISummary {
  summary: {
    matchFiles: number;
    noMatchFiles: number;
    filterFiles: number;
    totalFiles: number;
  };
  identified: {
    scan: number;
    total: number;
  };
  pending: number;
  original: number;
}

export interface IReportData {
  licenses: Array<ILicenses>;
  summary: ISummary;
}

export interface Component {
  purl:string,
  version: string,
  url:string,
  name:string,
  vendor:string,
}

export interface ISaveResponse{
  status: SaveStatus,
  path: string,
  format: string,
}

export enum SaveStatus {
  OK,
  FAILED
}
