import path from 'path';
import fs from 'fs';
import { requirementsParser } from './parsers/pyParser';
import { pomParser } from './parsers/mavenParser';
import { packagelockParser, packageParser, yarnLockParser, } from './parsers/npmParser';
import { gemfilelockParser, gemfileParser } from './parsers/rubyParser';
import { goModParser, goSumParser } from './parsers/golangParser';
import { csprojParser, packagesConfigParser } from './parsers/nugetParser';
import { buildGradleParser } from './parsers/buildGradleParser';
import pyprojectToml from './parsers/python/PyProjectToml';
export class LocalDependencies {
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
        this.listFilePattern = Object.keys(this.parserMap).filter((item) => item.includes('*'));
    }
    filterFiles(files) {
        return files.filter((filepath) => this.getParserFunc(filepath));
    }
    async search(files) {
        let results = { files: [] };
        for (const filePath of files) {
            const parser = this.getParserFunc(filePath);
            if (parser != null) {
                try {
                    const fileContent = await fs.promises.readFile(filePath, 'utf8');
                    const dependency = await parser(fileContent, filePath);
                    if (dependency.purls.length != 0)
                        results.files.push(dependency);
                }
                catch (e) {
                    console.error(e);
                    continue;
                }
            }
        }
        return results;
    }
    // https://www.codeproject.com/Articles/5163931/Fast-String-Matching-with-Wildcards-Globs-and-Giti
    stringMatchWithWildcard(text, pattern) {
        let iText = 0;
        let iPattern = 0;
        let iTextBackup = null;
        let iPatternBackup = null;
        while (text[iText]) {
            if (pattern[iPattern] == '*') {
                // new star-loop: backup positions in pattern and text
                iTextBackup = iText;
                iPatternBackup = ++iPattern;
            }
            else if (text[iText] == pattern[iPattern]) {
                iText++;
                iPattern++;
            }
            else {
                //If there are no star, we fail to match
                if (iPatternBackup == null)
                    return false;
                iText = ++iTextBackup;
                iPattern = iPatternBackup;
            }
        }
        //Ignore trailling stars
        while (pattern[iPattern] == '*')
            iPatternBackup++;
        //There is a match when the pattern was walked all the way throught
        return iPattern >= pattern.length ? true : false;
    }
    // The logic for the string wildcard match algorithm was an imitation from here:
    getParserFunc(filePath) {
        const fileName = path.basename(filePath);
        //Check for an exact match
        const func = this.parserMap[fileName];
        if (func)
            return func;
        //Check for a wildcard string match
        for (const pattern of this.listFilePattern)
            if (this.stringMatchWithWildcard(fileName, pattern))
                return this.parserMap[pattern];
        return null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9jYWxEZXBlbmRlbmN5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Nkay9EZXBlbmRlbmNpZXMvTG9jYWxEZXBlbmRlbmN5L0xvY2FsRGVwZW5kZW5jeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBRXBCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQ0wsaUJBQWlCLEVBQ2pCLGFBQWEsRUFDYixjQUFjLEdBQ2YsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDeEUsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDM0UsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDaEUsT0FBTyxhQUFhLE1BQU0sZ0NBQWdDLENBQUM7QUFFM0QsTUFBTSxPQUFPLGlCQUFpQjtJQUk1QjtRQUNFOzs7WUFHSTtRQUNKLElBQUksQ0FBQyxTQUFTLEdBQUc7WUFDZixrQkFBa0IsRUFBRSxrQkFBa0I7WUFDdEMsU0FBUyxFQUFFLFNBQVM7WUFDcEIsY0FBYyxFQUFFLGFBQWE7WUFDN0IsbUJBQW1CLEVBQUUsaUJBQWlCO1lBQ3RDLE9BQU8sRUFBRSxhQUFhO1lBQ3RCLGNBQWMsRUFBRSxpQkFBaUI7WUFDakMsUUFBUSxFQUFFLFdBQVc7WUFDckIsUUFBUSxFQUFFLFdBQVc7WUFDckIsV0FBVyxFQUFFLGNBQWM7WUFDM0IsVUFBVSxFQUFFLFlB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