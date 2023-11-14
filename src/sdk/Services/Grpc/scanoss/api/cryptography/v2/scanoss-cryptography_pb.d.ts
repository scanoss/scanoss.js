// package: scanoss.api.cryptography.v2
// file: scanoss/api/cryptography/v2/scanoss-cryptography.proto

import * as jspb from "google-protobuf";
import * as scanoss_api_common_v2_scanoss_common_pb from "../../../../scanoss/api/common/v2/scanoss-common_pb";

export class AlgorithmResponse extends jspb.Message {
  clearPurlsList(): void;
  getPurlsList(): Array<AlgorithmResponse.Purls>;
  setPurlsList(value: Array<AlgorithmResponse.Purls>): void;
  addPurls(value?: AlgorithmResponse.Purls, index?: number): AlgorithmResponse.Purls;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): scanoss_api_common_v2_scanoss_common_pb.StatusResponse | undefined;
  setStatus(value?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AlgorithmResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AlgorithmResponse): AlgorithmResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AlgorithmResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AlgorithmResponse;
  static deserializeBinaryFromReader(message: AlgorithmResponse, reader: jspb.BinaryReader): AlgorithmResponse;
}

export namespace AlgorithmResponse {
  export type AsObject = {
    purlsList: Array<AlgorithmResponse.Purls.AsObject>,
    status?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse.AsObject,
  }

  export class Algorithms extends jspb.Message {
    getAlgorithm(): string;
    setAlgorithm(value: string): void;

    getStrength(): string;
    setStrength(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Algorithms.AsObject;
    static toObject(includeInstance: boolean, msg: Algorithms): Algorithms.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Algorithms, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Algorithms;
    static deserializeBinaryFromReader(message: Algorithms, reader: jspb.BinaryReader): Algorithms;
  }

  export namespace Algorithms {
    export type AsObject = {
      algorithm: string,
      strength: string,
    }
  }

  export class Purls extends jspb.Message {
    getPurl(): string;
    setPurl(value: string): void;

    getVersion(): string;
    setVersion(value: string): void;

    clearAlgorithmsList(): void;
    getAlgorithmsList(): Array<AlgorithmResponse.Algorithms>;
    setAlgorithmsList(value: Array<AlgorithmResponse.Algorithms>): void;
    addAlgorithms(value?: AlgorithmResponse.Algorithms, index?: number): AlgorithmResponse.Algorithms;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Purls.AsObject;
    static toObject(includeInstance: boolean, msg: Purls): Purls.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Purls, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Purls;
    static deserializeBinaryFromReader(message: Purls, reader: jspb.BinaryReader): Purls;
  }

  export namespace Purls {
    export type AsObject = {
      purl: string,
      version: string,
      algorithmsList: Array<AlgorithmResponse.Algorithms.AsObject>,
    }
  }
}

