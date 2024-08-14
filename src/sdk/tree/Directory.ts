import FileSystemNode from './Node';

export default class Folder extends FileSystemNode {
  private children: FileSystemNode[];

  constructor(path: string, label: string) {
    super(path, label);
    this.children = [];
  }

  public addChild(node: FileSystemNode): void {
    this.children.push(node);
  }

}
