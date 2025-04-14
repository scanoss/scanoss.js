import { CryptoCfg } from "./CryptoCfg";
import { CryptographyResultCollector } from "./CryptographyResultCollector";

export abstract class BaseCryptographyScanner<T> {

  protected config: CryptoCfg;

  protected resultCollector: CryptographyResultCollector;
  constructor(cfg: CryptoCfg, cryptoResultCollector: CryptographyResultCollector) {
    this.config = cfg;
    this.resultCollector = cryptoResultCollector;
  }

  public abstract scan(files: Array<string>):Promise<T>;
}
