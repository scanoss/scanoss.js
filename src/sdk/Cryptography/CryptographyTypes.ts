export interface CryptoAlgorithm {
  algorithm: string;
  strength: string;
}
export interface CryptoAlgorithmRules extends CryptoAlgorithm {
  keywords: Array<string>;
}

export interface CryptoAlgorithmJobResponse {
  file: string;
  algorithms: Array<CryptoAlgorithm>;
}

export interface LocalCryptoAlgorithmJob {
  file: string;
  rules: Map<string, RegExp>;
  cryptoMapper:Map<string, CryptoAlgorithm>;
}


// Local Crypto Hints
export interface CryptoHintRule {
  "id": string;
  "name": string;
  "description": string;
  "keywords": Array<string>;
  "url"?: string;
  "category": string;
  "purl"?: string;
  "tags": Array<string>;
}

export interface LocalCryptoHintJob {
  file: string;
  rules: Array<CryptoHintRule>;
}

export interface CryptoHintJobResponse {
  file: string;
  hints: Array<CryptoHintRule>;
}

export interface CryptoHintResponse{
  "id": string;
  "name": string;
  "description": string;
  "url"?: string;
  "category": string;
  "purl"?: string;
}

export interface CryptoAlgorithmResponse extends CryptoAlgorithm {}

export interface LocalCryptographyResponse {
  fileList: Array<{
    file: string;
    algorithms: Array<CryptoAlgorithmResponse>;
    hints: Array<CryptoHintResponse>;
  }>;
}
