import { WinnowerResponse } from "../Winnower/WinnowerResponse";

export class DispatchableItem {
  private winnowerResponse: WinnowerResponse;

  private errorCounter: number;

  constructor(winnowerResponse) {
    this.winnowerResponse = winnowerResponse;
    this.errorCounter = 0;
  }

  increaseErrorCounter() {
    this.errorCounter += 1;
  }

  public getWinnowerResponse(): WinnowerResponse {
    return this.winnowerResponse;
  }

  getContent() {
    return this.winnowerResponse.getContent();
  }

  getErrorCounter() {
    return this.errorCounter;
  }

}
