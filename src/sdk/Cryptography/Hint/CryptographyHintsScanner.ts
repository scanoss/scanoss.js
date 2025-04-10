import { CryptoCfg } from "../CryptoCfg";
import { Job } from "../../Utils/Concurrency/Job";
import {
  CryptoHintRule, CryptoJobResponse,
  LocalCryptoHintJob
} from "../CryptographyTypes";
import path from "path";
import fs from "fs";
import { WorkerPool } from "../../Utils/Concurrency/WorkerPool";
import { cryptographyHintProcessor } from "./HintProcessor";

/**
 * A class responsible for scanning files for cryptographic items.
 */
export class CryptographyHintScanner {
  private cryptoConfig: CryptoCfg;

  /**
   * Constructs a new CryptographyScanner.
   * @param cryptoCfg The cryptographic configuration.
   */
  constructor(cryptoCfg: CryptoCfg) {
    this.cryptoConfig = cryptoCfg;
  }

  private async buildJobs(files: string[]): Promise<Array<Job<LocalCryptoHintJob>>> {
    const rules = await this.loadRules(this.cryptoConfig.getRulesPath());
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
  public async scan(files: Array<string>): Promise<Array<CryptoJobResponse>> {
    const workerPool = new WorkerPool<LocalCryptoHintJob, CryptoJobResponse>(cryptographyHintProcessor, this.cryptoConfig.getNumberOfThreads());
    const jobs = await this.buildJobs(files);
    workerPool.loadJobs(jobs)
    return await workerPool.run();
  }

  /**
   * Loads custom cryptographic rules from a file.
   * @returns A promise that resolves to the loaded rules.
   */
  private async loadRules(rulePath?: string): Promise<Array<CryptoHintRule>> {
    const cryptoRulePath = rulePath ? rulePath :  path.join(
      __dirname,
      '../../../../../assets/data/default-scanoss-crypto-libraries.json');
    const rules = await fs.promises.readFile(cryptoRulePath,'utf-8');
    return JSON.parse(rules);
  }



}
