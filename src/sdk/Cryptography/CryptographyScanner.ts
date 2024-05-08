import fs from 'fs';
import { Tree } from '../tree/Tree';
import { LocalCrypto } from './CryptoProvider/LocalCrypto';
import { CryptoCfg } from './CryptoCfg';
import {
  CryptoAlgorithmRules,
  ILocalCryptographyResponse
} from './CryptographyTypes';
import {
  mapToILocalCryptographyResponse
} from './utils/adapters/cryptoAdapters';
import path from 'path';

/**
 * A class responsible for scanning files for cryptographic items.
 */
export class CryptographyScanner {
  private cryptoConfig: CryptoCfg;

  /**
   * Constructs a new CryptographyScanner.
   * @param cryptoCfg The cryptographic configuration.
   */
  constructor(cryptoCfg: CryptoCfg) {
    this.cryptoConfig = cryptoCfg;
  }

  /**
   * Scans an array of files for cryptographic items.
   * @param files An array of file paths to scan.
   * @returns A promise that resolves to an ILocalCryptographyResponse.
   */
  public async scan(files: Array<string>): Promise<ILocalCryptographyResponse> {
    const cryptographyRules = await this.loadRules(this.cryptoConfig.getRulesPath());
    const localCrypto = new LocalCrypto(cryptographyRules, this.cryptoConfig.getNumberOfThreads());
    const cryptoItems = await localCrypto.search(files);
    return mapToILocalCryptographyResponse(cryptoItems);
  }

  /**
   * Scans a folder for cryptographic items.
   * @param path The path of the folder to scan.
   * @returns A promise that resolves to an ILocalCryptographyResponse.
   * @throws Error if the specified path is not a directory.
   */
  public async scanFolder(path: string): Promise<ILocalCryptographyResponse> {
    if (!(await fs.promises.lstat(path)).isDirectory())
      throw new Error('Specified path is not a directory');
    const tree = new Tree(path);
    tree.build();
    return await this.scan(tree.getFileList());
  }

  /**
   * Loads custom cryptographic rules from a file.
   * @returns A promise that resolves to the loaded rules.
   */
  private async loadRules(rulePath?: string): Promise<Array<CryptoAlgorithmRules>> {
    const cryptoRulePath = rulePath ? rulePath :  path.join(
      __dirname,
      '../../../../assets/data/defaultCryptoRules.json');
    const rules = await fs.promises.readFile(cryptoRulePath,'utf-8');
    return JSON.parse(rules);
  }

}
