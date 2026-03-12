export interface ILocalPurl {
  purl: string;
  requirement?: string;
  scope?: string;
}

export interface ILocalDependency {
  file: string;
  purls: Array<ILocalPurl>;
}

export interface ILocalDependencies{
  files: Array<ILocalDependency>;
}

/**
 * @param fileContent - Raw file content
 * @param filePath - Absolute path to the file being parsed
 * @param basePath - Scan root directory. Limits upward directory searches (e.g., finding gradle/libs.versions.toml).
 *                   When omitted, parsers that walk the directory tree will search up to the filesystem root.
 */
export type ParserFuncType = (fileContent: string, filePath: string, basePath?: string) => Promise<ILocalDependency>;

export interface ParserDefinitions {
  [key: string]: ParserFuncType;
}
