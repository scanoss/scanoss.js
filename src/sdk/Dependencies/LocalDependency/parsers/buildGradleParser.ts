import { ILocalDependency } from '../DependencyTypes';
import path from 'path';
import fs from 'fs';
import { PackageURL } from 'packageurl-js';
import { ICatalogEntry, buildCatalogAliasMap } from './gradle/libsVersionsTomlParser';


const MANIFEST_FILES = ['build.gradle', 'build.gradle.kts'];
const catalogCache = new Map<string, Map<string, ICatalogEntry>>();
const depBlockRex = /dependencies\s*{\s*(?<dependencies>(.|\n)*?)}/gm;


function resolveCatalogAlias(line: string, catalogMap: Map<string, ICatalogEntry>): ICatalogEntry | undefined {
  const match = line.match(/\blibs\.([a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)\b/);
  if (match) return catalogMap.get(match[1]);
}

// TODO: Consider limiting the directory walk to the scan root to avoid escaping the project boundary.
// Currently walks up to filesystem root. To use the scan root requires changing ParserFuncType.
function findCatalogMap(gradleFilePath: string): Map<string, ICatalogEntry> {
  let dir = path.dirname(gradleFilePath);
  const root = path.parse(dir).root;

  while (dir !== root) {
    if (catalogCache.has(dir)) return catalogCache.get(dir);

    const tomlPath = path.join(dir, 'gradle', 'libs.versions.toml');
    if (fs.existsSync(tomlPath)) {
      const content = fs.readFileSync(tomlPath, 'utf8');
      const map = buildCatalogAliasMap(content);
      catalogCache.set(dir, map);
      return map;
    }

    dir = path.dirname(dir);
  }
  return new Map();
}

export async function buildGradleParser(fileContent: string, filePath: string): Promise<ILocalDependency> {


  // If the file is not a manifest file, return an empty results
  const results: ILocalDependency = {file: filePath, purls: []};
  if(!MANIFEST_FILES.includes(path.basename(filePath)))
    return results;

  const catalogMap = findCatalogMap(filePath);

  //For each dependency block, generate purls
  depBlockRex.lastIndex = 0;
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

      //Multiline dependency (only if line has '(' but not ')' on the same line)
      if(current_config_name && line.includes("(") && !line.includes(")")) {

        while( i<lines.length && !lines[i].includes(")")) {
          const componentData = createPurlNameFromLine(lines[i]);
          if (componentData != null) {
            results.purls.push({
              purl: componentData.purlName,
              requirement: componentData.version,
              scope: current_config_name
            });
          } else {
            const entry = resolveCatalogAlias(lines[i], catalogMap);
            if (entry) {
              results.purls.push({ purl: entry.purl, requirement: entry.version, scope: current_config_name });
            }
          }
          i++;
        }
        current_config_name='';
      } else {  //Single line dependency
        const componentData = createPurlNameFromLine(line);
        if (componentData == null) {
          // Try resolving via catalog alias
          const entry = resolveCatalogAlias(line, catalogMap);
          if (entry) {
            results.purls.push({ purl: entry.purl, requirement: entry.version, scope: current_config_name });
          }
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

  const dep = line.split(/[\s(]/);
  if (dep.length) configName = dep[0].trim();

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
    version = line.match(/version\s*[:=]\s*['"](?<version>[\w\.\-\d]+)['"]/)?.groups?.version
    name = line.match(/name\s*[:=]\s*['"](?<name>[\w\.\-\d]+)['"]/)?.groups?.name
    namespace = line.match(/group\s*[:=]\s*['"](?<group>[\w\.\-\d]+)['"]/)?.groups?.group
  }

  let purlName = "";
  if(name && namespace) {
    const purlObj = new PackageURL('maven', namespace, name, undefined, undefined, undefined);
    return { purlName: purlObj.toString(), version }
  }

  return null;
}
