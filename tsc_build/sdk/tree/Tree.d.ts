import Node from './Node';
import Folder from './Folder';
import { Filter } from './Filters/Filter';
export declare class Tree {
    private rootFolder;
    private rootName;
    private rootPath;
    private filter;
    constructor(path: string);
    build(): Node;
    private buildRec;
    private dirFirstFileAfter;
    loadTree(data: any): void;
    private deserialize;
    getRootFolder(): Folder;
    getRootPath(): string;
    getFileList(f?: Filter): Array<string>;
}
