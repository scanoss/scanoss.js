import path from "path";
import { PackageURL } from "packageurl-js";
import { ILocalDependency } from "../DependencyTypes";

const PURL_TYPE = 'npm';


// Parse a package.json file from node projects
// See reference on: https://docs.npmjs.com/cli/v8/configuring-npm/package-json
const MANIFEST_FILE = 'package.json';
export function packageParser(fileContent: string, filePath: string): ILocalDependency {
    // If the file is not manifest file, return an empty results
    const results: ILocalDependency = {file: filePath, purls: []};
    if(path.basename(filePath) != MANIFEST_FILE)
        return results;
    const o = JSON.parse(fileContent);
    let devDeps = Object.keys(o.devDependencies || {});
    let deps = Object.keys(o.dependencies || {});
    let listDeps = [...deps, ...devDeps];

    for(const name of deps){
        const purlString = new PackageURL(PURL_TYPE, undefined, name, undefined, undefined, undefined).toString();
        results.purls.push({purl: purlString, scope: "dependencies", requirement: o.dependencies[name]});
    }

    for(const name of devDeps){
      const purlString = new PackageURL(PURL_TYPE, undefined, name, undefined, undefined, undefined).toString();
      results.purls.push({purl: purlString, scope: "devDependencies", requirement: o.devDependencies[name]});
    }

    return results;
}


// Parse a package-lock.json file from node projects
// See reference on: https://docs.npmjs.com/cli/v8/configuring-npm/package-json
const MANIFEST_FILE_1 = 'package-lock.json';
export function packagelockParser(fileContent: string, filePath: string): ILocalDependency {

    const results: ILocalDependency = {file: filePath, purls: []};
    if(path.basename(filePath) != MANIFEST_FILE_1)
        return results;

    const o = JSON.parse(fileContent).dependencies;
    for (const [key, value] of Object.entries(o)) {
        if(!key) continue;
        let purl = new PackageURL(PURL_TYPE, undefined, key,value['version'], undefined, undefined).toString();
        results.purls.push({purl});
    }
    return results;
}
