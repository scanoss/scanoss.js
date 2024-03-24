import path from "path";
import { PackageURL } from "packageurl-js";
const PURL_TYPE = 'gem';
// Parse a gemfile file from ruby
// See reference on: https://bundler.io/gemfile.html
// and https://bundler.io/man/gemfile.5.html
const MANIFEST_FILE = 'Gemfile';
export function gemfileParser(fileContent, filePath) {
    // If the file is not a manifest file, return an empty results
    const results = { file: filePath, purls: [] };
    if (path.basename(filePath) != MANIFEST_FILE)
        return Promise.resolve(results);
    const lines = fileContent.split('\n');
    let compName = '';
    for (let line of lines) {
        line = line.trim();
        if (!line.startsWith('#') && line.length > 0) { // Avoid comments and empty lines
            // Line contains a package name and/or version.
            const res = line.match(/^gem\s*(["']\w+["'])/); //Extract name
            if (res) {
                compName = res.length > 1 ? res[1] : ' ';
                compName = compName.replace(/['"]/g, '');
                const purlString = new PackageURL(PURL_TYPE, undefined, compName, undefined, undefined, undefined).toString();
                results.purls.push({ purl: purlString });
            }
        }
    }
    return Promise.resolve(results);
}
const MANIFEST_FILE_1 = 'Gemfile.lock';
export function gemfilelockParser(fileContent, filePath) {
    // If the file is not a manifest file, return an empty results
    const results = { file: filePath, purls: [] };
    if (path.basename(filePath) != MANIFEST_FILE_1)
        return Promise.resolve(results);
    const gemlockParser = new GemfileLockParser();
    const purls = gemlockParser.getDependencies(fileContent);
    for (const purl of purls) {
        results.purls.push(purl);
    }
    return Promise.resolve(results);
}
// Section headings: these are also used as switches to track a parsing state
const PATH = 'PATH';
const GIT = 'GIT';
const SVN = 'SVN';
const GEM = 'GEM';
const PLATFORMS = 'PLATFORMS';
const DEPENDENCIES = 'DEPENDENCIES';
const SPECS = '  specs:';
// types of Gems, which is really where they are provisioned from
// RubyGems repo, local path or VCS
const GEM_TYPES = [GEM, PATH, GIT, SVN];
const specRegex = /(?<name>[^ \)\(,!:]+)?(?: \((?<version>[^-]*?)(?:-(?<platform>[^!]*))?\))?/;
const firstDepLevelRegex = /^ {4}(?! )/;
/*
    The parsing use a simple state machine, switching states based on sections
    headings. The result is a list of purls
*/
class GemfileLockParser {
    constructor() {
        this.purlList = [];
        // map of a line start string to the next parsing state function
        this.statesMap = {};
        this.statesMap[DEPENDENCIES] = this.parseDependency;
        this.statesMap[PLATFORMS] = this.parsePlatform;
        this.statesMap[GIT] = this.parseOptions;
        this.statesMap[PATH] = this.parseOptions;
        this.statesMap[SVN] = this.parseOptions;
        this.statesMap[GEM] = this.parseOptions;
        this.statesMap[SPECS] = this.parseSpec;
    }
    getDependencies(filecontent) {
        this.resetState();
        let file = filecontent.split('\n');
        for (let line of file) {
            line = line.trimEnd();
            //reset state on empty lines
            if (!line.length) {
                this.resetState();
                continue;
            }
            //switch to new state
            if (line in this.statesMap) {
                if (GEM_TYPES.includes(line))
                    this.current_gem = line;
                this.state = this.statesMap[line];
                continue;
            }
            // process the line
            if (this.state)
                this.state(line);
        }
        return this.purlList;
    }
    resetState() {
        this.current_options = {};
        this.state = null;
    }
    parseOptions(line) {
        const match = line.match(/\s*(\w+):\s*(.*)/);
        const key = match.length >= 1 ? match[1] : null;
        const value = match.length >= 2 ? match[2] : null;
        if (key)
            this.current_options[key] = value;
    }
    parseDependency(line) { }
    parsePlatform(line) { }
    parseSpec(line) {
        if (this.current_gem == GEM) {
            if (firstDepLevelRegex.test(line)) {
                line = line.trimStart();
                const match = line.match(specRegex);
                const purl = new PackageURL(PURL_TYPE, null, match.groups.name, null, null, null).toString();
                this.purlList.push({ purl: purl, requirement: match.groups.version });
            }
            else { // Second level of dependence
            }
        }
        if (this.current_gem == GIT) { }
        // Purl from local dependencies are not generated
        if (this.current_gem == PATH) { }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVieVBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zZGsvRGVwZW5kZW5jaWVzL0xvY2FsRGVwZW5kZW5jeS9wYXJzZXJzL3J1YnlQYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ3hCLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFJM0MsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBR3hCLGlDQUFpQztBQUNqQyxvREFBb0Q7QUFDcEQsNENBQTRDO0FBQzVDLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQztBQUNoQyxNQUFNLFVBQVUsYUFBYSxDQUFDLFdBQW1CLEVBQUUsUUFBZ0I7SUFFL0QsOERBQThEO0lBQzlELE1BQU0sT0FBTyxHQUFxQixFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBQyxDQUFDO0lBQzlELElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxhQUFhO1FBQ3pDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUdsQyxNQUFNLEtBQUssR0FBa0IsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyRCxJQUFJLFFBQVEsR0FBVyxFQUFFLENBQUM7SUFFMUIsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLEVBQUU7UUFDcEIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBRSxFQUFFLGlDQUFpQztZQUMzRSwrQ0FBK0M7WUFDL0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUksY0FBYztZ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