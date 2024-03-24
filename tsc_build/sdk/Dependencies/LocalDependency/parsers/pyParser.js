import path from "path";
import { PackageURL } from "packageurl-js";
import { isValidPath, isValidUrl } from './utils';
function parseDep(str) {
    const res = /^(?<name>[-\w]+)\s*(?<sym>[>=~!]*)\s*(?<version>[\d\.]*)/.exec(str);
    return {
        name: res?.groups?.name,
        sym: res?.groups?.sym,
        version: res?.groups?.version,
    };
}
const PURL_TYPE = 'pypi';
// Parse a requirements.txt file from python projects
// See reference on: https://pip.pypa.io/en/stable/reference/requirements-file-format/
const MANIFEST_FILE = 'requirements.txt';
export function requirementsParser(fileContent, filePath) {
    // If the file is not a python manifest file, return an empty results
    const results = { file: filePath, purls: [] };
    if (path.basename(filePath) != MANIFEST_FILE)
        return Promise.resolve(results);
    const lines = fileContent.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (line.length == 0)
            continue;
        if (!line.startsWith('#') && line.length > 0) { // Avoid comments and new lines
            if (isValidUrl(line)) {
                // For reference about the regex see https://www.rfc-editor.org/rfc/rfc3986#appendix-B
                const res = line.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
                continue;
            }
            else if (isValidPath(line)) {
                continue;
            } // Do not parse local dependencies.
            else if (line.startsWith('-r')) {
                continue;
            } // Recursive dependencies (NOT SUPPORTED YET)
            else {
                const dep = parseDep(line);
                if (!dep.sym) {
                    const purlString = new PackageURL(PURL_TYPE, undefined, dep.name, undefined, undefined, undefined).toString();
                    results.purls.push({ purl: purlString });
                }
                else if (dep.sym === '==') {
                    const purlString = new PackageURL(PURL_TYPE, undefined, dep.name, dep.version, undefined, undefined).toString();
                    results.purls.push({ purl: purlString });
                }
                else {
                    const purlString = new PackageURL(PURL_TYPE, undefined, dep.name, undefined, undefined, undefined).toString();
                    results.purls.push({ purl: purlString, requirement: dep.sym + dep.version });
                }
            }
        }
    }
    return Promise.resolve(results);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHlQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2RrL0RlcGVuZGVuY2llcy9Mb2NhbERlcGVuZGVuY3kvcGFyc2Vycy9weVBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUdsRCxTQUFTLFFBQVEsQ0FBRSxHQUFXO0lBQzVCLE1BQU0sR0FBRyxHQUFHLDBEQUEwRCxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqRixPQUFPO1FBQ0wsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSTtRQUN2QixHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHO1FBQ3JCLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU87S0FDOUIsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUM7QUFFekIscURBQXFEO0FBQ3JELHNGQUFzRjtBQUN0RixNQUFNLGFBQWEsR0FBRyxrQkFBa0IsQ0FBQztBQUN6QyxNQUFNLFVBQVUsa0JBQWtCLENBQUMsV0FBbUIsRUFBRSxRQUFnQjtJQUVwRSxxRUFBcUU7SUFDckUsTUFBTSxPQUFPLEdBQXFCLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFDLENBQUM7SUFDOUQsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLGFBQWE7UUFDdkMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXBDLE1BQU0sS0FBSyxHQUFrQixXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXJELEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO1FBQ3BCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbkIsSUFBRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUM7WUFBRSxTQUFTO1FBQzlCLElBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFFLEVBQUUsK0JBQStCO1lBQ3hFLElBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNqQixzRkFBc0Y7Z0JBQ3RGLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsK0RBQStELENBQUMsQ0FBQztnQkFDeEYsU0FBUzthQUNaO2lCQUNJLElBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUFDLFNBQVM7YUFBQyxDQUFDLG1DQUFtQztpQkFDckUsSUFBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUFDLFNBQVM7YUFBQyxDQUFDLDZDQUE2QztpQkFDbkY7Z0JBRUQsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtvQkFDWixNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDOUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQztpQkFDeEM7cUJBQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLLElBQUksRUFBRTtvQkFDM0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNoSCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO2lCQUN4QztxQkFBTTtvQkFDTCxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDOUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDO2lCQUMxRTthQUNKO1NBQ0o7S0FDSjtJQUNILE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNsQyxDQUFDIn0=