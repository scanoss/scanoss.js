// package: scanoss.api.common.v2
// file: scanoss/api/common/v2/scanoss-common.proto

import * as jspb from "google-protobuf";

export class StatusResponse extends jspb.Message {
  getStatus(): StatusCodeMap[keyof StatusCodeMap];
  setStatus(value: StatusCodeMap[keyof StatusCodeMap]): void;

  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StatusResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StatusResponse): StatusResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StatusResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StatusResponse;
  static deserializeBinaryFromReader(message: StatusResponse, reader: jspb.BinaryReader): StatusResponse;
}

export namespace StatusResponse {
  export type AsObject = {
    status: StatusCodeMap[keyof StatusCodeMap],
    message: string,
  }
}

export class EchoRequest extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EchoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: EchoRequest): EchoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EchoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EchoRequest;
  static deserializeBinaryFromReader(message: EchoRequest, reader: jspb.BinaryReader): EchoRequest;
}

export namespace EchoRequest {
  export type AsObject = {
    message: string,
  }
}

export class EchoResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EchoResponse.AsObject;
  static toObject(includeInstance: boolean, msg: EchoResponse): EchoResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EchoResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EchoResponse;
  static deserializeBinaryFromReader(message: EchoResponse, reader: jspb.BinaryReader): EchoResponse;
}

export namespace EchoResponse {
  export type AsObject = {
    message: string,
  }
}

export class PurlRequest extends jspb.Message {
  clearPurlsList(): void;
  getPurlsList(): Array<PurlRequest.Purls>;
  setPurlsList(value: Array<PurlRequest.Purls>): void;
  addPurls(value?: PurlRequest.Purls, index?: number): PurlRequest.Purls;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PurlRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PurlRequest): PurlRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PurlRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PurlRequest;
  static deserializeBinaryFromReader(message: PurlRequest, reader: jspb.BinaryReader): PurlRequest;
}

export namespace PurlRequest {
  export type AsObject = {
    purlsList: Array<PurlRequest.Purls.AsObject>,
  }

  export class Purls extends jspb.Message {
    getPurl(): string;
    setPurl(value: string): void;

    getRequirement(): string;
    setRequirement(value: string): void;

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
      requirement: string,
    }
  }
}

export interface StatusCodeMap {
  UNSPECIFIED: 0;
  SUCCESS: 1;
  SUCCEEDED_WITH_WARNINGS: 2;
  WARNING: 3;
  FAILED: 4;
}

export const StatusCode: StatusCodeMap;

