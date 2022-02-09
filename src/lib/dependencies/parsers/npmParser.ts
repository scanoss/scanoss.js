import path from "path";
import { PackageURL } from "packageurl-js";
import { FileDependency } from "./types";
import { isValidPath, isValidUrl } from './utils';

const PURL_TYPE = 'npm';


// Parse a package.json file from node projects
// See reference on: https://docs.npmjs.com/cli/v8/configuring-npm/package-json
const MANIFEST_FILE = 'package.json';
export function packageParser(fileContent: string, filePath: string): FileDependency {
    // If the file is not manifest file, return an empty results
    const results: FileDependency = {file: filePath, purls: []};
    if(path.basename(filePath) != MANIFEST_FILE)
        return results;
    const o = JSON.parse(fileContent);
    let devDeps = Object.keys(o.devDependencies || {});
    let deps = Object.keys(o.dependencies || {});
    let listDeps = [...deps, ...devDeps];
    for(const name of listDeps){
        const purlString = new PackageURL(PURL_TYPE, undefined, name, undefined, undefined, undefined).toString();
        results.purls.push({purl: purlString});
    }
    return results;
}


// Parse a package-lock.json file from node projects
// See reference on: https://docs.npmjs.com/cli/v8/configuring-npm/package-json
const MANIFEST_FILE_1 = 'package-loc.json';
export function packagelockParser(fileContent: string, filePath: string): FileDependency {

    const results: FileDependency = {file: filePath, purls: []};
    if(path.basename(filePath) != MANIFEST_FILE_1)
        return results;

    const o = JSON.parse(fileContent).dependencies;
    for (const [key, value] of Object.entries(o)) {
        if(!key) continue;
        let purl = new PackageURL(PURL_TYPE, undefined, key,value['version'], undefined, undefined).toString();
        results.purls.push({purl});
    }
}
