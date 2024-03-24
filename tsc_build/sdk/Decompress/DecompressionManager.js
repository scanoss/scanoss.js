import path from 'path';
import fs from 'fs';
import { Tree } from '../tree/Tree';
import { DecompressionFilter } from '../tree/Filters/DecompressionFilter';
import { DecompressZip } from './Decompressor/DecompressZips';
import { DecompressTgz } from './Decompressor/DecompressTgz';
export class DecompressionManager {
    //When false: Decompress files into <zip_name>-<suffix>-X where X can be any number until find a free folder name
    constructor(decompressionLevel = 1, suffix = "-unzipped", decompressOverride = false) {
        this.decompressionLevel = decompressionLevel;
        this.decompressOverride = decompressOverride;
        this.suffix = suffix;
        this.decompressorList = [
            new DecompressTgz(),
            new DecompressZip()
        ];
    }
    addDecompressor(d) {
        this.decompressorList.push(d);
    }
    getSupportedFormats() {
        const supportedFormats = [];
        this.decompressorList.forEach((d) => {
            supportedFormats.push(...d.getSupportedFormats());
        });
        return supportedFormats;
    }
    async decompress(archivesPaths) {
        for (const archivePath of archivesPaths)
            await this.decompressRecursive(archivePath, 0);
        const parentFoldersPath = archivesPaths.map(archivePath => `${archivePath}${this.suffix}`);
        return parentFoldersPath;
    }
    async decompressRecursive(archivePath, level) {
        if (level >= this.decompressionLevel)
            return;
        const archiveRootPath = path.dirname(archivePath);
        const archiveName = path.basename(archivePath);
        let newFolderPath = `${archiveRootPath}${path.sep}${archiveName}${this.suffix}`;
        const isSupported = this.decompressorList.some((d) => d.isSupported(archiveName));
        if (isSupported) {
            let i = 0;
            const r = new RegExp("(?<=" + this.suffix + ")-\\d+$"); //Selects last -X where X is a number
            while (!this.decompressOverride && fs.existsSync(newFolderPath)) { //Search for a free name
                newFolderPath = newFolderPath.replace(r, "");
                newFolderPath += `-${i}`;
                i++;
            }
            await fs.promises.mkdir(newFolderPath, { recursive: true });
            //Search for decompressor and extract archive
            for (const d of this.decompressorList) {
                if (d.isSupported(archiveName)) {
                    await d.run(archivePath, newFolderPath);
                    break;
                }
            }
            //Search for new archives
            const tree = new Tree(newFolderPath);
            tree.build();
            const newFilesPath = tree.getFileList(new DecompressionFilter(""));
            for (const newFilePath of newFilesPath) {
                await this.decompressRecursive(newFilePath, level + 1);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVjb21wcmVzc2lvbk1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2RrL0RlY29tcHJlc3MvRGVjb21wcmVzc2lvbk1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ3hCLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFN0QsTUFBTSxPQUFPLG9CQUFvQjtJQVNPLGlIQUFpSDtJQUV2SixZQUFZLHFCQUE2QixDQUFDLEVBQUUsU0FBaUIsV0FBVyxFQUFFLHFCQUE4QixLQUFLO1FBQzNHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztRQUM3QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7UUFDN0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLGdCQUFnQixHQUFHO1lBQ3RCLElBQUksYUFBYSxFQUFFO1lBQ25CLElBQUksYUFBYSxFQUFFO1NBQ3BCLENBQUM7SUFFSixDQUFDO0lBRU0sZUFBZSxDQUFDLENBQWU7UUFDcEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRU0sbUJBQW1CO1FBQ3hCLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNsQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FB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