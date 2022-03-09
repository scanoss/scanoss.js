import path from "path";
import { PackageURL } from "packageurl-js";
import { ILocalDependency } from "../DependencyTypes";
import { isValidPath, isValidUrl } from './utils';


function parseDep (str: string) {
  const res = /^(?<name>[-\w]+)\s*(?<sym>[>=~!]*)\s*(?<version>[\d\.]*)/.exec(str);
  return {
    name: res?.groups?.name,
    sym: res?.groups?.sym,
    version: res?.groups?.version,
  };
}

const PURL_TYPE = 'pypi';

// Parse a requirements.txt file from python projects
// See reference on: https://pip.pypa.io/en/stable/reference/requirements-file-format/
const MANIFEST_FILE = 'requirements.txt';
export function requirementsParser(fileContent: string, filePath: string): ILocalDependency {

    // If the file is not a python manifest file, return an empty results
    const results: ILocalDependency = {file: filePath, purls: []};
    if(path.basename(filePath) != MANIFEST_FILE)
        return results;

    const lines: Array<string> = fileContent.split('\n');

    for (let line of lines) {
        line = line.trim();
        if(line.length == 0) continue;
        if(!line.startsWith('#') && line.length>0) { // Avoid comments and new lines
            if(isValidUrl(line)) {
                // For reference about the regex see https://www.rfc-editor.org/rfc/rfc3986#appendix-B
                const res = line.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
                continue;
            }
            else if(isValidPath(line)) {continue;} // Do not parse local dependencies.
            else if(line.startsWith('-r')) {continue;} // Recursive dependencies (NOT SUPPORTED YET)
            else {

                const dep = parseDep(line);
                if (dep.sym === '==') {
                  const purlString = new PackageURL(PURL_TYPE, undefined, dep.name, dep.version, undefined, undefined).toString();
                  results.purls.push({purl: purlString});
                } else {
                  const purlString = new PackageURL(PURL_TYPE, undefined, dep.name, undefined, undefined, undefined).toString();
                  results.purls.push({purl: purlString, requirements: dep.sym+dep.version});
                }
            }
        }
    }
    return results;
}
