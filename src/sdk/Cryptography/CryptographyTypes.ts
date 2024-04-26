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
