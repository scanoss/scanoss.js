export interface CryptoAlgorithm {
  algorithm: string;
  strength: string;
}
export interface CryptoAlgorithmRules extends CryptoAlgorithm {
  keywords: Array<string>;
}

export interface ICryptoItem {
  file: string;
  algorithms: Array<CryptoAlgorithm>;
}

export interface ILocalCryptographyResponse {
  fileList: Array<ICryptoItem>;
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

export interface CryptoJobResponse {
  file: string;
  hints: Array<CryptoHintRule>;
}
