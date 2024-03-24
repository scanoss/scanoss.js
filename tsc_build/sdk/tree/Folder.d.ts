import Node from './Node';
import { Filter } from './Filters/Filter';
export default class Folder extends Node {
    private children;
    constructor(path: string, label: string);
    addChild(node: Node): void;
    getChildren(): Node[];
    getNode(path: string): Node;
    private checkMyPath;
    getFiles(f?: Filter): Array<string>;
    removeChildren(): void;
}
