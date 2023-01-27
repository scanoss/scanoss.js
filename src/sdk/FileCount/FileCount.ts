import fs from "fs";
import path from "path";
import {FileCountOptions, Format, IDirSummary, IFileSummary} from "./Interfaces";
import { FilterList } from '../Filtering/Filtering';
import { FileCountFilter } from './FileCountFilter';


export class FileCount {

    public static async walk(rootPath: string, option?: FileCountOptions) {

      //By default hidden folders and files are ignored
      const filters = new FilterList(FileCountFilter);
      if(option?.filters?.countHidden) filters.unload();

      const data =  await this.exploreBFS(rootPath,filters);

      if (option?.output == Format.CSV) return this.produceCsv(data.fileSummary);
      return data;
    }



    private static async exploreBFS(rootPath: string, filters: FilterList): Promise<IDirSummary> {

      const results:	IDirSummary = {fileSummary: new Map(), totalFileSize: 0};
      const queue: Array<string> = [];

      //TODO: Improve the queue implementation for a linked list
      queue.push(rootPath)

      while(queue.length) {
        const currentPath = queue.shift() as string;
        const entries = await fs.promises.readdir( currentPath , {withFileTypes: true});

        for await (const entry of entries) {
          const newPath = path.join(currentPath, entry.name);
          if (filters.include(newPath)) {
            if (entry.isDirectory()) queue.push(newPath);
            else if (entry.isFile() && !entry.isSymbolicLink()) {
              const currentExt =	path.extname(entry.name);
              const currentFileSize = (await fs.promises.stat(path.join(currentPath, entry.name))).size;
              if (results.fileSummary.has(currentExt) )  {
                const fileSum = results.fileSummary.get(currentExt)
                fileSum.count++
                fileSum.size += currentFileSize;
              } else {
                results.fileSummary.set(currentExt, {count: 1, size: currentFileSize, percentage: 0});
              }
              results.totalFileSize+= currentFileSize;
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


    private static produceCsv(data: Map<string,IFileSummary>): string {
        let csv = '';
        for (const key of data.keys()) {
            const value = data.get(key);
            const newLine = `${key},${value?.count},${value?.percentage}\n`
            csv+=newLine;
        }
        return csv;
    }


}





