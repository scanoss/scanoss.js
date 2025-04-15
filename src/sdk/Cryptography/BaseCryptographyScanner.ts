import { CryptoCfg } from "./CryptoCfg";

export abstract class BaseCryptographyScanner<T,I,R> {

  protected config: CryptoCfg;

  protected resultCollector: T;

  constructor(cfg: CryptoCfg, cryptoResultCollector: T) {
    this.config = cfg;
    this.resultCollector = cryptoResultCollector;
  }

  public abstract scan(files: I):Promise<R>;
}
