/**
 * Syft WASM Module
 *
 * Provides PURL generation using Syft's catalogers compiled to WebAssembly
 */

export { SyftWasmParser } from './SyftWasmParser';
export { loadSyftWasm, isSyftWasmAvailable } from './loader';
export * from './types';
