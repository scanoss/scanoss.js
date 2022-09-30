
import AbortController from 'abort-controller';

export class GlobalControllerAborter {
  private abortControllerList: Array<AbortController>;

  private abortFlag: Boolean;

  constructor() {
    this.abortControllerList = [];
    this.abortFlag = false;
  }

  abortAll() {
    this.abortFlag = true;
    for (const c of this.abortControllerList) c.abort();
  }

  isAborting() {
    return this.abortFlag;
  }

  getAbortController() {
    const c = new AbortController();
    this.abortControllerList.push(c);
    return c;
  }

  removeAbortController(c) {
    const index = this.abortControllerList.findIndex((controller) => controller === c);
    if (index > -1) this.abortControllerList.splice(index, 1);
  }
}
