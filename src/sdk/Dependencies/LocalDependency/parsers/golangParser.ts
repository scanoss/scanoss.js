import { ILocalDependency } from "../DependencyTypes";

import { PackageURL } from "packageurl-js";
import path from "path";

function parseDepLink (str: string) {
  const res = /.*?(?<ns_name>[^\s]+)\s+(?<version>(.*))/.exec(str);
  return {
    ns_name: res?.groups?.ns_name,
    version: res?.groups?.version
  };
}

function getDepDataGoModFromLine(line: string) {
  const {ns_name, version} = parseDepLink(line);

  const index = ns_name.lastIndexOf('/');
  const namespace = ns_name.substring(0, index);
  const name = ns_name.substring(index + 1);

  return {namespace, name, version}
}

// Removes comments and spaces
function preprocessLine(line: string) {
    if (line.includes("//"))
      line = line.substring(0,line.indexOf("//"));
    return line.trim();
}




const PURL_TYPE = 'golang';


// See reference on: https://go.dev/ref/mod#go-mod-file
const MANIFEST_FILE = 'go.mod';
export function goModParser(fileContent: string, filePath: string): Promise<ILocalDependency> {

  // If the file is not a go.mod manifest file, return an empty results
  const results: ILocalDependency = {file: filePath, purls: []};
  if(path.basename(filePath) != MANIFEST_FILE)
      return Promise.resolve(results);

  const lines =	fileContent.split('\n');

	const require = [];

  for (let num = 0 ; num < lines.length ; num+=1) {

    let line = preprocessLine(lines[num]);


    if(line.includes('require') && line.includes('(')) {
      num+=1;
      line = preprocessLine(lines[num]);
      while (num < lines.length && line!==')') {

        const {namespace, name, version} = getDepDataGoModFromLine(line)

        const purlString = new PackageURL(PURL_TYPE, namespace, name, version, undefined, undefined).toString();
        results.purls.push({purl: purlString});

        require.push(line);

        num+=1;
        line = preprocessLine(lines[num]);
      }
    }
  }

  return Promise.resolve(results);
}





function parseGoSumDepLink (str: string) {
  const res = /.*?(?<ns_name>[^\s]+)\s+(?<version>(.*))\s+h1:(?<checksum>(.*))/.exec(str);
  return {
    ns_name: res?.groups?.ns_name,
    version: res?.groups?.version,
    checksum: res?.groups?.checksum
  };
}

function getDepDataGoSumFromLine(line: string) {
  const {ns_name, version} = parseGoSumDepLink(line);

  if (!ns_name) return {};

  const index = ns_name.lastIndexOf('/');
  const namespace = ns_name.substring(0, index);
  const name = ns_name.substring(index + 1);

  return {namespace, name, version}
}

// See reference on: https://go.dev/ref/mod#go-mod-file
export function goSumParser(fileContent: string, filePath: string): Promise<ILocalDependency> {

  // If the file is not a go.mod manifest file, return an empty results
  const results: ILocalDependency = { file: filePath, purls: [] };
  if (path.basename(filePath) != 'go.sum')
    return Promise.resolve(results);


  const lines = fileContent.split('\n');
  for (let num = 0; num < lines.length; num += 1) {

    let line = preprocessLine(lines[num]);  //Deletes coments
    if(!line) continue

    line = line.replace('/go.mod', '')
    const {namespace, name, version} = getDepDataGoSumFromLine(line)

    if (!name) continue

    //const purlString = new PackageURL(PURL_TYPE, namespace, name, undefined, undefined, undefined).toString();
    const purlString = `pkg:${PURL_TYPE}/${namespace}/${name}`
    results.purls.push({purl: purlString, requirement: version})
  }

  return Promise.resolve(results);


}

