import { Component } from "../types/common/types";


export interface CryptoAlgorithm {
  algorithm: string;
  strength: string;
}

export interface LocalCryptoAlgorithm {
  algorithm: string;
  algorithmId: string;
  strength: string;
  category: string;
}

export interface CryptoAlgorithmRules extends LocalCryptoAlgorithm {
  keywords: Array<string>;
}

export interface CryptoAlgorithmJobResponse {
  file: string;
  algorithms: Array<LocalCryptoAlgorithm>;
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
  hints: Array<CryptoHintResponse>;
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

export interface LocalCryptography {
  file: string;
  algorithms: Array<CryptoAlgorithmResponse>;
  hints: Array<CryptoHintResponse>;
}

export interface LocalCryptographyResponse {
  fileList: Array<LocalCryptography>;
}

export interface CryptographyResponse {
  purl: string;
  version: string;
  requirement: string;
  algorithms: Array<CryptoAlgorithmResponse>;
  hints: Array<CryptoHintResponse>;
}

export interface CryptoRequest {
  purls: Component[];
}
