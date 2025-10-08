/**
 * TypeScript types for Syft WASM interface
 */

export interface SyftFileInput {
  path: string;
  content: string;
  type?: string;
}

export interface SyftPackageInfo {
  name: string;
  version: string;
  type: string;
  purl: string;
  language?: string;
  licenses?: string[];
}

export interface SyftParseResult {
  packages: SyftPackageInfo[];
  purls: string[];
  error?: string;
}

export interface SyftWasmInstance {
  syftGetVersion(): string;
  syftParseFile(path: string, content: string, type?: string): Promise<SyftParseResult>;
  syftParseFiles(files: SyftFileInput[]): Promise<SyftParseResult>;
}
