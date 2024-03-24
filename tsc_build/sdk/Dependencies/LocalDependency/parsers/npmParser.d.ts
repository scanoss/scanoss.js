import { ILocalDependency } from "../DependencyTypes";
export declare function packageParser(fileContent: string, filePath: string): Promise<ILocalDependency>;
export declare function packagelockParser(fileContent: string, filePath: string): Promise<ILocalDependency>;
export declare function yarnLockParser(fileContent: string, filePath: string): Promise<ILocalDependency>;
declare enum YarnLockVersionEnum {
    "V1" = 0,
    "V2" = 1,
    UnknownYarnLockFormat = 2
}
export declare function yarnLockRecognizeVersion(fileContent: string): YarnLockVersionEnum;
export declare function yarnLockV1Parser(fileContent: string, filePath: string): Promise<ILocalDependency>;
export declare function yarnLockV2Parser(fileContent: string, filePath: string): Promise<ILocalDependency>;
export {};
