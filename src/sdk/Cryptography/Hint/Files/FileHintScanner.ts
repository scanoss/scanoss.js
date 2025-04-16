import { CryptoCfg } from "../../CryptoCfg";
import { Job } from "../../../Utils/Concurrency/Job";
import {
  CryptoHintRule, CryptoHintJobResponse,
  LocalCryptoHintJob
} from "../../CryptographyTypes";
import path from "path";
import fs from "fs";
import { WorkerPool } from "../../../Utils/Concurrency/WorkerPool";
import { cryptographyHintProcessor } from "./HintProcessor";
import { BaseCryptographyScanner } from "../../BaseCryptographyScanner";
import {
  FileCryptographyResultCollector
} from "../../Helper/ResultCollector/File/FileCryptographyResultCollector";


/**
 * A class responsible for scanning files for cryptographic items.
 */
export class FileHintScanner
  extends BaseCryptographyScanner<
    FileCryptographyResultCollector,
    Array<string>,
    Array<CryptoHintJobResponse>>{

  private readonly DEFAULT_CRYPTO_LIBRARY_RULE_FILENAME = 'scanoss-crypto-library-rules.json';

  /**
   * Constructs a new CryptographyScanner.
   * @param cryptoCfg The cryptographic configuration.
   * @param resultCollector cryptography results collector
   */
  constructor(cryptoCfg: CryptoCfg, resultCollector: FileCryptographyResultCollector) {
    super(cryptoCfg,resultCollector);
  }

  private async buildJobs(files: string[]): Promise<Array<Job<LocalCryptoHintJob>>> {
    const rules = await this.loadRules(this.config.getLibraryRulesPath());
    const jobs: Array<Job<LocalCryptoHintJob>> = [];
    files.forEach((f) => {
      const newJob = new Job<LocalCryptoHintJob>({
        file:f,
        rules,
      });
      jobs.push(newJob)
    });
    return jobs;
  }

  /**
   * Scans an array of files for cryptographic items.
   * @param files An array of file paths to scan.
   * @returns A promise that resolves to an ILocalCryptographyResponse.
   */
  public async scan(files: Array<string>): Promise<Array<CryptoHintJobResponse>> {
    const workerPool = new WorkerPool<LocalCryptoHintJob, CryptoHintJobResponse>(cryptographyHintProcessor, this.config.getNumberOfThreads());
    const jobs = await this.buildJobs(files);
    workerPool.loadJobs(jobs)
    const results = await workerPool.run();
    this.resultCollector.collectHintResults(results)
    return results;
  }

  /**
   * Loads custom cryptographic rules from a file.
   * @returns A promise that resolves to the loaded rules.
   */
  private async loadRules(rulePath?: string): Promise<Array<CryptoHintRule>> {
    const cryptoRulePath = rulePath ? rulePath :  path.join(
      __dirname,
      '../../../../../../assets/data', this.DEFAULT_CRYPTO_LIBRARY_RULE_FILENAME);
    const rules = await fs.promises.readFile(cryptoRulePath,'utf-8');
    return JSON.parse(rules);
  }



}
