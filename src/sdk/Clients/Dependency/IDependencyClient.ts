import { Component } from "../../shared/interfaces/Component";

interface License {
  name: string;
  spdxId: string;
  isSpdxApproved: boolean;
  url: string;
}

export interface Dependency {
  component: string;
  purl: string;
  version: string;
  licensesList: License[];
  url: string;
  comment: string;
}

export interface DependencyFile {
  file: string;
  id: string;
  status: string;
  dependenciesList: Dependency[];
}

export interface Status {
  status: string;
  message: string;
}

export interface DependencyResponse {
  filesList: DependencyFile[];
  status: Status;
}


export interface DependencyRequest {
  files: [
    {
      file: string;
      purls: Array<Component>;
    }
  ]
}

export interface IDependencyClient {
  getDependencies(req: DependencyRequest): Promise<DependencyResponse>;
}
