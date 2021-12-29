export default abstract class Node {
  protected type: NodeType;

  protected rPath: string; // Relative path to the folder or file

  protected label: string;

  protected action: string;

  constructor(path: string, label: string) {
    this.rPath = path;
    this.label = label;
  }


  public abstract getNode(path: string): Node;

  public abstract getFiles(): Array<any> ;


  public getName(): string {
    return this.label;
  }

  public getPath(): string {
    return this.rPath;
  }

}

export enum NodeType {
  FOLDER = 'FOLDER',
  FILE = 'FILE',
};
