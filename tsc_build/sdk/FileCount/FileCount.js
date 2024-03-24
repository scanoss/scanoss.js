import fs from 'fs';
import path from 'path';
import { Format, } from './Interfaces';
import { FilterList } from '../Filtering/Filtering';
import { FileCountFilter } from './FileCountFilter';
export class FileCount {
    static async walk(rootPath, option) {
        //By default hidden folders and files are ignored
        const filters = new FilterList(FileCountFilter);
        if (option?.filters?.countHidden)
            filters.unload();
        const data = await this.exploreBFS(rootPath, filters);
        if (option?.output == Format.CSV)
            return this.produceCsv(data.fileSummary);
        return data;
    }
    //Breadth First Search(BFS)
    static async exploreBFS(rootPath, filters) {
        const results = { fileSummary: new Map(), totalFileSize: 0 };
        const queue = [];
        //TODO: Improve the queue implementation for a linked list
        queue.push(rootPath);
        while (queue.length) {
            const currentPath = queue.shift();
            const entries = await fs.promises.readdir(currentPath, {
                withFileTypes: true,
            });
            for await (const entry of entries) {
                const newPath = path.join(currentPath, entry.name);
                if (filters.include(newPath)) {
                    if (entry.isDirectory())
                        queue.push(newPath);
                    else if (entry.isFile() && !entry.isSymbolicLink()) {
                        const currentExt = path.extname(entry.name);
                        const currentFileSize = (await fs.promises.stat(path.join(currentPath, entry.name))).size;
                        if (results.fileSummary.has(currentExt)) {
                            const fileSum = results.fileSummary.get(currentExt);
                            fileSum.count++;
                            fileSum.size += currentFileSize;
                        }
                        else {
                            results.fileSummary.set(currentExt, {
                                count: 1,
                                size: currentFileSize,
                                percentage: 0,
                            });
                        }
                        results.totalFileSize += currentFileSize;
                    }
                }
            }
        }
        //Update percentage
        for (const ext of results.fileSummary.keys()) {
            const entry = results.fileSummary.get(ext);
            entry.percentage = Number((entry.size / results.totalFileSize).toFixed(2));
        }
        return results;
    }
    static produceCsv(data) {
        let csv = '';
        for (const key of data.keys()) {
            const value = data.get(key);
            const newLine = `${key},${value?.count},${value?.percentage}\n`;
            csv += newLine;
        }
        return csv;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsZUNvdW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Nkay9GaWxlQ291bnQvRmlsZUNvdW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxFQUVMLE1BQU0sR0FHUCxNQUFNLGNBQWMsQ0FBQztBQUN0QixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE1BQU0sT0FBTyxTQUFTO0lBQ2IsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBZ0IsRUFBRSxNQUF5QjtRQUNsRSxpREFBaUQ7UUFDakQsTUFBTSxPQUFPLEdBQUcsSUFBSSxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDaEQsSUFBSSxNQUFNLEVBQUUsT0FBTyxFQUFFLFdBQVc7WUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFbkQsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV0RCxJQUFJLE1BQU0sRUFBRSxNQUFNLElBQUksTUFBTSxDQUFDLEdBQUc7WUFBRSxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELDJCQUEyQjtJQUNuQixNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FDN0IsUUFBZ0IsRUFDaEIsT0FBbUI7UUFFbkIsTUFBTSxPQUFPLEdBQWdCLEVBQUUsV0FBVyxFQUFFLElBQUksR0FBRyxFQUFFLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzFFLE1BQU0sS0FBSyxHQUFrQixFQUFFLENB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