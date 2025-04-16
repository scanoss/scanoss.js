import {
  CryptoAlgorithmJobResponse, CryptoAlgorithmResponse,
  CryptoHintJobResponse, CryptoHintResponse, LocalCryptographyResponse
} from "../../../CryptographyTypes";

export interface CryptographyCollector {
  collectAlgorithmResults(algorithmResults: Array<CryptoAlgorithmJobResponse>): void
  collectHintResults(algorithmResults: Array<CryptoHintJobResponse>): void
}

export class FileCryptographyResultCollector implements CryptographyCollector {

  private resultMapper = new Map<string,{
    file: string;
    algorithms: Array<CryptoAlgorithmResponse>;
    hints: Array<CryptoHintResponse>;
  }>

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

  public collectAlgorithmResults(algorithmResults: Array<CryptoAlgorithmJobResponse>){
    algorithmResults.forEach((r)=> {
      if (r.algorithms.length <= 0) return;
      const result = this.getOrCreateFileResult(r.file);
      result.algorithms = r.algorithms;
    });
  }

  public collectHintResults(hintsResults: Array<CryptoHintJobResponse>){
    hintsResults.forEach((r)=> {
      if (r.hints.length <= 0) return;
      const result = this.getOrCreateFileResult(r.file);
      result.hints = r.hints;
    });
  }

  public getResults(): LocalCryptographyResponse{
    return {
      fileList: Array.from(this.resultMapper.values())
    }
  }

}
