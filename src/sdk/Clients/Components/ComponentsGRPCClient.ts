import { BaseGRPCClient } from "../Grpc/BaseGRPCClient";
import {
  IComponentsClient,
  ComponentSearchRequest,
  ComponentSearchResponse,
  ComponentVersionRequest,
  ComponentVersionResponse,
  ComponentStatisticResponse
} from "./IComponentsClient";
import { Component } from "../../types/common/types";

/**
 * @deprecated This gRPC client is deprecated. Use ComponentsHttpClient instead.
 */
export class ComponentsGRPCClient extends BaseGRPCClient implements IComponentsClient {
  public static readonly clientName = 'Components gRPC Client';

  constructor(apiKey?: string, hostName?: string, proxyHost?: string, caCertPath?: string) {
    super({
      HOSTNAME: hostName,
      CLIENT_NAME: ComponentsGRPCClient.clientName,
      PROXY_URL: proxyHost,
      CA_CERT: caCertPath,
      API_TOKEN: apiKey,
    });
  }

  public async searchComponents(req: ComponentSearchRequest): Promise<ComponentSearchResponse> {
    // TODO: Implement once protobuf types are properly generated
    throw new Error('gRPC components client not yet implemented. Use HTTP client instead.');
  }

  public async getComponentVersions(req: ComponentVersionRequest): Promise<ComponentVersionResponse> {
    // TODO: Implement once protobuf types are properly generated
    throw new Error('gRPC components client not yet implemented. Use HTTP client instead.');
  }

  public async getComponentStatistics(components: Component[]): Promise<ComponentStatisticResponse> {
    // TODO: Implement once protobuf types are properly generated
    throw new Error('gRPC components client not yet implemented. Use HTTP client instead.');
  }
}