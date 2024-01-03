import path from 'path';
import fs from 'fs';
import { ParserFuncType, ILocalDependencies } from './DependencyTypes';
import { requirementsParser } from './parsers/pyParser';
import { pomParser } from './parsers/mavenParser';
import {
  packagelockParser,
  packageParser,
  yarnLockParser,
} from './parsers/npmParser';
import { gemfilelockParser, gemfileParser } from './parsers/rubyParser';
import { goModParser, goSumParser } from './parsers/golangParser';
import { csprojParser, packagesConfigParser } from './parsers/nugetParser';
import { buildGradleParser } from './parsers/buildGradleParser';
import pyprojectToml from './parsers/python/PyProjectToml';

export class LocalDependencies {
  private parserMap: Record<string, ParserFuncType>;
  private listFilePattern: Array<string>;

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
      Gemfile: gemfileParser,
      'Gemfile.lock': gemfilelockParser,
      'go.mod': goModParser,
      'go.sum': goSumParser,
      'yarn.lock': yarnLockParser,
      '*.csproj': csprojParser,
      'packages.config': packagesConfigParser,
      'build.gradle': buildGradleParser,
      'pyproject.toml': pyprojectToml,
    };

    this.listFilePattern = Object.keys(this.parserMap).filter((item) =>
      item.includes('*')
    );
  }

  public filterFiles(files: Array<string>): Array<string> {
    return files.filter((filepath) => this.getParserFunc(filepath));
  }

  public async search(files: Array<string>): Promise<ILocalDependencies> {
    let results: ILocalDependencies = { files: [] };
    for (const filePath of files) {
      const parser: ParserFuncType = this.getParserFunc(filePath);
      if (parser != null) {
        try {
          const fileContent = await fs.promises.readFile(filePath, 'utf8');
          const dependency = await parser(fileContent, filePath);
          if (dependency.purls.length != 0) results.files.push(dependency);
        } catch (e) {
          console.error(e);
          continue;
        }
      }
    }
    return results;
  }

  // https://www.codeproject.com/Articles/5163931/Fast-String-Matching-with-Wildcards-Globs-and-Giti
  public stringMatchWithWildcard(text: string, pattern: string): boolean {
    let iText = 0;
    let iPattern = 0;

    let iTextBackup = null;
    let iPatternBackup = null;

    while (text[iText]) {
      if (pattern[iPattern] == '*') {
        // new star-loop: backup positions in pattern and text
        iTextBackup = iText;
        iPatternBackup = ++iPattern;
      } else if (text[iText] == pattern[iPattern]) {
        iText++;
        iPattern++;
      } else {
        //If there are no star, we fail to match
        if (iPatternBackup == null) return false;
        iText = ++iTextBackup;
        iPattern = iPatternBackup;
      }
    }

    //Ignore trailling stars
    while (pattern[iPattern] == '*') iPatternBackup++;

    //There is a match when the pattern was walked all the way throught
    return iPattern >= pattern.length ? true : false;
  }

  // The logic for the string wildcard match algorithm was an imitation from here:

  private getParserFunc(filePath: string): ParserFuncType {
    const fileName = path.basename(filePath);
    //Check for an exact match
    const func = this.parserMap[fileName];
    if (func) return func;

    //Check for a wildcard string match
    for (const pattern of this.listFilePattern)
      if (this.stringMatchWithWildcard(fileName, pattern))
        return this.parserMap[pattern];

    return null;
  }
}
