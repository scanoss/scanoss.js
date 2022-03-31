import { FingerprintPacket } from "../WfpProvider/FingerprintPacket";
export class DispatchableItem {
  private fingerprintPacket: FingerprintPacket;

  private errorCounter: number;

  constructor(fingerprintPacket: FingerprintPacket) {
    this.fingerprintPacket = fingerprintPacket;
    this.errorCounter = 0;
  }

  increaseErrorCounter() {
    this.errorCounter += 1;
  }

  public getWinnowerResponse(): FingerprintPacket {
    return this.fingerprintPacket;
  }

  getContent() {
    return this.fingerprintPacket.getContent();
  }

  getErrorCounter() {
    return this.errorCounter;
  }

}
