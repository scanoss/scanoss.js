import { ILocalDependency } from '../DependencyTypes';
import xml from 'xml-js'

//TODO: Implement .nuspec parser
export function nuspecParser(fileContent: string, filePath: string): Promise<ILocalDependency> {
  return Promise.resolve({file: null, purls: null})
}


//TODO: Implement .cproj parser
export function cprojParser(fileContent: string, filePath: string): Promise<ILocalDependency> {
  const json_nuspec = xml.xml2js(fileContent,  {compact: true});
  return Promise.resolve({file: null, purls: null})
}
