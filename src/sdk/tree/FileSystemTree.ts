// DO NOT CHANGE THE CLASS NAME FOR FILE AND DIRECTORY
// There are files stored and may produce an error while [de]serializing

import Directory from "./Directory";
import File from "./File";

export type FileSystemNodeJSON = {
  class_name: "File" | "Directory";
  path: string;
  children: FileSystemNodeJSON[];
};

export interface IVisitor {
  visitFile(file: File): void;
  visitDirectory(directory: Directory): void;
}

export abstract class FileSystemNode {
  protected path: string;

  protected name: string;

  protected size: number;

  protected constructor(path: string, name: string, size: number) {
    this.path = path;
    this.name = name;
    this.size = size;
  }

  // static fromJSON(json: FileSystemNodeJSON): FileSystemNode {
  //   switch (json.class_name) {
  //     case "Directory":
  //       const d = new Directory(json.path, json.path, 80);
  //       json.children.map((c) => d.addChild(FileSystemNode.fromJSON(c)));
  //       return d;
  //     case "File":
  //       return new File(json.path, json.path);
  //     default:
  //       throw new Error("Unknown type");
  //   }
  // }

  toJSON() {
    return {
      class_name: this.constructor.name,
      ...this,
    };
  }

  public abstract visit(visitor: IVisitor): void;

  public abstract isDirectory(): boolean;

  public getName(): string {
    return this.name;
  }

  public getPath(): string {
    return this.path;
  }

  public getSize(): number {
    return this.size;
  }


}
