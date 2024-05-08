import { CryptoItem } from '../Scanneable/CryptoItem';
import {
  createCryptoKeywordMapper, getCryptoMapper,
} from '../CryptoDef/CryptoDef';
import fs from 'fs';
import { CryptoAlgorithm, CryptoAlgorithmRules } from '../CryptographyTypes';
import { ThreadPool } from '../Worker/ThreadPool';


/**
 * Represents a CryptoCalculator used for searching cryptographic algorithms in files.
 */
export class LocalCrypto {

  private cryptoMapper: Map<string, CryptoAlgorithm>;

  private cryptoRules: Map<string, RegExp>;

  private threads: number;

  /**
   * Constructs a new LocalCrypto.
   * @param cryptoRules An array of CryptoAlgorithmRules used to create the search rules.
   * @param threads Number of threads to be use to scan local cryptography (default = 5).
   */
  constructor(cryptoRules: Array<CryptoAlgorithmRules>, threads: number) {
    this.cryptoRules = createCryptoKeywordMapper(cryptoRules);
    this.cryptoMapper = getCryptoMapper(cryptoRules);
    this.threads = threads;
  }

  /**
   * Searches for cryptographic algorithms in the content of a files.
   * @param files The files to search.
   */
  public async search(files: Array<string>): Promise<Array<CryptoItem>> {
    if (files.length <= 0) return [];
    const threadPool = new ThreadPool(this.threads, this.cryptoRules, this.cryptoMapper);
    files.forEach((f) => {
      threadPool.enqueueTask(new CryptoItem(f))
    });
    await threadPool.init();
    return await threadPool.processQueue();
  }
}
