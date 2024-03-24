import Node from './Node';
import { Filter } from './Filters/Filter';
export default class File extends Node {
    constructor(name: string, path: string);
    getNode(path: string): Node;
    getFiles(f?: Filter): Array<string>;
}
