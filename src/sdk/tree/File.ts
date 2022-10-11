import { NodeType } from './Node';
import Node from './Node';
import { Filter } from './Filters/Filter';


export default class File extends Node {
  constructor(name: string, path: string) {
    super(name, path);
    this.type = NodeType.FILE;
  }

  public getNode(path: string): Node {
    if (path === this.getPath()) return this;
    return null;
  }

  public getFiles(f: Filter): Array<string> {
    if (!f || !f.evaluate(this)) return [];
    return [this.getPath()];
  }

}
