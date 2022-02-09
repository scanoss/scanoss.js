
interface ILicense {
  name: string;
}

export interface IDependency {
  component: string;
  purl: string;
  version: string;
  licenses: Array<ILicense>;
}

export interface IFile {
  file: string;
  id: string;
  status: string;
  dependencies: Array<IDependency>;
}

export interface IDependencyResponse {
  files: Array<IFile>;
}
