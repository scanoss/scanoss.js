import { PackageURL } from "packageurl-js";
import path from "path";
function parseDepLink(str) {
    const res = /.*?(?<ns_name>[^\s]+)\s+(?<version>(.*))/.exec(str);
    return {
        ns_name: res?.groups?.ns_name,
        version: res?.groups?.version
    };
}
function getDepDataGoModFromLine(line) {
    const { ns_name, version } = parseDepLink(line);
    const index = ns_name.lastIndexOf('/');
    const namespace = ns_name.substring(0, index);
    const name = ns_name.substring(index + 1);
    return { namespace, name, version };
}
// Removes comments and spaces
function preprocessLine(line) {
    if (line.includes("//"))
        line = line.substring(0, line.indexOf("//"));
    return line.trim();
}
const PURL_TYPE = 'golang';
// See reference on: https://go.dev/ref/mod#go-mod-file
const MANIFEST_FILE = 'go.mod';
export function goModParser(fileContent, filePath) {
    // If the file is not a go.mod manifest file, return an empty results
    const results = { file: filePath, purls: [] };
    if (path.basename(filePath) != MANIFEST_FILE)
        return Promise.resolve(results);
    const lines = fileContent.split('\n');
    const require = [];
    for (let num = 0; num < lines.length; num += 1) {
        let line = preprocessLine(lines[num]);
        if (line.includes('require') && line.includes('(')) {
            num += 1;
            line = preprocessLine(lines[num]);
            while (num < lines.length && line !== ')') {
                const { namespace, name, version } = getDepDataGoModFromLine(line);
                const purlString = new PackageURL(PURL_TYPE, namespace, name, version, undefined, undefined).toString();
                results.purls.push({ purl: purlString });
                require.push(line);
                num += 1;
                line = preprocessLine(lines[num]);
            }
        }
    }
    return Promise.resolve(results);
}
function parseGoSumDepLink(str) {
    const res = /.*?(?<ns_name>[^\s]+)\s+(?<version>(.*))\s+h1:(?<checksum>(.*))/.exec(str);
    return {
        ns_name: res?.groups?.ns_name,
        version: res?.groups?.version,
        checksum: res?.groups?.checksum
    };
}
function getDepDataGoSumFromLine(line) {
    const { ns_name, version } = parseGoSumDepLink(line);
    if (!ns_name)
        return {};
    const index = ns_name.lastIndexOf('/');
    const namespace = ns_name.substring(0, index);
    const name = ns_name.substring(index + 1);
    return { namespace, name, version };
}
// See reference on: https://go.dev/ref/mod#go-mod-file
export function goSumParser(fileContent, filePath) {
    // If the file is not a go.mod manifest file, return an empty results
    const results = { file: filePath, purls: [] };
    if (path.basename(filePath) != 'go.sum')
        return Promise.resolve(results);
    const lines = fileContent.split('\n');
    for (let num = 0; num < lines.length; num += 1) {
        let line = preprocessLine(lines[num]); //Deletes coments
        if (!line)
            continue;
        line = line.replace('/go.mod', '');
        const { namespace, name, version } = getDepDataGoSumFromLine(line);
        if (!name)
            continue;
        //const purlString = new PackageURL(PURL_TYPE, namespace, name, undefined, undefined, undefined).toString();
        const purlString = `pkg:${PURL_TYPE}/${namespace}/${name}`;
        results.purls.push({ purl: purlString, requirement: version });
    }
    return Promise.resolve(results);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sYW5nUGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Nkay9EZXBlbmRlbmNpZXMvTG9jYWxEZXBlbmRlbmN5L3BhcnNlcnMvZ29sYW5nUGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBRXhCLFNBQVMsWUFBWSxDQUFFLEdBQVc7SUFDaEMsTUFBTSxHQUFHLEdBQUcsMENBQTBDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pFLE9BQU87UUFDTCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPO1FBQzdCLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE9BQU87S0FDOUIsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLHVCQUF1QixDQUFDLElBQVk7SUFDM0MsTUFBTSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFOUMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM5QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztJQUUxQyxPQUFPLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsQ0FBQTtBQUNuQyxDQUFDO0FBRUQsOEJBQThCO0FBQzlCLFNBQVMsY0FBYyxDQUFDLElBQVk7SUFDaEMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztRQUNyQixJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVB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