import { HttpClient } from "../http/HttpClient";
import { DependencyRequest, DependencyResponse, IDependencyClient } from "./IDependencyClient";
import { ClientConfig } from "../interfaces/ClientConfig";
import { logger } from "../../Logger/Logger";

/**
 * HTTP client for dependency-related API operations.
 * Provides methods to retrieve dependency information for files and components.
 */
export class DependencyHttpClient extends HttpClient implements IDependencyClient {
  /**
   * Creates a new DependencyHttpClient instance.
   * @param clientConfig - Configuration for the HTTP client
   */
  constructor(clientConfig: ClientConfig) {
    super(clientConfig);
  }

  /**
   * Retrieves dependency information for the specified files and components.
   * @param req - Request containing files and their associated components/purls
   * @returns Promise resolving to dependency information for each file
   * @throws Error if the request fails
   */
  public async getDependencies(req: DependencyRequest): Promise<DependencyResponse> {
    try{
      const URL = `${this.hostURL()}/v2/dependencies/dependencies`;
      logger.debug(`Get Dependencies for ${URL}`);
      const response = await this.post(URL, req);
      if (response.ok) {
        return this.toDependencyResponse(await response.json());
      }
      const errorText = await response.text();
      const errorMessage = `Failed to get dependencies: ${response.status} ${response.statusText} - ${errorText}`;
      throw new Error(errorMessage);
    } catch (error) {
      throw this.handleError(error, 'Failed to get dependencies');
    }
  }
  /**
   * Converts API response to DependencyResponse format.
   * TODO: Remove this adapter with new protobuf definition. This method keeps backward compatibility
   * @param dependencies - Raw API response
   * @returns Formatted DependencyResponse
   */
  private toDependencyResponse(dependencies: any): DependencyResponse{
    // Convert files array to filesList
    const filesList = dependencies.files.map(file => ({
      file: file.file,
      id: file.id,
      status: file.status,
      dependenciesList: file.dependencies.map(dep => ({
        component: dep.component,
        purl: dep.purl,
        version: dep.version,
        requirement: dep.requirement,
        licensesList: dep.licenses.map(license => ({
          name: license.name,
          spdxId: license.spdx_id,
          isSpdxApproved: license.is_spdx_approved,
          url: license.url
        })),
        url: dep.url,
        comment: dep.comment,
        // Add scope if it exists in the original, otherwise default to "dependencies"
        scope: dep.scope || "dependencies"
      }))
    }));
    return {
      filesList: filesList,
      status: dependencies.status,
    };
  }
}
