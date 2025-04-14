import fs from 'fs';
import { Tree } from '../../tree/Tree';
import { CryptoCfg } from '../CryptoCfg';
import {
  CryptoAlgorithmRules, CryptoAlgorithmJobResponse, LocalCryptoAlgorithmJob
} from "../CryptographyTypes";
import path from 'path';
import {
  createCryptoKeywordMapper,
  getCryptoMapper
} from "./Helper/Helper";
import { Job } from "../../Utils/Concurrency/Job";
import { WorkerPool } from "../../Utils/Concurrency/WorkerPool";
import { cryptographyAlgorithmProcessor } from "./AlgorithmProcessor";
import { BaseCryptographyScanner } from "../BaseCryptographyScanner";
import { CryptographyResultCollector } from "../CryptographyResultCollector";

/**
 * A class responsible for scanning files for cryptographic items.
 */
export class CryptographyAlgorithmScanner extends BaseCryptographyScanner<Array<CryptoAlgorithmJobResponse>> {

  private readonly DEFAULT_CRYPTO_ALGORITHM_RULE_FILENAME = 'scanoss-crypto-algorithm-rules.json';

  /**
   * Constructs a new CryptographyScanner.
   * @param cryptoCfg The cryptographic configuration.
   * @param resultCollector cryptography results collector
   */
  constructor(cryptoCfg: CryptoCfg, resultCollector: CryptographyResultCollector) {
    super(cryptoCfg,resultCollector);
  }


  private async  buildJobs(files: string[]): Promise<Array<Job<LocalCryptoAlgorithmJob>>> {
    const cryptographyRules = await this.loadRules(this.config.getAlgorithmRulesPath());
    const rules = createCryptoKeywordMapper(cryptographyRules);
    const cryptoMapper = getCryptoMapper(cryptographyRules);
    const localCryptoJobs: Array<Job<LocalCryptoAlgorithmJob>> = [];
    files.forEach((f) => {
      const newJob = new Job<LocalCryptoAlgorithmJob>({
        file:f,
        rules,
        cryptoMapper
      });
      localCryptoJobs.push(newJob)
    });
    return localCryptoJobs;
  }

  /**
   * Scans an array of files for cryptographic items.
   * @param files An array of file paths to scan.
   * @returns A promise that resolves to an ILocalCryptographyResponse.
   */
  public async scan(files: Array<string>): Promise<Array<CryptoAlgorithmJobResponse>> {
    const workerPool = new WorkerPool<LocalCryptoAlgorithmJob, CryptoAlgorithmJobResponse>(cryptographyAlgorithmProcessor, this.config.getNumberOfThreads());
    const jobs = await this.buildJobs(files);
    workerPool.loadJobs(jobs)
    const results = await workerPool.run();
    this.resultCollector.collectAlgorithmResults(results);
    return results;
  }

  /**
   * Scans a folder for cryptographic items.
   * @param path The path of the folder to scan.
   * @returns A promise that resolves to an ILocalCryptographyResponse.
   * @throws Error if the specified path is not a directory.
   */
  public async scanFolder(path: string): Promise<Array<CryptoAlgorithmJobResponse>> {
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
      '../../../../../assets/data', this.DEFAULT_CRYPTO_ALGORITHM_RULE_FILENAME);
    const rules = await fs.promises.readFile(cryptoRulePath,'utf-8');
    return JSON.parse(rules);
  }

}
