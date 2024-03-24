import path from 'path';
import { PackageURL } from 'packageurl-js';
const MANIFEST_FILE = 'build.gradle';
const depBlockRex = /dependencies\s*{\s*(?<dependencies>(.|\n)*?)}/gm;
var GRADLE_STATES;
(function (GRADLE_STATES) {
    GRADLE_STATES[GRADLE_STATES["WALKING"] = 0] = "WALKING";
    GRADLE_STATES[GRADLE_STATES["SINGLELINE_DEPENDENCY"] = 1] = "SINGLELINE_DEPENDENCY";
    GRADLE_STATES[GRADLE_STATES["MULTILINE_DEPENDENCY"] = 2] = "MULTILINE_DEPENDENCY";
})(GRADLE_STATES || (GRADLE_STATES = {}));
export async function buildGradleParser(fileContent, filePath) {
    // If the file is not a manifest file, return an empty results
    const results = { file: filePath, purls: [] };
    if (path.basename(filePath) != MANIFEST_FILE)
        return results;
    //For each dependency block, generate purls
    let gradle;
    while ((gradle = depBlockRex.exec(fileContent)) !== null) {
        let depBlock = gradle?.groups?.dependencies;
        let current_config_name = ""; //Config name is placed in the scope
        let lines = depBlock.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.includes("//"))
                line = line.replace(/\/\/.*$/gm, "");
            line = line.trim();
            if (line == '')
                continue;
            current_config_name = getConfigNameFromLine(line);
            //Multiline dependency
            if (current_config_name && line.includes("(")) {
                while (i < lines.length && !lines[i].includes(")")) {
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
                current_config_name = '';
            }
            else { //Single line dependency
                const componentData = createPurlNameFromLine(line);
                if (componentData == null) {
                    current_config_name = '';
                    continue;
                }
                results.purls.push({ purl: componentData.purlName, requirement: componentData.version, scope: current_config_name });
            }
        }
    }
    return Promise.resolve(results);
}
function getConfigNameFromLine(line) {
    let configName = "";
    const dep = line.split(/\s/);
    if (dep.length)
        configName = dep[0].replace("(", "").trim();
    return configName;
}
function createPurlNameFromLine(line) {
    let namespace = undefined;
    let name = undefined;
    let version = undefined;
    //Enters when line = implementation 'org.scala-lang:scala-library:2.11.12'
    let dep = line.match(/(?<namespace>[\w\.\-]+):(?<name>[\w\.\-]+):(?<version>[\d\.]+)/);
    if (dep?.length) {
        namespace = dep.groups.namespace;
        name = dep.groups.name;
        version = dep.groups.version;
    }
    else if (line.includes("group") && line.includes("name") && line.includes("version")) {
        version = line.match(/version:\s+['"](?<version>[\w\.\-\d]+)['"]/).groups.version;
        name = line.match(/name:\s+['"](?<name>[\w\.\-\d]+)['"]/).groups?.name;
        namespace = line.match(/group:\s+['"](?<group>[\w\.\-\d]+)['"]/).groups?.group;
    }
    let purlName = "";
    if (name && namespace) {
        const purlObj = new PackageURL('maven', namespace, name, undefined, undefined, undefined);
        return { purlName: purlObj.toString(), version };
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRHcmFkbGVQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2RrL0RlcGVuZGVuY2llcy9Mb2NhbERlcGVuZGVuY3kvcGFyc2Vycy9idWlsZEdyYWRsZVBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUM7QUFDckMsTUFBTSxXQUFXLEdBQUcsaURBQWlELENBQUM7QUFFdEUsSUFBSyxhQUlKO0FBSkQsV0FBSyxhQUFhO0lBQ2hCLHVEQUFPLENBQUE7SUFDUCxtRkFBcUIsQ0FBQTtJQUNyQixpRkFBb0IsQ0FBQTtBQUN0QixDQUFDLEVBSkksYUFBYSxLQUFiLGFBQWEsUUFJakI7QUFDRCxNQUFNLENBQUMsS0FBSyxVQUFVLGlCQUFpQixDQUFDLFdBQW1CLEVBQUUsUUFBZ0I7SUFHM0UsOERBQThEO0lBQzlELE1BQU0sT0FBTyxHQUFxQixFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBQyxDQUFDO0lBQzlELElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxhQUFhO1FBQ3pDLE9BQU8sT0FBTyxDQUFDO0lBRWpCLDJDQUEyQztJQUMzQyxJQUFJLE1BQU0sQ0FBQztJQUNYLE9BQU8sQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUN4RCxJQUFJLFFBQVEsR0FBRyxNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQztRQUc1QyxJQUFJLG1CQUFtQixHQUFHLEVBQUUsQ0FBQyxDQUFHLG9DQUFvQztRQUNwRSxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBVyxD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