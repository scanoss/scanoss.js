import path from "path";
import { PackageURL } from "packageurl-js";
const PURL_TYPE = 'maven';
// Parse a pom.txt file from maven manifest file
// See reference on: https://maven.apache.org/guides/introduction/introduction-to-the-pom.html
// and https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html
const MANIFEST_FILE = 'pom.xml';
export function pomParser(fileContent, filePath) {
    // If the file is not a python manifest file, return an empty results
    const results = { file: filePath, purls: [] };
    if (path.basename(filePath) != MANIFEST_FILE)
        return Promise.resolve(results);
    const dependencies = fileContent.match(/<dependency>((?:.|\n)*?)<\/dependency>/gm);
    if (dependencies) {
        dependencies.forEach(dependency => {
            // Extract groupId. It's the purl namespace
            const groupId = dependency.match(/<groupId>([^<]*)<\/groupId>/);
            const namespace = (groupId && groupId.length >= 1) ? groupId[1] : null;
            // Extract artifact id. It's the purl name
            const artifactId = dependency.match(/<artifactId>([^<]*)<\/artifactId>/);
            const name = (artifactId && artifactId.length >= 1) ? artifactId[1] : null;
            const versionReg = dependency.match(/<version>([^<]*)<\/version>/);
            let version;
            if (versionReg && versionReg.length >= 1)
                version = resolve_version(versionReg[1], fileContent);
            // Extract scope.
            const scopeRes = dependency.match(/<scope>([^<]*)<\/scope>/);
            const scope = (scopeRes && scopeRes.length >= 1) ? scopeRes[1] : null;
            //Detect and extract purl qualifiers
            const classifierRes = dependency.match(/<classifier>([^<]*)<\/classifier>/);
            const classifier = (classifierRes && classifierRes.length >= 1) ? classifierRes[1] : null;
            const typeRes = dependency.match(/<type>([^<]*)<\/type>/);
            const type = (typeRes && typeRes.length >= 1) ? typeRes[1] : null;
            let purlQualifiers;
            if (type || classifier)
                purlQualifiers = {
                    ...(type && { type }),
                    ...(classifier && { classifier }),
                };
            const purlString = new PackageURL(PURL_TYPE, namespace, name, undefined, purlQualifiers, undefined).toString();
            results.purls.push({ purl: purlString, requirement: version, scope: scope });
        });
    }
    //Remove purls duplicated
    const nonDuplicatedResults = removeDuplicated(results);
    return Promise.resolve(nonDuplicatedResults);
}
function removeDuplicated(results) {
    const map = {};
    for (let res of results.purls) {
        map[res.purl] = res;
    }
    results.purls = Object.values(map);
    return results;
}
function resolve_version(dependency_version, file_content) {
    // See properties: https://maven.apache.org/pom.html#properties
    let version = '';
    if (dependency_version) {
        if (/\${project.version}/.test(dependency_version)) {
            version = extract_content_from_tag(file_content, ['project', 'version']);
        }
        else if (/\${.*?}/.test(dependency_version)) {
            const property = dependency_version.match(/\${(.*?)}/)[1];
            const result = file_content.match(new RegExp(`<${property}>([^<]*)<\/${property}>`));
            if (result && result.length > 0)
                version = result[1];
        }
        else {
            version = dependency_version.toString();
        }
    }
    return version;
}
function get_start_tag_name(line) {
    const result = line.match(/\<([\w\-\.]+).*?>/);
    if (result)
        return result[1].trim();
    return '';
}
function get_end_tag_name(line) {
    const result = line.match(/\<\/([\w\-\.]+) ?>/);
    if (result)
        return result[1].trim();
    return '';
}
function get_end_tag(line) {
    const result = get_end_tag_name(line);
    if (result !== '')
        return `</${result}>`;
    return '';
}
function get_start_tag(line) {
    const result = get_start_tag_name(line);
    if (result !== '')
        return `<${result}>`;
    return '';
}
function element_match(openTag, closeTag) {
    return get_start_tag_name(openTag) === get_end_tag_name(closeTag);
}
function is_element_complete(line) {
    return get_start_tag_name(line) === get_end_tag_name(line);
}
function get_offset_until_end_of_tag(lines, end_tag_name) {
    let i = 0;
    for (const line of lines) {
        if (get_end_tag_name(line) === end_tag_name)
            break;
        i += 1;
    }
    return i;
}
function remove_comments(lines) {
    for (let i = 0; i < lines.length; i += 1) {
        let openCommentFlag = /<!--/.test(lines[i]);
        let endCommentFlag = /-->/.test(lines[i]);
        if (openCommentFlag && endCommentFlag)
            lines[i] = lines[i].replace(/<!--.*-->/, '');
        else if (openCommentFlag) {
            while (!/-->/.test(lines[i]) && i < lines.length) {
                lines[i] = '';
                i += 1;
            }
            lines[i] = lines[i].replace(/.*-->/, '');
        }
    }
    return lines;
}
function extract_content_from_tag(file_content, selector) {
    let lines = file_content.split('\n');
    const stack = [];
    let selectorIndex = 0;
    let startTagName = '';
    let endTagName = '';
    let content = '';
    // Sanitize xml: Removes comments
    lines = remove_comments(lines);
    for (let i = 0; i < lines.length; i += 1) {
        let line = lines[i].trim();
        if (line === '')
            continue;
        startTagName = get_start_tag_name(line);
        endTagName = get_end_tag_name(line);
        // Element complete in the same line and different than my selector
        if (selector[selectorIndex] !== startTagName && is_element_complete(line))
            continue;
        // Element spans multiline and is different than my selector
        // Loop until find corresponding end tag
        if (selector[selectorIndex] !== startTagName) {
            i += 1;
            while (i < lines.length && !element_match(line, lines[i]))
                i += 1;
            continue;
        }
        // lines[i] points to the opening tag of the current selector[selectorIndex]
        selectorIndex += 1;
        stack.push(startTagName);
        // Target reached
        if (selector.length === stack.length) {
            // Target has only one line
            if (is_element_complete(line)) {
                line = line.replace(get_end_tag(line), '');
                line = line.replace(get_start_tag(line), '');
                return line;
            }
            // Extracts everything beetwen opening and closing tag and return.
            i += 1;
            while (i < lines.length && !element_match(line, lines[i])) {
                content += lines[i].trim();
                i += 1;
            }
            return content;
        }
        startTagName = '';
        endTagName = '';
    }
    return '';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF2ZW5QYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2RrL0RlcGVuZGVuY2llcy9Mb2NhbERlcGVuZGVuY3kvcGFyc2Vycy9tYXZlblBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUczQyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUM7QUFFMUIsZ0RBQWdEO0FBQ2hELDhGQUE4RjtBQUM5Riw2RkFBNkY7QUFDN0YsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBQ2hDLE1BQU0sVUFBVSxTQUFTLENBQUMsV0FBbUIsRUFBRSxRQUFnQjtJQUUzRCxxRUFBcUU7SUFDckUsTUFBTSxPQUFPLEdBQXFCLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFDLENBQUM7SUFDOUQsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLGFBQWE7UUFDekMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRWxDLE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztJQUNuRixJQUFHLFlBQVksRUFBRTtRQUVmLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDaEMsMkNBQTJDO1lBQzNDLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUNoRSxNQUFNLFNBQVMsR0FBRyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUVyRSwwQ0FBMEM7WUFDMUMsTUFB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