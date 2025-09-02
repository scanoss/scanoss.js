import { CryptoCfg } from "./CryptoCfg";
import {
  FileAlgorithmScanner
} from "./Algorithm/Files/FileAlgorithmScanner";
import { FileHintScanner } from "./Hint/Files/FileHintScanner";
import {
  CryptographyResponse,
  LocalCryptographyResponse
} from "./CryptographyTypes";
import {
  FileCryptographyResultCollector
} from "./Helper/ResultCollector/File/FileCryptographyResultCollector";
import {
  ComponentCryptographyResultCollector
} from "./Helper/ResultCollector/Component/ComponentCryptographyResultColletor";
import {
  ComponentAlgorithmScanner
} from "./Algorithm/Components/ComponentAlgorithmScanner";
import {
  ComponentHintScanner
} from "./Hint/Components/ComponentHintScanner";
import { excludeBinariesAndLargeFiles } from "./Helper/CryptographyHelper";
import { Component } from "../types/common/types";

/**
 * Provides functionality to scan files and components for cryptographic items.
 * This class acts as the primary entry point for cryptographic scanning.
 */
export class CryptographyScanner {

  private readonly config: CryptoCfg;

  constructor(cfg: CryptoCfg) {
    this.config = cfg;
  }

  /**
   * Scans an array of files for cryptographic items.
   * Performs both algorithm detection and library scanning.
   * @param files An array of file paths to scan.
   * @returns {LocalCryptographyResponse} A promise that resolves to a LocalCryptographyResponse containing scan results.
   */
  public async scanFiles(files: Array<string>):Promise<LocalCryptographyResponse> {
    const cryptoResultCollector = new FileCryptographyResultCollector();
    // Skip cryptographic analysis when no files are present to analyze
    if (files.length <= 0) return cryptoResultCollector.getResults();
    const cryptoAlgorithmScanner = new FileAlgorithmScanner(this.config,cryptoResultCollector);
    const cryptoHintScanner = new FileHintScanner(this.config, cryptoResultCollector);
    const processableFiles = await excludeBinariesAndLargeFiles(files);
    await cryptoAlgorithmScanner.scan(processableFiles);
    await cryptoHintScanner.scan(processableFiles);
    return cryptoResultCollector.getResults();
  }

  /**
   * Scans components for cryptographic.
   * Performs both algorithm detection and library scanning at the component level.
   * @param req A request containing PURL's to scan
   * @returns {CryptographyResponse} A promise that resolves to an array of CryptographyResponse objects.
   */
  public async scanComponents(req: Component[]):Promise<Array<CryptographyResponse>> {
    const componentCryptoResultCollector = new ComponentCryptographyResultCollector();
    const componentCryptoAlgorithmScanner = new ComponentAlgorithmScanner(this.config, componentCryptoResultCollector);
    const componentCryptoHintScanner = new ComponentHintScanner(this.config, componentCryptoResultCollector);
    await componentCryptoAlgorithmScanner.scan(req);
    await componentCryptoHintScanner.scan(req);
    return componentCryptoResultCollector.getResults();
  }
}
