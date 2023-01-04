import path from 'path';
import fs from 'fs';
import { ParserFuncType, ILocalDependencies } from "./DependencyTypes";
import { requirementsParser } from "./parsers/pyParser";
import { pomParser } from "./parsers/mavenParser";
import {
  packagelockParser,
  packageParser,
  yarnLockParser
} from './parsers/npmParser';
import { gemfilelockParser, gemfileParser } from "./parsers/rubyParser";
import { goModParser, goSumParser } from './parsers/golangParser';
import { buildGradleParser } from './parsers/buildGradleParser';

export class LocalDependencies {

  private parserMap: Record<string, ParserFuncType>;

  constructor() {
      /*
      This is a hash map that connect a filename with it's own parser function
      Any parser function must return a ILocalDependencies object (See DependencyTypes.ts)
      */
      this.parserMap = {
        'requirements.txt': requirementsParser,
        'pom.xml': pomParser,
        'package.json': packageParser,
        'package-lock.json': packagelockParser,
        'Gemfile': gemfileParser,
        'Gemfile.lock': gemfilelockParser,
        'go.mod': goModParser,
        'go.sum': goSumParser,
        'yarn.lock': yarnLockParser,
        'build.gradle': buildGradleParser,
      };
  }

  public async search(files: Array<string>): Promise<ILocalDependencies> {
    let results: ILocalDependencies = {files: []};
    for (const filePath of files) {
        const fileName = path.basename(filePath);
        if(this.parserMap[fileName] != null) {
          try{
            const fileContent = await fs.promises.readFile(filePath, 'utf8');
            const dependency = await this.parserMap[fileName](fileContent, filePath);
            if(dependency.purls.length != 0)
                results.files.push(dependency);
          } catch(e) {
            console.error(e);
            continue;
          }
        }
    }
    return results;
  }
}
