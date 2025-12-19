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
  requirement: string;
}

export interface Status {
  status: string;
  message: string;
}

export interface AlgorithmResponse {
  components: ComponentAlgorithm[];
  status: Status;
}

export interface ComponentHintResponse extends Purl {
  hints: Hint[];
  requirement: string;
}

export interface HintsInRangeResponse {
  components: ComponentHintResponse[];
  status: Status;
}

export interface ICryptographyClient {
  getAlgorithms(components: Component[]): Promise<AlgorithmResponse>;
  getEncryptionHints(components: Component[]): Promise<HintsInRangeResponse>;
}
