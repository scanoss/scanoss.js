import fs from 'fs';
import path from 'path';
import { FileListDependency, ParserDefinitions } from './parsers/types';


import { pomParser } from './parsers/mavenParser';
import { packagelockParser, packageParser } from './parsers/npmParser';
import { requirementsParser } from './parsers/pyParser';
import { gemfilelockParser, gemfileParser } from './parsers/rubyParser';



/*
 This is a hash map that connect a filename with it's own parser function
 Any parser function must return a FileDependency object (See type.ts file in src/parser
*/
const Parser: ParserDefinitions = {
    'requirements.txt': requirementsParser,
    'pom.xml': pomParser,
    'package.json': packageParser,
    'package-lock.json': packagelockParser,
    'Gemfile': gemfileParser,
    'Gemfile.lock': gemfilelockParser
};


export async function generateDependenciesPurls(files: Array<string>): Promise<FileListDependency> {
    let results: FileListDependency = {files: []};
    for (const filePath of files) {
        const fileName = path.basename(filePath);
        if(Parser[fileName] != null) {
          try {
            const fileContent = await fs.promises.readFile(filePath, 'utf8');
            const dependency = Parser[fileName](fileContent, filePath);
            if(dependency.purls.length != 0)
                results.files.push(dependency);
          } catch (error) {
            console.error(`Error parsing file: ${filePath}\n`,error);
          }
        }
    }
    return results;
}

