import { Dependency, DependencyFile, DependencyResponse, License } from "../Clients/Dependency/IDependencyClient";

export interface IDependencyLicense extends License {}

export interface IDependency extends Omit<Dependency, 'licensesList'> {
  scope?: string;
  licensesList: IDependencyLicense[];
}

export interface IDependencyFile extends Omit<DependencyFile, 'dependenciesList'> {
  dependenciesList: IDependency[];
}

export interface IDependencyResponse extends Omit<DependencyResponse, 'filesList'> {
  filesList: IDependencyFile[];
}
