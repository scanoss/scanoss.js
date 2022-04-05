import fs from "fs";

export class WinnowerExtractor {

  private winnowing: string;

  private winnowingFilePath: string;

  private blocksIndex: Array<number>;

  private currentBlock: number;

  constructor() {
    this.init();
  }

  private init() {
    this.winnowing = '';
    this.currentBlock = 0;
  }

  public loadFile(path: string) {
    this.init();
    this.winnowingFilePath = path;
    this.winnowing = fs.readFileSync(path, 'utf-8');
    const reg = /file=/g;
    this.blocksIndex = [...((this.winnowing).matchAll(reg))].map(x => x.index);
  };

  public extractWinBlock(): string {
    let res = '';
    if (this.currentBlock < this.blocksIndex.length-1)
      res = this.winnowing.substring(this.blocksIndex[this.currentBlock], this.blocksIndex[this.currentBlock+1]);
    this.currentBlock+=1;
    return res;
  }
}
