import { ILocalDependencies } from './DependencyTypes';
export declare class LocalDependencies {
    private parserMap;
    private listFilePattern;
    constructor();
    filterFiles(files: Array<string>): Array<string>;
    search(files: Array<string>): Promise<ILocalDependencies>;
    stringMatchWithWildcard(text: string, pattern: string): boolean;
    private getParserFunc;
}
