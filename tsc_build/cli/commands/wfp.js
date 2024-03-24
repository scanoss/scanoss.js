import fs from 'fs';
import cliProgress from 'cli-progress';
import { isFolder } from './helpers';
import { ScannerEvents, WinnowingMode } from '../../sdk/scanner/ScannerTypes';
import { WfpCalculator } from '../../sdk/scanner/WfpProvider/WfpCalculator/WfpCalculator';
import { Tree } from '../../sdk/tree/Tree';
import { DependencyFilter } from '../../sdk/tree/Filters/DependencyFilter';
export async function wfpHandler(rootPath, options) {
    rootPath = rootPath.replace(/\/$/, ''); // Remove trailing slash if exists
    rootPath = rootPath.replace(/^\./, process.env.PWD); // Convert relative path to absolute path.
    const pathIsFolder = await isFolder(rootPath);
    const wfpCalculator = new WfpCalculator();
    let filesToFingerprint = [];
    if (pathIsFolder) {
        const tree = new Tree(rootPath);
        tree.build();
        filesToFingerprint = tree.getFileList(new DependencyFilter(""));
    }
    else {
        filesToFingerprint.push(rootPath);
    }
    const optBar1 = { format: 'Fingerprinting Progress: [{bar}] {percentage}% | Fingerprinted {value} files of {total}' };
    const bar1 = new cliProgress.SingleBar(optBar1, cliProgress.Presets.shades_classic);
    bar1.start(filesToFingerprint.length, 0);
    let fingerprints = '';
    wfpCalculator.on(ScannerEvents.WINNOWING_NEW_CONTENT, (fingerprintPackage) => {
        bar1.increment(fingerprintPackage.getNumberFilesFingerprinted());
        fingerprints = fingerprints.concat(fingerprintPackage.getContent());
    });
    if (options.verbose)
        wfpCalculator.on(ScannerEvents.WINNOWER_LOG, (log) => {
            console.error(log);
        });
    wfpCalculator.on(ScannerEvents.WINNOWING_FINISHED, () => {
        bar1.stop();
        if (options.output) {
            fs.writeFileSync(options.output, fingerprints);
        }
        else {
            console.log(fingerprints);
        }
    });
    const wfpInput = { fileList: filesToFingerprint, folderRoot: rootPath, obfuscate: options.obfuscate };
    if (options.hpsm)
        wfpInput.winnowingMode = WinnowingMode.FULL_WINNOWING_HPSM;
    await wfpCalculator.start(wfpInput);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ZwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaS9jb21tYW5kcy93ZnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBRXBCLE9BQU8sV0FBVyxNQUFNLGNBQWMsQ0FBQztBQUV2QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFOUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJEQUEyRCxDQUFDO0FBRTFGLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUczRSxNQUFNLENBQUMsS0FBSyxVQUFVLFVBQVUsQ0FBQyxRQUFnQixFQUFFLE9BQVk7SUFFN0QsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUUsa0NBQWtDO0lBQzNFLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUUsMENBQTBDO0lBQ2hHLE1BQU0sWUFBWSxHQUFHLE1BQU0sUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlDLE1BQU0sYUFBYSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7SUFFMUMsSUFBSSxrQkFBa0IsR0FBYSxFQUFFLENBQUM7SUFDdEMsSUFBSSxZQUFZLEVBQUU7UUFDaEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2Isa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDakU7U0FBTTtRQUNMLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUNsQztJQUdELE1BQU0sT0FBTyxHQUFHLEVBQUUsTUFBTSxFQUFFLHlGQUF5RixFQUFFLENBQUM7SUFDdEgsTUFBTSxJQUFJLEdBQUcsSUFBSSxXQUFXLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3BGLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXpDLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztJQUN0QixhQUFhLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLGtCQUFzQyxFQUFFLEVBQUU7UUFDL0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUM7UUFDakUsWUFBWSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUUsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUUsQ0FBQztJQUN4RSxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksT0FBTyxDQUFDLE9BQU87UUFDakIsYUFBYSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBVyxFQUFFLEVBQUU7WUFDM0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztJQUVMLGFBQWEsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtRQUN0RCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixJQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDakIsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQ2hEO2FBQU07WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQzNCO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLFFBQVEsR0FBc0IsRUFBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFBO0lBQ3ZILElBQUcsT0FBTyxDQUFDLElBQUk7UUFBRSxRQUFRLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQztJQUM1RSxNQUFNLGFBQWEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7QUFHdEMsQ0FBQyJ9