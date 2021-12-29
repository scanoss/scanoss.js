import { NodeType } from "./Node";
import Node from './Node';

export default class Folder extends Node {
  private children: Node[];

  constructor(path: string, label: string) {
    super(path, label);
    this.type = NodeType.FOLDER;
    this.children = [];
  }

  public addChild(node: Node): void {
    this.children.push(node);
  }

  public getChildren(): Node[] {
    return this.children;
  }

  public getNode(path: string): Node {
    if (!this.checkMyPath(path)) return null;
    if (path === this.getPath()) return this;
    for (const child of this.children) {
      const node = child.getNode(path);
      if (node !== null) return node;
    }
    return null;
  }

  // Returns true only if my path is contained in the path (parameter)
  private checkMyPath(path: string): boolean {
    if (!path.includes(this.getPath())) return false;
    // Only if first filter is passed.
    const myPathExploded = this.getPath().split('/');
    const pathExploded = path.split('/');
    for (let i = 0; i < myPathExploded.length; i += 1) {
      if (myPathExploded[i] !== pathExploded[i]) return false;
    }
    return true;
  }

  public getFiles(): Array<any> {
    const files: Array<any> = [];
    this.children.forEach((child) => {
      files.push(...child.getFiles());
    });
    return files;
  }
}
