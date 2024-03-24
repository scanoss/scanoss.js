import { Filter } from './Filters/Filter';
export default abstract class Node {
    protected type: NodeType;
    protected path: string;
    protected label: string;
    protected action: string;
    constructor(path: string, label: string);
    abstract getNode(path: string): Node;
    abstract getFiles(f?: Filter): Array<string>;
    getName(): string;
    getPath(): string;
    getType(): NodeType;
}
export declare enum NodeType {
    FOLDER = "FOLDER",
    FILE = "FILE"
}
