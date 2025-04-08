// GENERATED CODE -- DO NOT EDIT!

// package: scanoss.api.cryptography.v2
// file: scanoss/api/cryptography/v2/scanoss-cryptography.proto

import * as scanoss_api_cryptography_v2_scanoss_cryptography_pb from "../../../../scanoss/api/cryptography/v2/scanoss-cryptography_pb";
import * as scanoss_api_common_v2_scanoss_common_pb from "../../../../scanoss/api/common/v2/scanoss-common_pb";
import * as grpc from "@grpc/grpc-js";

interface ICryptographyService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  echo: grpc.MethodDefinition<scanoss_api_common_v2_scanoss_common_pb.EchoRequest, scanoss_api_common_v2_scanoss_common_pb.EchoResponse>;
  getAlgorithms: grpc.MethodDefinition<scanoss_api_common_v2_scanoss_common_pb.PurlRequest, scanoss_api_cryptography_v2_scanoss_cryptography_pb.AlgorithmResponse>;
  getAlgorithmsInRange: grpc.MethodDefinition<scanoss_api_common_v2_scanoss_common_pb.PurlRequest, scanoss_api_cryptography_v2_scanoss_cryptography_pb.AlgorithmsInRangeResponse>;
  getVersionsInRange: grpc.MethodDefinition<scanoss_api_common_v2_scanoss_common_pb.PurlRequest, scanoss_api_cryptography_v2_scanoss_cryptography_pb.VersionsInRangeResponse>;
  getHintsInRange: grpc.MethodDefinition<scanoss_api_common_v2_scanoss_common_pb.PurlRequest, scanoss_api_cryptography_v2_scanoss_cryptography_pb.HintsInRangeResponse>;
}

export const CryptographyService: ICryptographyService;

export interface ICryptographyServer extends grpc.UntypedServiceImplementation {
  echo: grpc.handleUnaryCall<scanoss_api_common_v2_scanoss_common_pb.EchoRequest, scanoss_api_common_v2_scanoss_common_pb.EchoResponse>;
  getAlgorithms: grpc.handleUnaryCall<scanoss_api_common_v2_scanoss_common_pb.PurlRequest, scanoss_api_cryptography_v2_scanoss_cryptography_pb.AlgorithmResponse>;
  getAlgorithmsInRange: grpc.handleUnaryCall<scanoss_api_common_v2_scanoss_common_pb.PurlRequest, scanoss_api_cryptography_v2_scanoss_cryptography_pb.AlgorithmsInRangeResponse>;
  getVersionsInRange: grpc.handleUnaryCall<scanoss_api_common_v2_scanoss_common_pb.PurlRequest, scanoss_api_cryptography_v2_scanoss_cryptography_pb.VersionsInRangeResponse>;
  getHintsInRange: grpc.handleUnaryCall<scanoss_api_common_v2_scanoss_common_pb.PurlRequest, scanoss_api_cryptography_v2_scanoss_cryptography_pb.HintsInRangeResponse>;
}

export class CryptographyClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  echo(argument: scanoss_api_common_v2_scanoss_common_pb.EchoRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_common_v2_scanoss_common_pb.EchoResponse>): grpc.ClientUnaryCall;
  getAlgorithms(argument: scanoss_api_common_v2_scanoss_common_pb.PurlRequest, callback: grpc.requestCallback<scanoss_api_cryptography_v2_scanoss_cryptography_pb.AlgorithmResponse>): grpc.ClientUnaryCall;
  getAlgorithms(argument: scanoss_api_common_v2_scanoss_common_pb.PurlRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_cryptography_v2_scanoss_cryptography_pb.AlgorithmResponse>): grpc.ClientUnaryCall;
  getAlgorithms(argument: scanoss_api_common_v2_scanoss_common_pb.PurlRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_cryptography_v2_scanoss_cryptography_pb.AlgorithmResponse>): grpc.ClientUnaryCall;
  getAlgorithmsInRange(argument: scanoss_api_common_v2_scanoss_common_pb.PurlRequest, callback: grpc.requestCallback<scanoss_api_cryptography_v2_scanoss_cryptography_pb.AlgorithmsInRangeResponse>): grpc.ClientUnaryCall;
  getAlgorithmsInRange(argument: scanoss_api_common_v2_scanoss_common_pb.PurlRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_cryptography_v2_scanoss_cryptography_pb.AlgorithmsInRangeResponse>): grpc.ClientUnaryCall;
  getAlgorithmsInRange(argument: scanoss_api_common_v2_scanoss_common_pb.PurlRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_cryptography_v2_scanoss_cryptography_pb.AlgorithmsInRangeResponse>): grpc.ClientUnaryCall;
  getVersionsInRange(argument: scanoss_api_common_v2_scanoss_common_pb.PurlRequest, callback: grpc.requestCallback<scanoss_api_cryptography_v2_scanoss_cryptography_pb.VersionsInRangeResponse>): grpc.ClientUnaryCall;
  getVersionsInRange(argument: scanoss_api_common_v2_scanoss_common_pb.PurlRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_cryptography_v2_scanoss_cryptography_pb.VersionsInRangeResponse>): grpc.ClientUnaryCall;
  getVersionsInRange(argument: scanoss_api_common_v2_scanoss_common_pb.PurlRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_cryptography_v2_scanoss_cryptography_pb.VersionsInRangeResponse>): grpc.ClientUnaryCall;
  getHintsInRange(argument: scanoss_api_common_v2_scanoss_common_pb.PurlRequest, callback: grpc.requestCallback<scanoss_api_cryptography_v2_scanoss_cryptography_pb.HintsInRangeResponse>): grpc.ClientUnaryCall;
  getHintsInRange(argument: scanoss_api_common_v2_scanoss_common_pb.PurlRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_cryptography_v2_scanoss_cryptography_pb.HintsInRangeResponse>): grpc.ClientUnaryCall;
  getHintsInRange(argument: scanoss_api_common_v2_scanoss_common_pb.PurlRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<scanoss_api_cryptography_v2_scanoss_cryptography_pb.HintsInRangeResponse>): grpc.ClientUnaryCall;
}
