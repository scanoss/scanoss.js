import path from "path";
import { PackageURL } from "packageurl-js";
import { ILocalDependencies, ILocalFile } from "../DependencyTypes";
import { isValidPath, isValidUrl } from './utils';

const PURL_TYPE = 'pypi';

// Parse a requirements.txt file from python projects
// See reference on: https://pip.pypa.io/en/stable/reference/requirements-file-format/
const MANIFEST_FILE = 'requirements.txt';
export function requirementsParser(fileContent: string, filePath: string): ILocalFile {

    // If the file is not a python manifest file, return an empty results
    const results: ILocalFile = {file: filePath, purls: []};
    if(path.basename(filePath) != MANIFEST_FILE)
        return results;


    const lines: Array<string> = fileContent.split('\n');
    let compName: string = '';
    let compVer: string = '';

    for (let line of lines) {
        line = line.trim();
        if (!line.startsWith('#') && line.length>0) { // Avoid comments and new lines
            if(isValidUrl(line)) {
                // For reference about the regex see https://www.rfc-editor.org/rfc/rfc3986#appendix-B
                const res = line.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
                continue;
            }
            else if(isValidPath(line)) {continue;}
            else if(line.startsWith('-r')) {continue;} // recursive dependencies (NOT SUPPORTED YET)
            else {
                // Line contains a package name and/or version.
                const res = line.match(/^([-\w]+)\s*(?:[>=~!]*)\s*([\d\.]*)/);    //Extract name and version
                if (res) {
                    compName = res.length > 1 ? res[1] : ' ';
                    compVer = undefined;
                }
            }
            const purlString = new PackageURL(PURL_TYPE, undefined, compName, compVer, undefined, undefined).toString();
            results.purls.push({purl: purlString});
        }
    }
    return results;
}
