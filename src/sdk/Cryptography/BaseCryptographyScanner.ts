import { CryptoCfg } from "./CryptoCfg";

/**
 * Abstract base class for cryptography scanners.
 * Provides common functionality for different types of cryptography scanners.
 * @template C Type of result collector
 * @template I Type of input to be scanned
 * @template R Type of returned scan result
 */
export abstract class BaseCryptographyScanner<C,I,R> {

  protected config: CryptoCfg;

  protected resultCollector: C;

  /**
   * Creates a new instance of a cryptography scanner.
   * @param cfg Configuration settings for the scanner.
   * @param cryptoResultCollector Collector for storing scan results.
   */
  constructor(cfg: CryptoCfg, cryptoResultCollector: C) {
    this.config = cfg;
    this.resultCollector = cryptoResultCollector;
  }

  /**
   * Scans the provided input for cryptographic items.
   * This method must be implemented by derived classes.
   * @param files Input to be scanned.
   * @returns A promise that resolves to the scan result.
   */
  public abstract scan(files: I):Promise<R>;
}
