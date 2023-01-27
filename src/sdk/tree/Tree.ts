import fs from 'fs';
import pathLib from 'path';


import { NodeType } from './Node';
import Node from './Node';
import File from './File';
import Folder from './Folder';
import { FilterList } from '../Filtering/Filtering';
import { Filter } from './Filters/Filter';

export class Tree {
  private rootFolder: Folder;

  private rootName: string;

  private rootPath: string;

  private filter: FilterList;

  constructor(path: string) {
    const pathParts = path.split(pathLib.sep);
    this.rootName = pathLib.basename(path);
    this.rootPath = path;
    this.rootFolder = new Folder('/', this.rootName);
  }

  public build(): Node {
    this.rootFolder.removeChildren();
    this.buildRec(this.rootPath, this.rootFolder);
    return this.rootFolder;
  }

  private buildRec(path: string, root: Folder): Node {
    const dirEntries = fs
      .readdirSync(path, { withFileTypes: true }) // Returns a list of files and folders
      .sort(this.dirFirstFileAfter)
      .filter((dirent: any) => !dirent.isSymbolicLink());

    for (const dirEntry of dirEntries) {
      const fullPath = `${path}/${dirEntry.name}`;
      const relativePath = fullPath.replace(this.rootPath, '');
      if (dirEntry.isDirectory()) {
        const f: Folder = new Folder(fullPath, dirEntry.name);
        const subTree = this.buildRec(`${path}/${dirEntry.name}`, f);
        root.addChild(subTree);
      } else root.addChild(new File(fullPath, dirEntry.name));
    }
    return root;
  }

  // This is a sorter that will sort folders before files in alphabetical order.
  private dirFirstFileAfter(a: any, b: any) {
    if (!a.isDirectory() && b.isDirectory()) return 1;
    if (a.isDirectory() && !b.isDirectory()) return -1;
    return 0;
  }

  public loadTree(data: any): void {
    this.rootFolder = this.deserialize(data) as Folder;
  }

  private deserialize(data: any): Node {
    if (data.type === NodeType.FILE) {
      return Object.assign(Object.create(File.prototype), data);
    }
    const children = data.children.map((child: any) => this.deserialize(child));
    return Object.assign(Object.create(Folder.prototype), { ...data, children });
  }

  public getRootFolder(): Folder {
    return this.rootFolder;
  }

  public getRootPath(): string {
    return this.rootPath;
  }

  public getFileList(f?: Filter): Array<string> {
    return  this.rootFolder.getFiles(f);
  }
}
