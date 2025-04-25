import fs from "fs";
import { isBinaryFile } from "isbinaryfile";

// Maximum file size (2GB)
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

/**
 * Filters out binary files and files larger than 2GB
 * @param {Array<string>} files - Files to filter
 * @returns {Promise<Array<string>>} Filtered files
 */
export async function excludeBinariesAndLargeFiles(files: Array<string>):Promise<Array<string>> {
  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const stats = await fs.promises.stat(file);
        // Skip files that are too large or binary
        if (stats.size > MAX_FILE_SIZE || await isBinaryFile(file)) {
          return null;
        }
        return file;
      } catch (error) {
        console.error(`[ Cryptography Helper ] excludeBinariesAndLargeFiles: ${file}:`, error);
        return null;
      }
    })
  );
  return results.filter(Boolean);
}
