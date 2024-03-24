import { ILocalDependency } from "../DependencyTypes";
export declare function goModParser(fileContent: string, filePath: string): Promise<ILocalDependency>;
export declare function goSumParser(fileContent: string, filePath: string): Promise<ILocalDependency>;
