import { DependencyService } from '../Services/Grpc/DependencyService';
import { DependencyRequest, } from '../Services/Grpc/scanoss/api/dependencies/v2/scanoss-dependencies_pb';
import { LocalDependencies } from './LocalDependency/LocalDependency';
import { DependencyScannerCfg } from './DependencyScannerCfg';
import { PackageURL } from 'packageurl-js';
import fs from 'fs';
import { Tree } from '../tree/Tree';
export class DependencyScanner {
    constructor(cfg = new DependencyScannerCfg()) {
        //Extract host from URL  (hostname:port)
        if (cfg.API_URL.startsWith('http')) {
            const apiURL = new URL(cfg.API_URL);
            let hostname;
            let port;
            if (!apiURL.port)
                port = apiURL.protocol === 'https:' ? '443' : '80';
            hostname = apiURL.host;
            cfg.API_URL = `${hostname}:${port}`;
        }
        this.grpcDependencyService = new DependencyService(cfg.API_URL, cfg.PROXY);
        this.localDependency = new LocalDependencies();
    }
    async scanFolder(path) {
        if (!(await fs.promises.lstat(path)).isDirectory())
            throw new Error('Specified path is not a directory');
        const tree = new Tree(path);
        tree.build();
        return await this.scan(tree.getFileList());
    }
    async scan(files) {
        let localDependencies = await this.localDependency.search(files);
        if (localDependencies.files.length === 0)
            return { filesList: [] };
        localDependencies = this.purlAdapter(localDependencies);
        const request = this.buildRequest(localDependencies);
        const grpcResponse = await this.grpcDependencyService.get(request);
        const response = grpcResponse.toObject();
        // Extract scope from localDependencies and add it to response
        // Also adds the requirements field from localDependency to the response if the server didn't
        // replay back a version
        this.repairOutput(localDependencies, response);
        return response;
    }
    purlAdapter(localDependencies) {
        for (const file of localDependencies.files) {
            for (const purl of file.purls) {
                //If purl has a specific version, remove it and place the "version" value into requirement field.
                const version = PackageURL.fromString(purl.purl).version;
                if (version) {
                    purl.requirement = version;
                    purl.purl = purl.purl.replace('@' + version, '');
                }
                if (purl.purl.includes('%2F'))
                    purl.purl = purl.purl.replace(/%2F/g, '/');
            }
        }
        return localDependencies;
    }
    buildRequest(localDependencies) {
        try {
            const depRequest = new DependencyRequest();
            depRequest.setDepth(1);
            for (const file of localDependencies.files) {
                const fileMsg = new DependencyRequest.Files();
                fileMsg.setFile(file.file);
                for (const purl of file.purls) {
                    const purlMsg = new DependencyRequest.Purls();
                    purlMsg.setPurl(purl.purl);
                    if (purl?.requirement)
                        purlMsg.setRequirement(purl.requirement);
                    fileMsg.addPurls(purlMsg);
                }
                depRequest.addFiles(fileMsg);
            }
            return depRequest;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    repairOutput(localdependency, serverResponse) {
        // Create a map with key = [filename + purl] and the value is an object containing:
        // * The scope of the local dependency
        // * The requirement of the local dependency
        // Later this map is used to add information in the server response
        const localDependencyInfo = {};
        for (const file of localdependency.files) {
            const filename = file.file;
            for (const localDependency of file.purls) {
                const localInfo = {};
                if (localDependency?.scope)
                    localInfo['scope'] = localDependency.scope;
                if (localDependency?.requirement)
                    localInfo['requirement'] = localDependency.requirement;
                localDependencyInfo[filename + localDependency.purl] = localInfo;
            }
        }
        for (const file of serverResponse.filesList) {
            const filename = file.file;
            for (const dependency of file.dependenciesList) {
                const localDependencyData = localDependencyInfo[filename + dependency.purl];
                if (localDependencyData?.scope)
                    dependency['scope'] = localDependencyData.scope;
                if (localDependencyData?.requirement && dependency.version == '') {
                    dependency.version = localDependencyData.requirement;
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVwZW5kZW5jeVNjYW5uZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2RrL0RlcGVuZGVuY2llcy9EZXBlbmRlbmN5U2Nhbm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN2RSxPQUFPLEVBQ0wsaUJBQWlCLEdBRWxCLE1BQU0sc0VBQXNFLENBQUM7QUFDOUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDdEUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFOUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDcEIsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUVwQyxNQUFNLE9BQU8saUJBQWlCO0lBSzVCLFlBQVksR0FBRyxHQUFHLElBQUksb0JBQW9CLEVBQUU7UUFDMUMsd0NBQXdDO1FBQ3hDLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDbEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BDLElBQUksUUFBZ0IsQ0FBQztZQUNyQixJQUFJLElBQVksQ0FBQztZQUVqQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUk7Z0JBQUUsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNyRSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztZQUN2QixHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsUUFBUSxJQUFJLElBQUksRUFBRSxDQUFDO1NBQ3JDO1FBRUQsSUFBSSxD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