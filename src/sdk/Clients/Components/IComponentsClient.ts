import { Component } from "../../types/common/types";

export interface ComponentLicense {
  name: string;
  spdxId: string;
  isSpdxApproved: boolean;
  url: string;
}

export interface ComponentSearchRequest {
  search?: string;
  vendor?: string;
  component?: string;
  package?: string;
  limit?: number;
  offset?: number;
}

export interface ComponentInfo {
  component: string;
  purl: string;
  url: string;
}

export interface ComponentSearchResponse {
  components: ComponentInfo[];
  status: Status;
}

export interface ComponentVersionRequest {
  purl: string;
  limit?: number;
}

export interface ComponentVersion {
  version: string;
  licenses: ComponentLicense[];
  date: string;
}

export interface ComponentWithVersions {
  component: string;
  purl: string;
  url: string;
  versions: ComponentVersion[];
}

export interface ComponentVersionResponse {
  component: ComponentWithVersions;
  status: Status;
}

export interface Language {
  name: string;
  files: number;
}

export interface ComponentStatistic {
  totalSourceFiles: number;
  totalLines: number;
  totalBlankLines: number;
  languages: Language[];
}

export interface ComponentStatisticPurl {
  purl: string;
  version: string;
  statistics: ComponentStatistic;
}

export interface ComponentStatisticResponse {
  purls: ComponentStatisticPurl[];
  status: Status;
}

export interface Status {
  status: string;
  message: string;
}

export interface IComponentsClient {
  searchComponents(req: ComponentSearchRequest): Promise<ComponentSearchResponse>;
  getComponentVersions(req: ComponentVersionRequest): Promise<ComponentVersionResponse>;
  getComponentStatistics(components: Component[]): Promise<ComponentStatisticResponse>;
}