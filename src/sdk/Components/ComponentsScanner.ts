import { ComponentsScannerCfg } from './ComponentsScannerCfg';
import { logger } from "../Logger";
import { ComponentsHttpClient } from "../Clients/Components/ComponentsHttpClient";
import { ComponentsGRPCClient } from "../Clients/Components/ComponentsGRPCClient";
import {
  IComponentsClient,
  ComponentSearchRequest,
  ComponentSearchResponse,
  ComponentVersionRequest,
  ComponentVersionResponse,
  ComponentStatisticResponse
} from "../Clients/Components/IComponentsClient";
import { Component } from "../types/common/types";

export class ComponentsScanner {

  private componentsClient: IComponentsClient;
  private config: ComponentsScannerCfg = new ComponentsScannerCfg();

  constructor(cfg?: ComponentsScannerCfg) {
    if (cfg) this.config = cfg;
    else this.config = new ComponentsScannerCfg();

    // Initialize the appropriate client based on configuration
    if (this.config.USE_GRPC) {
      this.componentsClient = new ComponentsGRPCClient(
        this.config.API_KEY,
        this.config.API_URL,
        this.config.GRPC_PROXY,
        this.config.CA_CERT
      );
      logger.log('Using gRPC client for components service');
    } else {
      this.componentsClient = new ComponentsHttpClient(
        this.config.API_KEY,
        this.config.API_URL,
        this.config.IGNORE_CERT_ERRORS,
        this.config.HTTPS_PROXY,
        this.config.CA_CERT
      );
      logger.log('Using HTTP client for components service');
    }
  }

  /**
   * Search for components based on search criteria
   * @param searchRequest - Component search parameters
   * @returns Promise<ComponentSearchResponse>
   */
  public async searchComponents(searchRequest: ComponentSearchRequest): Promise<ComponentSearchResponse> {
    try {
      logger.log(`Searching for components with criteria: ${JSON.stringify(searchRequest)}`);
      const response = await this.componentsClient.searchComponents(searchRequest);
      logger.log(`Found ${response.components.length} components`);
      return response;
    } catch (error) {
      logger.log('Error searching components:', error);
      throw error;
    }
  }

  /**
   * Get version information for a specific component
   * @param versionRequest - Component version request parameters
   * @returns Promise<ComponentVersionResponse>
   */
  public async getComponentVersions(versionRequest: ComponentVersionRequest): Promise<ComponentVersionResponse> {
    try {
      logger.log(`Getting component versions for purl: ${versionRequest.purl}`);
      const response = await this.componentsClient.getComponentVersions(versionRequest);
      logger.log(`Found ${response.component.versions.length} versions for component`);
      return response;
    } catch (error) {
      logger.log('Error getting component versions:', error);
      throw error;
    }
  }

  /**
   * Get statistics for multiple components
   * @param components - Array of components to get statistics for
   * @returns Promise<ComponentStatisticResponse>
   */
  public async getComponentStatistics(components: Component[]): Promise<ComponentStatisticResponse> {
    try {
      logger.log(`Getting statistics for ${components.length} components`);
      const response = await this.componentsClient.getComponentStatistics(components);
      logger.log(`Retrieved statistics for ${response.purls.length} components`);
      return response;
    } catch (error) {
      logger.log('Error getting component statistics:', error);
      throw error;
    }
  }

  /**
   * Search for a component by name and optionally get its versions and statistics
   * @param componentName - Name of the component to search for
   * @param includeVersions - Whether to include version information
   * @param includeStatistics - Whether to include statistics
   * @returns Combined component information
   */
  public async getComponentInfo(componentName: string, includeVersions: boolean = false, includeStatistics: boolean = false) {
    try {
      // First search for the component
      const searchResponse = await this.searchComponents({ search: componentName, limit: 1 });
      
      if (searchResponse.components.length === 0) {
        throw new Error(`No component found with name: ${componentName}`);
      }

      const component = searchResponse.components[0];
      const result: any = {
        component: component,
        versions: null,
        statistics: null
      };

      if (includeVersions) {
        const versionsResponse = await this.getComponentVersions({ purl: component.purl });
        result.versions = versionsResponse.component.versions;
      }

      if (includeStatistics) {
        const statsResponse = await this.getComponentStatistics([{ purl: component.purl }]);
        result.statistics = statsResponse.purls[0]?.statistics || null;
      }

      return result;
    } catch (error) {
      logger.log('Error getting component info:', error);
      throw error;
    }
  }
}