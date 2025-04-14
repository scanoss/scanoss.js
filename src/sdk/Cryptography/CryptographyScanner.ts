import { CryptoCfg } from "./CryptoCfg";
import {
  CryptographyAlgorithmScanner
} from "./Algorithm/CryptographyAlgorithmScanner";
import { CryptographyHintScanner } from "./Hint/CryptographyHintsScanner";
import {
  LocalCryptographyResponse
} from "./CryptographyTypes";
import { CryptographyResultCollector } from "./CryptographyResultCollector";


export class CryptographyScanner {

  private readonly config: CryptoCfg;

  constructor(cfg: CryptoCfg) {
    this.config = cfg;
  }

  public async scan(files: Array<string>): Promise<LocalCryptographyResponse> {
    const cryptoResultCollector = new CryptographyResultCollector();
    const cryptoAlgorithmScanner = new CryptographyAlgorithmScanner(this.config,cryptoResultCollector);
    const cryptoHintScanner = new CryptographyHintScanner(this.config, cryptoResultCollector);
    await cryptoAlgorithmScanner.scan(files);
    await cryptoHintScanner.scan(files);
    return cryptoResultCollector.getResults();
  }
}
