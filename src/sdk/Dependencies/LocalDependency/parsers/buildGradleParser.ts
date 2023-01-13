import { ILocalDependency } from '../DependencyTypes';
import path from 'path';
import { PackageURL } from 'packageurl-js';


const MANIFEST_FILE = 'build.gradle';
const depBlockRex = /dependencies\s*{\s*(?<dependencies>(.|\n)*?)}/gm;

enum GRADLE_STATES {
  WALKING,
  SINGLELINE_DEPENDENCY,
  MULTILINE_DEPENDENCY
}
export async function buildGradleParser(fileContent: string, filePath: string): Promise<ILocalDependency> {


  // If the file is not a manifest file, return an empty results
  const results: ILocalDependency = {file: filePath, purls: []};
  if(path.basename(filePath) != MANIFEST_FILE)
    return results;

  //For each dependency block, generate purls
  let gradle;
  while ((gradle = depBlockRex.exec(fileContent)) !== null) {
    let depBlock = gradle?.groups?.dependencies;


    let current_config_name = "";   //Config name is placed in the scope
    let lines = depBlock.split(/\r?\n/) as string;
    for (let i = 0; i<lines.length; i++) {
      let line = lines[i];

      if (line.includes("//")) line = line.replace(/\/\/.*$/gm, "");
      line = line.trim();
      if (line == '') continue;


      current_config_name = getConfigNameFromLine(line);

      //Multiline dependency
      if(current_config_name && line.includes("(")) {

        while( i<lines.length && !lines[i].includes(")")) {
          const componentData = createPurlNameFromLine(lines[i]);
          if (componentData != null) {
            results.purls.push({
              purl: componentData.purlName,
              requirement: componentData.version,
              scope: current_config_name
            });
          }
          i++;
        }
        current_config_name='';
      } else {  //Single line dependency
        const componentData = createPurlNameFromLine(line);
        if (componentData == null) {
          current_config_name = '';
          continue;
        }

        results.purls.push({purl: componentData.purlName, requirement: componentData.version, scope: current_config_name});
      }

    }


  }

  return Promise.resolve(results);

}

function getConfigNameFromLine(line): string {
  let configName = ""

  const dep = line.split(/\s/);
  if (dep.length) configName = dep[0].replace("(", "").trim();

  return configName;
}

//Takes a line and generate a purl when possible.
// There are three ways of declaring dependencies
interface componentData{
  purlName: string;
  version: string;
}

function createPurlNameFromLine(line: string): componentData {

  let namespace = undefined;
  let name = undefined;
  let version = undefined;

  //Enters when line = implementation 'org.scala-lang:scala-library:2.11.12'
  let dep = line.match(/(?<namespace>[\w\.\-]+):(?<name>[\w\.\-]+):(?<version>[\d\.]+)/);
  if (dep?.length) {
    namespace = dep.groups.namespace
    name = dep.groups.name
    version = dep.groups.version
  } else if (line.includes("group") && line.includes("name") && line.includes("version")) {
    version = line.match(/version:\s+['"](?<version>[\w\.\-\d]+)['"]/).groups.version
    name = line.match(/name:\s+['"](?<name>[\w\.\-\d]+)['"]/).groups?.name
    namespace = line.match(/group:\s+['"](?<group>[\w\.\-\d]+)['"]/).groups?.group
  }

  let purlName = "";
  if(name && namespace) {
    const purlObj = new PackageURL('maven', namespace, name, undefined, undefined, undefined);
    return { purlName: purlObj.toString(), version }
  }

  return null;
}
