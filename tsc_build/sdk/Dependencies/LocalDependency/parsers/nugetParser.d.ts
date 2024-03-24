import { ILocalDependency } from '../DependencyTypes';
export declare function csprojParser(fileContent: string, filePath: string): Promise<ILocalDependency>;
export declare function packagesConfigParser(fileContent: string, filePath: string): Promise<ILocalDependency>;
