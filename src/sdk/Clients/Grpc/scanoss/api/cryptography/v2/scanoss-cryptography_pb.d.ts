// package: scanoss.api.cryptography.v2
// file: scanoss/api/cryptography/v2/scanoss-cryptography.proto

import * as jspb from "google-protobuf";
import * as scanoss_api_common_v2_scanoss_common_pb from "../../../../scanoss/api/common/v2/scanoss-common_pb";

export class Algorithm extends jspb.Message {
  getAlgorithm(): string;
  setAlgorithm(value: string): void;

  getStrength(): string;
  setStrength(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Algorithm.AsObject;
  static toObject(includeInstance: boolean, msg: Algorithm): Algorithm.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Algorithm, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Algorithm;
  static deserializeBinaryFromReader(message: Algorithm, reader: jspb.BinaryReader): Algorithm;
}

export namespace Algorithm {
  export type AsObject = {
    algorithm: string,
    strength: string,
  }
}

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

  export class Purls extends jspb.Message {
    getPurl(): string;
    setPurl(value: string): void;

    getVersion(): string;
    setVersion(value: string): void;

    clearAlgorithmsList(): void;
    getAlgorithmsList(): Array<Algorithm>;
    setAlgorithmsList(value: Array<Algorithm>): void;
    addAlgorithms(value?: Algorithm, index?: number): Algorithm;

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
      algorithmsList: Array<Algorithm.AsObject>,
    }
  }
}

export class AlgorithmsInRangeResponse extends jspb.Message {
  clearPurlsList(): void;
  getPurlsList(): Array<AlgorithmsInRangeResponse.Purl>;
  setPurlsList(value: Array<AlgorithmsInRangeResponse.Purl>): void;
  addPurls(value?: AlgorithmsInRangeResponse.Purl, index?: number): AlgorithmsInRangeResponse.Purl;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): scanoss_api_common_v2_scanoss_common_pb.StatusResponse | undefined;
  setStatus(value?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AlgorithmsInRangeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AlgorithmsInRangeResponse): AlgorithmsInRangeResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AlgorithmsInRangeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AlgorithmsInRangeResponse;
  static deserializeBinaryFromReader(message: AlgorithmsInRangeResponse, reader: jspb.BinaryReader): AlgorithmsInRangeResponse;
}

export namespace AlgorithmsInRangeResponse {
  export type AsObject = {
    purlsList: Array<AlgorithmsInRangeResponse.Purl.AsObject>,
    status?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse.AsObject,
  }

  export class Purl extends jspb.Message {
    getPurl(): string;
    setPurl(value: string): void;

    clearVersionsList(): void;
    getVersionsList(): Array<string>;
    setVersionsList(value: Array<string>): void;
    addVersions(value: string, index?: number): string;

    clearAlgorithmsList(): void;
    getAlgorithmsList(): Array<Algorithm>;
    setAlgorithmsList(value: Array<Algorithm>): void;
    addAlgorithms(value?: Algorithm, index?: number): Algorithm;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Purl.AsObject;
    static toObject(includeInstance: boolean, msg: Purl): Purl.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Purl, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Purl;
    static deserializeBinaryFromReader(message: Purl, reader: jspb.BinaryReader): Purl;
  }

  export namespace Purl {
    export type AsObject = {
      purl: string,
      versionsList: Array<string>,
      algorithmsList: Array<Algorithm.AsObject>,
    }
  }
}

export class VersionsInRangeResponse extends jspb.Message {
  clearPurlsList(): void;
  getPurlsList(): Array<VersionsInRangeResponse.Purl>;
  setPurlsList(value: Array<VersionsInRangeResponse.Purl>): void;
  addPurls(value?: VersionsInRangeResponse.Purl, index?: number): VersionsInRangeResponse.Purl;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): scanoss_api_common_v2_scanoss_common_pb.StatusResponse | undefined;
  setStatus(value?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VersionsInRangeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: VersionsInRangeResponse): VersionsInRangeResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VersionsInRangeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VersionsInRangeResponse;
  static deserializeBinaryFromReader(message: VersionsInRangeResponse, reader: jspb.BinaryReader): VersionsInRangeResponse;
}

export namespace VersionsInRangeResponse {
  export type AsObject = {
    purlsList: Array<VersionsInRangeResponse.Purl.AsObject>,
    status?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse.AsObject,
  }

  export class Purl extends jspb.Message {
    getPurl(): string;
    setPurl(value: string): void;

