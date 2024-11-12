import { Transport } from "../api/transport";
import { DependencyApi } from "../api/Dependency.api";
import { DependencyRequest, StatusCode } from "../api/types";
import { status } from "@grpc/grpc-js";
import fs from "fs";
import {
  DependencyPurlExtractorNotSetError
} from "../errors/DependencyPurlExtractorNotSet.error";

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

export interface ExtractedComponent {
  purl: string;
  requirement?: string;
  scope?: string;
}


//TODO: Remove and use the old LocalDependencyParser
export interface DependencyPURLExtractor {
  run(fileContent: Buffer): Promise<ExtractedComponent[]>;
}

/**
 * DependencyModule encapsulates all dependency-related operations in the SCANOSS SDK.
 * It provides methods for both local dependency parsing and remote API interactions.
 */
export class DependencyModule {
  private purlExtractor: DependencyPURLExtractor;
  private api: DependencyApi;
  private files: string[] = [];
  private folders: string[];

  private components: ExtractedComponent[] = [];
  private extractedDeps: ExtractedComponent[] = [];

  constructor({transport, purlExtractor}:{transport?: Transport, purlExtractor?: DependencyPURLExtractor}) {
    this.purlExtractor = purlExtractor;
    this.api = new DependencyApi(transport);
  }

  addFile(filePath: string): this {
    this.files.push(filePath);
    return this;
  }

  addFiles(filePaths: string[]): this {
    this.files.push(...filePaths);
    return this;
  }

  addComponent(component: ExtractedComponent): this {
    this.components.push(component);
    return this;
  }

  addFolder(folderPath: string) {
    this.folders.push(folderPath);

  }

  addFolders(folderPaths: string[]) {
    this.folders.push(...folderPaths);
  }

  addComponents(components: ExtractedComponent[]): this {
    this.components.push(...components);
    return this;
  }

  /**
   * Extracts components from files.
   *
   * @async
   * @function extract
   * @throws {DependencyPurlExtractorNotSetError} If the purlExtractor is not set.
   * @returns {Promise<ExtractedComponent[]>} A promise that resolves to an array of extracted components.
   *
   * @description
   * This function extracts components from the files specified in this.files.
   * It uses the purlExtractor to run on the content of each file and accumulates
   * the results in this.extractedDeps.
   */
  async extract(): Promise<ExtractedComponent[]> {
    if (this.purlExtractor == null) {
      throw new DependencyPurlExtractorNotSetError();
    }

    this.extractedDeps = [...this.components];
    for (const file of this.files) {
      const content = await fs.promises.readFile(file);
      const fileDeps = await this.purlExtractor.run(content);
      this.extractedDeps.push(...fileDeps);
    }
    return this.extractedDeps;
  }

  /**
   * Decorates a list of dependencies with additional information.
   *
   * @async
   * @function decorate
   * @param {ExtractedComponent[]} [dependencyList] - Optional list of dependencies to decorate.
   *                                                  If not provided, uses this.extractedDeps.
   * @throws {Error} If the API call fails or returns an unexpected status.
   * @returns {Promise<DecoratedDependency[]>} A promise that resolves to an array of decorated dependencies.
   *
   * @description
   * This function sends a request to the API to get additional information about the dependencies.
   * If no dependencyList is provided and this.extractedDeps is empty, it calls extract() first.
   * The function uses a dummy filename in the API request as it's not using actual files.
   */
  async decorate(dependencyList?: Array<ExtractedComponent>): Promise<Array<DecoratedDependency>> {
    //TODO: Add api/transport validation here

    if (!dependencyList) {
      if (this.extractedDeps.length === 0) {
        await this.extract();
      }
      dependencyList = this.extractedDeps;
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

  /**
   * Extracts components from files and then decorates them with additional information.
   *
   * @async
   * @function extractAndDecorate
   * @returns {Promise<DecoratedDependency[]>} A promise that resolves to an array of decorated dependencies.
   *
   * @description
   * This function is a convenience method that calls extract() followed by decorate().
   * It first extracts components from the files and then decorates them with additional information from the API.
   */
  async extractAndDecorate(): Promise<Array<DecoratedDependency>> {
    await this.extract();
    return this.decorate();
  }

  reset(): this {
    this.files = [];
    this.components = [];
    this.extractedDeps = [];
    return this;
  }
}
