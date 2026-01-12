import { Dependency, DependencyFile, DependencyResponse } from "../Clients/Dependency/IDependencyClient";

export interface IDependency extends Dependency {
  scope?: string;
}

export interface IDependencyFile extends Omit<DependencyFile, 'dependenciesList'> {
  dependenciesList: IDependency[];
}

export interface IDependencyResponse extends Omit<DependencyResponse, 'filesList'> {
  filesList: IDependencyFile[];
}
