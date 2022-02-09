import path from "path";
import { PackageURL } from "packageurl-js";
import { FileDependency } from "./types";
import { isValidPath, isValidUrl } from './utils';
import { stringify } from "querystring";

const PURL_TYPE = 'gem';


// Parse a gemfile file from ruby
// See reference on: https://bundler.io/gemfile.html
// and https://bundler.io/man/gemfile.5.html
const MANIFEST_FILE = 'Gemfile';
export function gemfileParser(fileContent: string, filePath: string): FileDependency {
    
    // If the file is not a manifest file, return an empty results
    const results: FileDependency = {file: filePath, purls: []};
    if(path.basename(filePath) != MANIFEST_FILE)
        return results;


    const lines: Array<string> = fileContent.split('\n');
    let compName: string = '';

    for (let line of lines) {
        line = line.trim();
        if (!line.startsWith('#') && line.length>0) { // Avoid comments and empty lines
            // Line contains a package name and/or version.
            const res = line.match(/^gem\s*(["']\w+["'])/);    //Extract name
            if (res) {
                compName = res.length > 1 ? res[1] : ' ';
                compName = compName.replace(/['"]/g, '');
                const purlString = new PackageURL(PURL_TYPE, undefined, compName, undefined, undefined, undefined).toString();
                results.purls.push({purl: purlString});
            }              
        }
    }
    return results;
}


const MANIFEST_FILE_1 = 'Gemfile.lock';
export function gemfilelockParser(fileContent: string, filePath: string): FileDependency {
    
    // If the file is not a manifest file, return an empty results
    const results: FileDependency = {file: filePath, purls: []};
    if(path.basename(filePath) != MANIFEST_FILE_1)
        return results;

    const gemlockParser = new GemfileLockParser();
    const purls = gemlockParser.getDependencies(fileContent);
    for (const purl of purls) {
        results.purls.push({purl});
    }
    return results;
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

    private statesMap;
    
    private state;  
    
    private current_options: Record<string, string>; 
    
    private current_gem; 
    
    private purlList;

    constructor () {

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

    public getDependencies(filecontent: string) {
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
                this.state=this.statesMap[line];
                continue;
            }

            // process the line
            if (this.state) this.state(line);
        }
        this.refine();
        return this.purlList;
    }

    private resetState() {
        this.current_options = {};
        this.state = null;
    }

    private parseOptions(line: string) {
        const match = line.match(/\s*(\w+):\s*(.*)/);
        const key = match.length>=1 ? match[1] : null;
        const value = match.length>=2 ? match[2] : null;
        if(key) this.current_options[key] = value;
    }   

    private parseDependency(line: string) {}
    private parsePlatform(line: string){}
    

    private parseSpec(line: string) {
        
        if(this.current_gem == GEM) {
            if(firstDepLevelRegex.test(line)) { 
                line = line.trimStart();
                const match = line.match(specRegex);

                const purl = new PackageURL( PURL_TYPE,
                                undefined, 
                                match.groups.name,
                                match.groups.version,
                                undefined,
                                undefined ).toString();
                this.purlList.push(purl);

            } else {    // Second level of dependence

            }
        }

        if(this.current_gem == GIT) {}

        // Purl from local dependencies are not generated
        if(this.current_gem == PATH){}

    }

    private refine() {}



}
