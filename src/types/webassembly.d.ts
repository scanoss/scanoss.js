/**
 * WebAssembly type definitions for Node.js environment
 * This provides minimal WebAssembly API types without importing DOM types
 */

declare namespace WebAssembly {
  interface Module {}
  interface Instance {
    readonly exports: any;
  }
  interface Memory {
    readonly buffer: ArrayBuffer;
  }
  interface Table {}

  interface ModuleImportDescriptor {
    module: string;
    name: string;
    kind: string;
  }

  interface ModuleExportDescriptor {
    name: string;
    kind: string;
  }

  interface WebAssemblyInstantiatedSource {
    module: Module;
    instance: Instance;
  }

  interface ImportObject {
    [key: string]: any;
  }

  /**
   * Compiles and instantiates a WebAssembly module directly from a streamed underlying source
   */
  function instantiate(
    bytes: BufferSource,
    importObject?: ImportObject
  ): Promise<WebAssemblyInstantiatedSource>;

  function instantiate(
    moduleObject: Module,
    importObject?: ImportObject
  ): Promise<Instance>;

  /**
   * Compiles a WebAssembly module from buffer source
   */
  function compile(bytes: BufferSource): Promise<Module>;

  /**
   * Validates WebAssembly binary code
   */
  function validate(bytes: BufferSource): boolean;
}

type BufferSource = ArrayBufferView | ArrayBuffer;
