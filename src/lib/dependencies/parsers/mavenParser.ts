import path from "path";
import { PackageURL } from "packageurl-js";
import { FileDependency } from "./types";
import { isValidPath, isValidUrl } from './utils';

const PURL_TYPE = 'maven';


// Parse a pom.txt file from maven manifest file
// See reference on: https://maven.apache.org/guides/introduction/introduction-to-the-pom.html
// and https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html
const MANIFEST_FILE = 'pom.xml';
export function pomParser(fileContent: string, filePath: string): FileDependency {

    // If the file is not a python manifest file, return an empty results
    const results: FileDependency = {file: filePath, purls: []};
    if(path.basename(filePath) != MANIFEST_FILE)
        return results;

    const dependencies = fileContent.match(/<dependency>((?:.|\n)*?)<\/dependency>/gm);
    if(dependencies) {

      // TODO: classifier are not supported yet
      dependencies.forEach(dependency => {
        // Extract groupId. It's the purl namespace
        const groupId = dependency.match(/<groupId>([^<]*)<\/groupId>/);
        const namespace = groupId ? groupId[1] : '';

        // Extract artifact id. It's the purl name
        const artifactId = dependency.match(/<artifactId>([^<]*)<\/artifactId>/);
        const name = artifactId ? artifactId[1] : '';

        const versionReg = dependency.match(/<version>([^<]*)<\/version>/);
        let version = versionReg ? versionReg[1] : '';

        const ver = version.match(/\${(.*?)}/);
        if(ver && ver.length >= 1) {
          if(ver[1] === 'project.version') { // TODO: Add support for project.version
            version = undefined;
          } else {
            const res = fileContent.match(new RegExp(`<${ver[1]}>([^<]*)<\/${ver[1]}>`));
            version = res.length >= 1 ? res[1] : '';
          }
        }

        let purlQualifiers;
        const type = dependency.match(/<type>([^<]*)<\/type>/);
        if(type) {
            purlQualifiers = {};
            purlQualifiers['type'] = type[1]
        }

        const purlString = new PackageURL(PURL_TYPE, namespace, name, version, purlQualifiers, undefined).toString();
        results.purls.push({purl: purlString});
      });
    }
    return results;
}
