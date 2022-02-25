export interface ILocalPurl {
  purl: string;
  requirements?: string;
}

export interface ILocalFile {
  file: string;
  purls: Array<ILocalPurl>;
}

export interface ILocalDependencies{
  files: Array<ILocalFile>;
}


/* Parser funcion definition */
type ParserFuncType = (fileContent: string, filePath: string) => ILocalFile;

export interface ParserDefinitions {
  [key: string]: ParserFuncType;
}

