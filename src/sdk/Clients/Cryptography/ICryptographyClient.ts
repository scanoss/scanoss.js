import { Component } from "../../types/common/types";


export interface Hint {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  purl: string;
}

export interface Algorithm {
  algorithm: string;
  strength: string;
}

export interface Purl {
  purl: string;
  version: string;
}

export interface ComponentAlgorithm extends Purl {
  algorithms: Algorithm[];
}

export interface Status {
  status: string;
  message: string;
}

export interface AlgorithmResponse {
  purls: ComponentAlgorithm[];
  status: Status;
}

export interface ComponentHintResponse extends Purl {
  hints: Hint[];
  versions: string[];
}

export interface HintsInRangeResponse {
  purls: ComponentHintResponse[];
  status: Status;
}

export interface ICryptographyClient {
  getAlgorithms(components: Component[]): Promise<AlgorithmResponse>;
  getEncryptionHints(components: Component[]): Promise<HintsInRangeResponse>;
}
