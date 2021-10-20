import AbortController from 'abort-controller';

export class GlobalControllerAborter {
  private abortControllerList: Array<AbortController>;

  private abortFlag: boolean;

  constructor() {
    this.abortControllerList = [];
    this.abortFlag = false;
  }

  public abortAll(): void {
    this.abortFlag = true;
    // eslint-disable-next-line no-restricted-syntax
    for (const c of this.abortControllerList) c.abort();
  }

  public isAborting(): boolean {
    return this.abortFlag;
  }

  public getAbortController(): AbortController {
    const c = new AbortController();
    this.abortControllerList.push(c);
    return c;
  }

  public removeAbortController(c: AbortController) {
    const index = this.abortControllerList.findIndex((controller) => controller === c);
    if (index > -1) this.abortControllerList.splice(index, 1);
  }
}
