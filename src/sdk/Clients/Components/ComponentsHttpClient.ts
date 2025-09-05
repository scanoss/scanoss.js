import { HttpClient } from "../http/HttpClient";
import { logger } from "../../Logger";
import {
  IComponentsClient,
  ComponentSearchRequest,
  ComponentSearchResponse,
  ComponentVersionRequest,
  ComponentVersionResponse,
  ComponentStatisticResponse
} from "./IComponentsClient";
import { Component } from "../../types/common/types";
import { validateComponents } from "../helper/clientHelper";

export class ComponentsHttpClient extends HttpClient implements IComponentsClient {

  private client: HttpClient;
  private readonly baseUrl: string;

  constructor(token: string, hostName: string, ignoreCertErrors: boolean = false, proxyHost?: string, caCertPath?: string) {
    super();
    this.client = new HttpClient({
      HOST_URL: hostName,
      API_KEY: token,
      HTTPS_PROXY: proxyHost,
      CA_CERT: caCertPath,
      IGNORE_CERT_ERRORS: ignoreCertErrors,
    });
    this.baseUrl = hostName;
  }

  public async searchComponents(req: ComponentSearchRequest): Promise<ComponentSearchResponse> {
    try {
      const params = new URLSearchParams();
      if (req.search) params.append('search', req.search);
      if (req.vendor) params.append('vendor', req.vendor);
      if (req.component) params.append('component', req.component);
      if (req.package) params.append('package', req.package);
      if (req.limit) params.append('limit', req.limit.toString());
      if (req.offset) params.append('offset', req.offset.toString());

      const url = `${this.baseUrl}/v2/components/search?${params.toString()}`;
      const response = await this.client.get(url);

      if (response.ok) {
        return await response.json() as ComponentSearchResponse;
      }

      const errorText = await response.text();
      const errorMessage = `Failed to search components: ${response.status} ${response.statusText} - ${errorText}`;
      logger.log(`Error searching components: ${errorMessage}`);
      throw new Error(errorMessage);
    } catch (error) {
      logger.log('Error searching components:', error);
      throw this.handleError(error, 'Failed to search components');
    }
  }

  public async getComponentVersions(req: ComponentVersionRequest): Promise<ComponentVersionResponse> {
    try {
      const params = new URLSearchParams();
      params.append('purl', req.purl);
      if (req.limit) params.append('limit', req.limit.toString());

      const url = `${this.baseUrl}/v2/components/versions?${params.toString()}`;
      const response = await this.client.get(url);

      if (response.ok) {
        return await response.json() as ComponentVersionResponse;
      }

      const errorText = await response.text();
      const errorMessage = `Failed to get component versions: ${response.status} ${response.statusText} - ${errorText}`;
      logger.log(`Error getting component versions: ${errorMessage}`);
      throw new Error(errorMessage);
    } catch (error) {
      logger.log('Error getting component versions:', error);
      throw this.handleError(error, 'Failed to get component versions');
    }
  }

  public async getComponentStatistics(components: Component[]): Promise<ComponentStatisticResponse> {
    try {
      validateComponents(components);
      const response = await this.client.post(`${this.baseUrl}/v2/components/statistics`, { purls: components });

      if (response.ok) {
        return await response.json() as ComponentStatisticResponse;
      }

      const errorText = await response.text();
      const errorMessage = `Failed to get component statistics: ${response.status} ${response.statusText} - ${errorText}`;
      logger.log(`Error getting component statistics: ${errorMessage}`);
      throw new Error(errorMessage);
    } catch (error) {
      logger.log('Error getting component statistics:', error);
      throw this.handleError(error, 'Failed to get component statistics');
    }
  }
}
