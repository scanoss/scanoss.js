import { ILocalDependency, ILocalDependencies } from '../LocalDependency/DependencyTypes';
import { loadSyftWasm, isSyftWasmAvailable } from './loader';
import { SyftWasmInstance, SyftParseResult } from './types';

/**
 * Parser that uses Syft WASM to parse dependency files
 * Compatible with LocalDependency interface
 */
export class SyftWasmParser {
  private wasmInstance: SyftWasmInstance | null = null;
  private initialized = false;

  /**
   * Initialize the WASM module
   * Must be called before using the parser
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (!isSyftWasmAvailable()) {
      throw new Error(
        'Syft WASM not available. Run "npm run build:wasm" to build the WASM module.'
      );
    }

    this.wasmInstance = await loadSyftWasm();
    this.initialized = true;
  }

  /**
   * Get the WASM module version
   */
  getVersion(): string {
    if (!this.wasmInstance) {
      throw new Error('WASM not initialized. Call init() first.');
    }
    return this.wasmInstance.syftGetVersion();
  }

  /**
   * Parse a single file (compatible with LocalDependency parsers)
   */
  async parseFile(fileContent: string, filePath: string): Promise<ILocalDependency> {
    if (!this.wasmInstance) {
      throw new Error('WASM not initialized. Call init() first.');
    }

    const result = await this.wasmInstance.syftParseFile(filePath, fileContent);
    return this.convertToLocalDependency(result, filePath);
  }

  /**
   * Parse multiple files
   */
  async parseFiles(files: Array<{ path: string; content: string }>): Promise<ILocalDependencies> {
    if (!this.wasmInstance) {
      throw new Error('WASM not initialized. Call init() first.');
    }

    const result = await this.wasmInstance.syftParseFiles(files);

    // Group by file
    const fileMap = new Map<string, ILocalDependency>();
    for (const pkg of result.packages) {
      // Find which file this package came from (simplified - Syft should provide this)
      for (const file of files) {
        if (!fileMap.has(file.path)) {
          fileMap.set(file.path, {
            file: file.path,
            purls: [],
          });
        }
      }
    }

    // Convert to ILocalDependencies
    return {
      files: Array.from(fileMap.values()).map(dep => ({
        file: dep.file,
        purls: result.purls
          .filter(purl => purl.startsWith('pkg:'))
          .map(purl => ({ purl })),
      })),
    };
  }

  /**
   * Check if a file is supported by Syft
   */
  isSupported(filePath: string): boolean {
    const supportedFiles = [
      'package.json',
      'package-lock.json',
      'requirements.txt',
      'Pipfile.lock',
      'pyproject.toml',
      'setup.py',
      'go.mod',
      'go.sum',
      'pom.xml',
      'Cargo.toml',
      'Cargo.lock',
      'Gemfile',
      'Gemfile.lock',
    ];

    const fileName = filePath.split('/').pop() || '';
    return supportedFiles.includes(fileName);
  }

  /**
   * Convert Syft result to LocalDependency format
   */
  private convertToLocalDependency(
    result: SyftParseResult,
    filePath: string
  ): ILocalDependency {
    if (result.error) {
      return {
        file: filePath,
        purls: [],
      };
    }

    return {
      file: filePath,
      purls: result.purls.map(purl => ({
        purl,
        requirement: undefined,
        scope: undefined,
      })),
    };
  }
}
