import { WinnowerResponse } from "../Winnower/WinnowerResponse";

export class DispatchableItem {
  private item: any;

  private errorCounter: number;

  private winnowerResponse;

  constructor(item: any) {
    this.winnowerResponse = item as WinnowerResponse;
    this.errorCounter = 0;
  }

  public increaseErrorCounter() {
    this.errorCounter += 1;
  }

  getItem() {
    return this.item;
  }

  getWinnowerResponse() {
    return this.winnowerResponse;
  }

  getContent() {
    return this.winnowerResponse.getContent();
  }

  getErrorCounter() {
    return this.errorCounter;
  }

}