    clearVersionsWithList(): void;
    getVersionsWithList(): Array<string>;
    setVersionsWithList(value: Array<string>): void;
    addVersionsWith(value: string, index?: number): string;

    clearVersionsWithoutList(): void;
    getVersionsWithoutList(): Array<string>;
    setVersionsWithoutList(value: Array<string>): void;
    addVersionsWithout(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Purl.AsObject;
    static toObject(includeInstance: boolean, msg: Purl): Purl.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Purl, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Purl;
    static deserializeBinaryFromReader(message: Purl, reader: jspb.BinaryReader): Purl;
  }

  export namespace Purl {
    export type AsObject = {
      purl: string,
      versionsWithList: Array<string>,
      versionsWithoutList: Array<string>,
    }
  }
}

export class Hint extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getName(): string;
  setName(value: string): void;

  getDescription(): string;
  setDescription(value: string): void;

  getCategory(): string;
  setCategory(value: string): void;

  hasUrl(): boolean;
  clearUrl(): void;
  getUrl(): string;
  setUrl(value: string): void;

  hasPurl(): boolean;
  clearPurl(): void;
  getPurl(): string;
  setPurl(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Hint.AsObject;
  static toObject(includeInstance: boolean, msg: Hint): Hint.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Hint, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Hint;
  static deserializeBinaryFromReader(message: Hint, reader: jspb.BinaryReader): Hint;
}

export namespace Hint {
  export type AsObject = {
    id: string,
    name: string,
    description: string,
    category: string,
    url: string,
    purl: string,
  }
}

export class HintsResponse extends jspb.Message {
  clearPurlsList(): void;
  getPurlsList(): Array<HintsResponse.Purls>;
  setPurlsList(value: Array<HintsResponse.Purls>): void;
  addPurls(value?: HintsResponse.Purls, index?: number): HintsResponse.Purls;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): scanoss_api_common_v2_scanoss_common_pb.StatusResponse | undefined;
  setStatus(value?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HintsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: HintsResponse): HintsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HintsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HintsResponse;
  static deserializeBinaryFromReader(message: HintsResponse, reader: jspb.BinaryReader): HintsResponse;
}

export namespace HintsResponse {
  export type AsObject = {
    purlsList: Array<HintsResponse.Purls.AsObject>,
    status?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse.AsObject,
  }

  export class Purls extends jspb.Message {
    getPurl(): string;
    setPurl(value: string): void;

    getVersion(): string;
    setVersion(value: string): void;

    clearHintsList(): void;
    getHintsList(): Array<Hint>;
    setHintsList(value: Array<Hint>): void;
    addHints(value?: Hint, index?: number): Hint;

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
      hintsList: Array<Hint.AsObject>,
    }
  }
}

export class HintsInRangeResponse extends jspb.Message {
  clearPurlsList(): void;
  getPurlsList(): Array<HintsInRangeResponse.Purl>;
  setPurlsList(value: Array<HintsInRangeResponse.Purl>): void;
  addPurls(value?: HintsInRangeResponse.Purl, index?: number): HintsInRangeResponse.Purl;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): scanoss_api_common_v2_scanoss_common_pb.StatusResponse | undefined;
  setStatus(value?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HintsInRangeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: HintsInRangeResponse): HintsInRangeResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HintsInRangeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HintsInRangeResponse;
  static deserializeBinaryFromReader(message: HintsInRangeResponse, reader: jspb.BinaryReader): HintsInRangeResponse;
}

export namespace HintsInRangeResponse {
  export type AsObject = {
    purlsList: Array<HintsInRangeResponse.Purl.AsObject>,
    status?: scanoss_api_common_v2_scanoss_common_pb.StatusResponse.AsObject,
  }

  export class Purl extends jspb.Message {
    getPurl(): string;
    setPurl(value: string): void;

    clearVersionsList(): void;
    getVersionsList(): Array<string>;
    setVersionsList(value: Array<string>): void;
    addVersions(value: string, index?: number): string;

    clearHintsList(): void;
    getHintsList(): Array<Hint>;
    setHintsList(value: Array<Hint>): void;
    addHints(value?: Hint, index?: number): Hint;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Purl.AsObject;
    static toObject(includeInstance: boolean, msg: Purl): Purl.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Purl, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Purl;
    static deserializeBinaryFromReader(message: Purl, reader: jspb.BinaryReader): Purl;
  }

  export namespace Purl {
    export type AsObject = {
      purl: string,
      versionsList: Array<string>,
      hintsList: Array<Hint.AsObject>,
    }
  }
}

