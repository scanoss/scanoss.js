import {
  CryptoAlgorithmJobResponse, CryptoAlgorithmResponse,
  CryptoHintJobResponse, CryptoHintResponse, LocalCryptographyResponse
} from "../../../CryptographyTypes";

export interface CryptographyCollector {
  collectAlgorithmResults(algorithmResults: Array<CryptoAlgorithmJobResponse>): void
  collectHintResults(algorithmResults: Array<CryptoHintJobResponse>): void
}

/**
 * Collects and organizes cryptographic scan results for individual files.
 * This class implements the CryptographyCollector interface and maintains
 * a mapping of file paths to their respective algorithm and hint detection results.
 */
export class FileCryptographyResultCollector implements CryptographyCollector {

  private resultMapper = new Map<string,{
    file: string;
    algorithms: Array<CryptoAlgorithmResponse>;
    hints: Array<CryptoHintResponse>;
  }>

  /**
   * Gets an existing result entry for a file or creates a new one if it doesn't exist.
   * @param file The path to the file.
   * @returns The result entry for the specified file.
   */
  private getOrCreateFileResult(file: string) {
    if (!this.resultMapper.has(file)) {
      this.resultMapper.set(file, {
        file,
        algorithms: [],
        hints: []
      });
    }
    return this.resultMapper.get(file);
  }

  /**
   * Collects algorithm detection results and organizes them by file.
   * Skips files that have no detected algorithms.
   * @param algorithmResults The array of algorithm job responses to collect.
   */
  public collectAlgorithmResults(algorithmResults:Array<CryptoAlgorithmJobResponse>):void{
    algorithmResults.forEach((r)=> {
      if (r.algorithms.length <= 0) return;
      const result = this.getOrCreateFileResult(r.file);
      result.algorithms = r.algorithms;
    });
  }

  /**
   * Collects hint detection results and organizes them by file.
   * Skips files that have no detected hints.
   * @param hintsResults The array of hint job responses to collect.
   */
  public collectHintResults(hintsResults: Array<CryptoHintJobResponse>):void {
    hintsResults.forEach((r)=> {
      if (r.hints.length <= 0) return;
      const result = this.getOrCreateFileResult(r.file);
      result.hints = r.hints;
    });
  }

  /**
   * Retrieves all collected cryptography results for files.
   * @returns A LocalCryptographyResponse containing results for all files.
   */
  public getResults():LocalCryptographyResponse {
    return {
      fileList: Array.from(this.resultMapper.values())
    }
  }
}
