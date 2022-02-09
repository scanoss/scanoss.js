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
  

/*
    EXAMPLE
{
  "files": [
    {
      "file": "./test/data/requirements.txt",
      "purls": [
        {
          "purl": "pkg:pypi/requests"
        },
        {
          "purl": "pkg:pypi/crc32c@2.2"
        },
        {
          "purl": "pkg:pypi/binaryornot"
        },
        {
          "purl": "pkg:pypi/progress"
        },
        {
          "purl": "pkg:pypi/grpcio"
        },
        {
          "purl": "pkg:pypi/protobuf"
        }
      ]
    }
  ]
}
*/