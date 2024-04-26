import { CryptoItem } from '../Scanneable/CryptoItem';
import {
  createCryptoKeywordMapper, getCryptoMapper,
} from '../CryptoDef/CryptoDef';
import fs from 'fs';
import { CryptoAlgorithm, CryptoAlgorithmRules } from '../CryptographyTypes';

/**
 * Represents a CryptoCalculator used for searching cryptographic algorithms in files.
 */
export class LocalCrypto {

  private cryptoMapper : Map<string, CryptoAlgorithm>;

  private cryptoRules: Map<string, RegExp>;

  /**
   * Constructs a new LocalCrypto.
   * @param cryptoRules An array of CryptoAlgorithmRules used to create the search rules.
   */
  constructor(cryptoRules: Array<CryptoAlgorithmRules>) {
    this.cryptoRules = createCryptoKeywordMapper(cryptoRules);
    this.cryptoMapper = getCryptoMapper(cryptoRules)
  }

  /**
   * Searches for cryptographic algorithms in the content of a files.
   * @param files The files to search.
   */
  public async search(files: Array<string>): Promise<Array<CryptoItem>> {
    if (files.length <= 0) return [];
    const cryptoItems = files.map((f)=> { return new CryptoItem(f) });
    await Promise.all(cryptoItems.map(async (c) => {
      await this.searchCrypto(c);
    }));
    return cryptoItems;
  }

  /**
   * Asynchronously searches for cryptographic algorithms in the content of a file.
   * @param cryptoItem The CryptoItem to search for cryptographic algorithms.
   * @returns A promise that resolves when the search is complete.
   */
  private async searchCrypto(cryptoItem: CryptoItem){
    const cryptoFound = new Array<string>();
    let content =  await fs.promises.readFile(cryptoItem.getPath(), 'utf-8');
    this.cryptoRules.forEach((value, key) => {
      try {
        const matches = content.match(value);
        if (matches) {
          cryptoFound.push(key);
        }
      } catch (e){
        console.error(e);
      }
    });
    const results: Array<CryptoAlgorithm> = [];
    cryptoFound.forEach((cf)=>{
      results.push(this.cryptoMapper.get(cf));
    });
    cryptoItem.setAlgorithms(results);
  }
}
