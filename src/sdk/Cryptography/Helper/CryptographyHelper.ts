import fs from "fs";
import { isBinaryFileSync } from "isbinaryfile";
import PQueue from "p-queue";

// Maximum file size (2GB)
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

const FILE_CONCURRENCY = 10;

/**
 * Filters out binary files and files larger than 2GB
 * @param {Array<string>} files - Files to filter
 * @returns {Promise<Array<string>>} Filtered files
 */
export async function excludeBinariesAndLargeFiles(files: Array<string>):Promise<Array<string>> {
  const queue = new PQueue({ concurrency: FILE_CONCURRENCY });
  const filtered: Array<string> = [];

  await queue.addAll(
    files.map((file) => async () => {
      try {
        const stats = await fs.promises.stat(file);
        if (stats.size > MAX_FILE_SIZE || isBinaryFileSync(file)) {
          return;
        }
        filtered.push(file);
      } catch (error) {
        console.error(`[ Cryptography Helper ] excludeBinariesAndLargeFiles: ${file}:`, error);
      }
    })
  );

  return filtered;
}
