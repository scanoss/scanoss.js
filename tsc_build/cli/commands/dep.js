import fs from "fs";
import { DependencyScanner } from "../../sdk/Dependencies/DependencyScanner";
import { DependencyScannerCfg } from "../../sdk/Dependencies/DependencyScannerCfg";
import { Tree } from "../../sdk/tree/Tree";
import { DependencyFilter } from '../../sdk/tree/Filters/DependencyFilter';
import { isFolder } from "./helpers";
export async function depHandler(rootPath, options) {
    rootPath = rootPath.replace(/\/$/, ''); // Remove trailing slash if exists
    rootPath = rootPath.replace(/^\./, process.env.PWD); // Convert relative path to absolute path.
    const pathIsFolder = await isFolder(rootPath);
    const dependencyScannerCfg = new DependencyScannerCfg();
    if (options.grpcHost)
        dependencyScannerCfg.API_URL = options.grpcHost;
    const dependencyScanner = new DependencyScanner(dependencyScannerCfg);
    let fileList = [];
    fileList.push(rootPath);
    if (pathIsFolder) {
        const tree = new Tree(rootPath);
        tree.build();
        fileList = tree.getFileList(new DependencyFilter(""));
    }
    const results = await dependencyScanner.scan(fileList);
    if (options.output) {
        fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));
    }
    else {
        console.log(JSON.stringify(results, null, 2));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaS9jb21tYW5kcy9kZXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3BCLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBQ25GLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUMzRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBR3JDLE1BQU0sQ0FBQyxLQUFLLFVBQVUsVUFBVSxDQUFDLFFBQWdCLEVBQUUsT0FBWTtJQUU3RCxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBRSxrQ0FBa0M7SUFDM0UsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBRSwwQ0FBMEM7SUFDaEcsTUFBTSxZQUFZLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLG9CQUFvQixFQUFFLENBQUM7SUFDeEQsSUFBRyxPQUFPLENBQUMsUUFBUTtRQUFFLG9CQUFvQixDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0lBRXJFLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBRXRFLElBQUksUUFBUSxHQUFrQixFQUFFLENBQUM7SUFDakMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUV4QixJQUFJLFlBQVksRUFBRTtRQUNoQixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDYixRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDdkQ7SUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUV2RCxJQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDakIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN6RTtTQUFNO1FBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMvQztBQUVILENBQUMifQ==