import { ILocalDependency } from '../DependencyTypes';
export declare function gemfileParser(fileContent: string, filePath: string): Promise<ILocalDependency>;
export declare function gemfilelockParser(fileContent: string, filePath: string): Promise<ILocalDependency>;
