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

function parseRequirementsContent(fileContent: string, filePath: string): ILocalDependency {
    const results: ILocalDependency = {file: filePath, purls: []};
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
            else if(line.startsWith('-')) {continue;} // Skip pip options (e.g. --hash, -i, -e, etc.)
            else {

                const dep = parseDep(line);
                if (!dep.sym) {
                  const purlString = new PackageURL(PURL_TYPE, undefined, dep.name, undefined, undefined, undefined).toString();
                  results.purls.push({purl: purlString});
                } else if (dep.sym === '==') {
                  const purlString = new PackageURL(PURL_TYPE, undefined, dep.name, dep.version, undefined, undefined).toString();
                  results.purls.push({purl: purlString});
                } else {
                  const purlString = new PackageURL(PURL_TYPE, undefined, dep.name, undefined, undefined, undefined).toString();
                  results.purls.push({purl: purlString, requirement: dep.sym+dep.version});
                }
            }
        }
    }
  return results;
}

// Parse a requirements.txt file from python projects
// See reference on: https://pip.pypa.io/en/stable/reference/requirements-file-format/
const MANIFEST_FILE = 'requirements.txt';
export function requirementsParser(fileContent: string, filePath: string): Promise<ILocalDependency> {

    // If the file is not a python manifest file, return an empty results
    const results: ILocalDependency = {file: filePath, purls: []};
    if(path.basename(filePath) != MANIFEST_FILE)
        return Promise.resolve(results);

    return Promise.resolve(parseRequirementsContent(fileContent, filePath));
}

// Parse a pip_requirements_lock.txt file (pip-compile / pip-tools lock file)
// Same format as requirements.txt but typically with pinned versions (==)
const LOCK_MANIFEST_FILE = 'pip_requirements_lock.txt';
export function pipRequirementsLockParser(fileContent: string, filePath: string): Promise<ILocalDependency> {

    const results: ILocalDependency = {file: filePath, purls: []};
    if(path.basename(filePath) != LOCK_MANIFEST_FILE)
        return Promise.resolve(results);

    return Promise.resolve(parseRequirementsContent(fileContent, filePath));
}

// Parse scoped requirements files like dev-requirements.txt or requirements-dev.txt
// Extracts scope from the filename prefix/suffix
const SCOPED_REQ_PREFIX = /^(.+)-requirements\.txt$/;
const SCOPED_REQ_SUFFIX = /^requirements-(.+)\.txt$/;
export function scopedRequirementsParser(fileContent: string, filePath: string): Promise<ILocalDependency> {
    const fileName = path.basename(filePath);
    const prefixMatch = SCOPED_REQ_PREFIX.exec(fileName);
    const suffixMatch = SCOPED_REQ_SUFFIX.exec(fileName);
    const scope = prefixMatch?.[1] ?? suffixMatch?.[1];

    const results: ILocalDependency = {file: filePath, purls: []};
    if (!scope) return Promise.resolve(results);

    const parsed = parseRequirementsContent(fileContent, filePath);
    for (const purl of parsed.purls) {
        purl.scope = scope;
    }
    return Promise.resolve(parsed);
}
