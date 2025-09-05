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
import { ClientConfig } from "../interfaces/ClientConfig";

/**
 * HTTP client for components-related API operations.
 * Provides methods to search components, get component versions, and retrieve component statistics.
 */
export class ComponentsHttpClient extends HttpClient implements IComponentsClient {
  /**
   * Creates a new ComponentsHttpClient instance.
   * @param clientConfig - Configuration for the HTTP client
   */
  constructor(clientConfig: ClientConfig) {
    super(clientConfig);
  }

  /**
   * Searches for components based on specified criteria.
   * @param req - Search request with optional search terms, vendor, component, package, limit, and offset
   * @returns Promise resolving to search results containing matching components
   * @throws Error if the request fails
   */
  public async searchComponents(req: ComponentSearchRequest): Promise<ComponentSearchResponse> {
    try {
      const params = new URLSearchParams();
      if (req.search) params.append('search', req.search);
      if (req.vendor) params.append('vendor', req.vendor);
      if (req.component) params.append('component', req.component);
      if (req.package) params.append('package', req.package);
      if (req.limit) params.append('limit', req.limit.toString());
      if (req.offset) params.append('offset', req.offset.toString());

      const URL = `${this.hostURL()}/v2/components/search?${params.toString()}`;
      const response = await this.get(URL);

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

  /**
   * Retrieves available versions for a specific component.
   * @param req - Request containing the component PURL and optional limit
   * @returns Promise resolving to component version information
   * @throws Error if the request fails
   */
  public async getComponentVersions(req: ComponentVersionRequest): Promise<ComponentVersionResponse> {
    try {
      const params = new URLSearchParams();
      params.append('purl', req.purl);
      if (req.limit) params.append('limit', req.limit.toString());

      const URL = `${this.hostURL()}/v2/components/versions?${params.toString()}`;
      const response = await this.get(URL);

      if (response.ok) {
        return this.adaptToComponentVersionResponse(await response.json());
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

  /**
   * Retrieves statistical information for the specified components.
   * @param components - Array of components to analyze for statistics
   * @returns Promise resolving to statistical information for each component
   * @throws Error if the request fails or components validation fails
   */
  public async getComponentStatistics(components: Component[]): Promise<ComponentStatisticResponse> {
    try {
      validateComponents(components);
      const URL = `${this.hostURL()}/v2/components/statistics`;
      const response = await this.post(URL, { purls: components });

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

  private adaptToComponentVersionResponse(response: any): ComponentVersionResponse {
    response.component.versions = response.component.versions.map((version) => {
      version.licenses = version.licenses.map((l) => {
        return {
          name: l.name,
          spdxId: l.spdx_id,
          isSpdxVersion: l.is_spdx_approved,
          url: l.url,
        }
      });
      return version;
    });
    return response;
  }

}
