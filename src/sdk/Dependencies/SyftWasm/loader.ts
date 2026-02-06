import * as path from 'path';
import * as fs from 'fs';
import { SyftWasmInstance } from './types';

let wasmInstance: SyftWasmInstance | null = null;
let loadPromise: Promise<SyftWasmInstance> | null = null;

/**
 * Loads the Syft WASM module
 * This function is lazy and caches the instance
 */
export async function loadSyftWasm(): Promise<SyftWasmInstance> {
  // Return cached instance
  if (wasmInstance) {
    return wasmInstance;
  }

  // Return existing load promise if loading
  if (loadPromise) {
    return loadPromise;
  }

  // Start loading
  loadPromise = (async () => {
    try {
      // Load wasm_exec.js runtime
      const wasmExecPath = path.join(__dirname, 'assets', 'wasm_exec.js');
      if (!fs.existsSync(wasmExecPath)) {
        throw new Error(
          `wasm_exec.js not found at ${wasmExecPath}. Run 'npm run build:wasm' first.`
        );
      }

      // Load the Go WASM runtime
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require(wasmExecPath);

      // Load WASM binary
      const wasmPath = path.join(__dirname, 'assets', 'syft.wasm');
      if (!fs.existsSync(wasmPath)) {
        throw new Error(
          `syft.wasm not found at ${wasmPath}. Run 'npm run build:wasm' first.`
        );
      }

      const wasmBuffer = fs.readFileSync(wasmPath);

      // Initialize Go runtime
      const go = new (global as any).Go();
      const result = await WebAssembly.instantiate(wasmBuffer, go.importObject);

      // Run the Go program
      go.run(result.instance);

      // Wait a bit for Go to initialize
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify functions are registered
      if (
        typeof (global as any).syftGetVersion !== 'function' ||
        typeof (global as any).syftParseFile !== 'function' ||
        typeof (global as any).syftParseFiles !== 'function'
      ) {
        throw new Error('WASM functions not properly registered');
      }

      // Create instance wrapper
      wasmInstance = {
        syftGetVersion: () => (global as any).syftGetVersion(),
        syftParseFile: (path: string, content: string, type?: string) =>
          (global as any).syftParseFile(path, content, type),
        syftParseFiles: (files: any[]) => (global as any).syftParseFiles(files),
      };

      return wasmInstance;
    } catch (error) {
      loadPromise = null; // Reset on error
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Check if WASM is available
 */
export function isSyftWasmAvailable(): boolean {
  const wasmPath = path.join(__dirname, 'assets', 'syft.wasm');
  return fs.existsSync(wasmPath);
}
