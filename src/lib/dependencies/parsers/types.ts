export interface Purl {
    purl: string;
}

export interface FileDependency {
  file: string;
  purls: Array<Purl>;
}

export interface FileListDependency {
  files: Array<FileDependency>;
}

type ParserFuncType = (fileContent: string, filePath: string) => FileDependency;

export interface ParserDefinitions {
    [key: string]: ParserFuncType;
}

