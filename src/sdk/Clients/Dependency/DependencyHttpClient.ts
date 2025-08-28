import { HttpClient } from "../http/HttpClient";
import { DependencyRequest, DependencyResponse, IDependencyClient } from "./IDependencyClient";

export class DependencyHttpClient extends HttpClient implements IDependencyClient {

  private client: HttpClient;
  private readonly baseUrl: string;

  constructor(token: string, hostName: string, ignoreCertErrors: boolean = false,proxyHost?: string, caCertPath?: string) {
    super();
    this.client = new HttpClient({
      HOST_URL: hostName,
      API_KEY: token,
      HTTPS_PROXY: proxyHost,
      CA_CERT: caCertPath,
      IGNORE_CERT_ERRORS: ignoreCertErrors
    });
    this.baseUrl = hostName;
  }

  public async getDependencies(req: DependencyRequest): Promise<DependencyResponse> {
    try{
      const response = await this.client.post(`${this.baseUrl}/api/v2/dependencies/dependencies`, req);
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
  // TODO: Remove this adapter with new protobuf definition. This method keeps backward compatibility
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
        licensesList: dep.licenses.map(license => ({
          name: license.name,
          spdxId: license.spdxId,
          isSpdxApproved: license.isSpdxApproved,
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
