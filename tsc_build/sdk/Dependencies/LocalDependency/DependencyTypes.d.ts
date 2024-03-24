export interface ILocalPurl {
    purl: string;
    requirement?: string;
    scope?: string;
}
export interface ILocalDependency {
    file: string;
    purls: Array<ILocalPurl>;
}
export interface ILocalDependencies {
    files: Array<ILocalDependency>;
}
export declare type ParserFuncType = (fileContent: string, filePath: string) => Promise<ILocalDependency>;
export interface ParserDefinitions {
    [key: string]: ParserFuncType;
}
