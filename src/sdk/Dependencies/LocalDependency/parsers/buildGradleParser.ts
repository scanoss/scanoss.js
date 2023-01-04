import { ILocalDependency } from '../DependencyTypes';
import path from 'path';

var g2js = require('gradle-to-js/lib/parser');

const MANIFEST_FILE = 'build.gradle';
export async function buildGradleParser(fileContent: string, filePath: string): Promise<ILocalDependency> {


  // If the file is not a manifest file, return an empty results
  const results: ILocalDependency = {file: filePath, purls: []};
  if(path.basename(filePath) != MANIFEST_FILE)
    return results;

  const gradle = await g2js.parseText(fileContent);
  console.log(JSON.stringify(gradle, undefined, 2));

  gradle.dependencies

  return results;

}

