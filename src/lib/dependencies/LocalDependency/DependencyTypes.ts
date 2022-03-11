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

/* Parser funcion definition */
export type ParserFuncType = (fileContent: string, filePath: string) => ILocalDependency;

export interface ParserDefinitions {
  [key: string]: ParserFuncType;
}
