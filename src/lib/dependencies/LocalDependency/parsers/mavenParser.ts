import path from "path";
import { PackageURL } from "packageurl-js";
import { ILocalDependency } from "../DependencyTypes";

const PURL_TYPE = 'maven';

// Parse a pom.txt file from maven manifest file
// See reference on: https://maven.apache.org/guides/introduction/introduction-to-the-pom.html
// and https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html
const MANIFEST_FILE = 'pom.xml';
export function pomParser(fileContent: string, filePath: string): ILocalDependency {

    // If the file is not a python manifest file, return an empty results
    const results: ILocalDependency = {file: filePath, purls: []};
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
        let version = null;
        if(versionReg && versionReg.length>0) version = resolve_version(versionReg[1], fileContent);


        let purlQualifiers;
        const type = dependency.match(/<type>([^<]*)<\/type>/);
        if(type) {
            purlQualifiers = {};
            purlQualifiers['type'] = type[1]
        }

        // Extract scope.
        const scopeRes = dependency.match(/<scope>([^<]*)<\/scope>/);
        const scope = scopeRes ? scopeRes[1] : null;
        const purlString = new PackageURL(PURL_TYPE, namespace, name, version, purlQualifiers, undefined).toString();
        results.purls.push({purl: purlString, scope});
      });
    }
    return results;
}


function resolve_version(dependency_version: string, file_content: string): string {
  // See properties: https://maven.apache.org/pom.html#properties
  let version = '';
  if(dependency_version) {
    if(/\${project.version}/.test(dependency_version)) {
      version = extract_content_from_tag(file_content, ['project', 'version']);
    } else if(/\${.*?}/.test(dependency_version)) {
      const property = dependency_version.match(/\${(.*?)}/)[1];
      const result = file_content.match(new RegExp(`<${property}>([^<]*)<\/${property}>`));
      if (result && result.length>0) version = result[1];
    } else {
      version = dependency_version.toString();
    }
  }
  return version;
}


function get_start_tag_name(line: string): string {
  const result = line.match(/\<([\w\-\.]+).*?>/);
  if (result) return result[1].trim();
  return '';
}

function get_end_tag_name(line: string): string {
  const result = line.match(/\<\/([\w\-\.]+) ?>/);
  if (result) return result[1].trim();
  return '';
}

function get_end_tag(line: string): string {
  const result = get_end_tag_name(line);
  if (result !== '') return `</${result}>`
  return '';
}

function get_start_tag(line: string): string {
  const result = get_start_tag_name(line);
  if (result !== '') return `<${result}>`
  return '';
}

function element_match(openTag: string, closeTag:string): boolean {
  return get_start_tag_name(openTag) === get_end_tag_name(closeTag);
}

function is_element_complete(line: string) {
  return get_start_tag_name(line) === get_end_tag_name(line);
}


function get_offset_until_end_of_tag(lines: Array<string>, end_tag_name: string) {
  let i = 0;
  for (const line of lines) {
      if ( get_end_tag_name(line) === end_tag_name) break;
      i += 1;
  }
  return i;
}

function remove_comments(lines: Array<string>): Array<string> {
  for (let i=0; i<lines.length; i+=1) {
      let openCommentFlag = /<!--/.test(lines[i]);
      let endCommentFlag = /-->/.test(lines[i]);

      if(openCommentFlag && endCommentFlag)
          lines[i] = lines[i].replace(/<!--.*-->/, '');
      else if (openCommentFlag){
          while(!/-->/.test(lines[i]) && i<lines.length) {
              lines[i] = '';
              i += 1;
          }
          lines[i] = lines[i].replace(/.*-->/, '');
      }

  }
  return lines;
}


function extract_content_from_tag(file_content: string, selector: Array<string>): string {
  let lines = file_content.split('\n');
  const stack: Array<string> = [];

  let selectorIndex = 0;
  let startTagName = '';
  let endTagName = '';
  let content = '';

  // Sanitize xml: Removes comments
  lines = remove_comments(lines);

  for (let i=0; i<lines.length; i+=1) {
    let line = lines[i].trim();
    if(line === '') continue;

    startTagName = get_start_tag_name(line);
    endTagName = get_end_tag_name(line);

    // Element complete in the same line and different than my selector
    if(selector[selectorIndex] !== startTagName && is_element_complete(line)) continue;

    // Element spans multiline and is different than my selector
    // Loop until find corresponding end tag
    if (selector[selectorIndex] !== startTagName) {
       i += 1;
       while (i<lines.length && !element_match(line, lines[i])) i+=1;
       continue;
    }

    // lines[i] points to the opening tag of the current selector[selectorIndex]
    selectorIndex += 1;
    stack.push(startTagName);

    // Target reached
    if(selector.length === stack.length) {
      // Target has only one line
      if (is_element_complete(line)) {
          line = line.replace(get_end_tag(line), '');
          line = line.replace(get_start_tag(line), '');
          return line;
      }

        // Extracts everything beetwen opening and closing tag and return.
        i += 1;
        while (i<lines.length && !element_match(line, lines[i]) ) {
          content += lines[i].trim();
          i += 1;
        }
        return content;
    }
    startTagName='';
    endTagName='';
  }
  return '';
}
