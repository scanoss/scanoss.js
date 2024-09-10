import { Transport } from "../api/transport";
import { DependencyApi } from "../api/Dependency.api";
import { TransportNotSetError } from "../errors/TransportNotSet.error";
import { DependencyRequest, StatusCode } from "../api/types";
import { status } from "@grpc/grpc-js";

export interface DecoratedDependency {
  file: string;
  id: string;
  status: string;
  dependencies: Array<{
    component: string;
    purl: string;
    version: string;
    licenses: Array<{
      name: string;
      spdx_id: string;
      is_spdx_approved: boolean;
      url: string;
    }>;
    url: string;
    comment: string;
  }>;
}

export interface Dependency {
  purl: string;
  requirement?: string;
  scope: string;
}

/**
 * DependencyNamespace encapsulates all dependency-related operations in the SCANOSS SDK.
 * It provides methods for both local dependency parsing and remote API interactions.
 */
export class DependencyNamespace {
  private parser: any; //Here the LocalDependencyScanner should be loaded
  private api: DependencyApi | null;

  constructor(t: Transport) {
    this.parser = null;
    this.api = new DependencyApi(t);
  }

  async decorate(dependencyList: Array<Dependency>): Promise<Array<DecoratedDependency>> {
    if (!this.api) {
      throw new TransportNotSetError("Index not initialized. Cannot perform remote operations.");
    }

    const request: DependencyRequest = {
      files: [
        {
          file: "dummy.txt", // Not using actual files here, provide a dummy filename
          purls: dependencyList.map((dep) => ({
            purl: dep.purl,
            requirement: dep.requirement,
          })),
        },
      ],
      depth: 1, //Only supported 1
    };

    const result = await this.api.get(request);
    if (result.status.status !== StatusCode.SUCCESS && result.status.status !== StatusCode.SUCCEEDED_WITH_WARNINGS)
       throw new Error(result.status.message);

    return result.files;
  }


}
