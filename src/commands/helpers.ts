import pathLib from 'path';

import fs from 'fs';

// Async function that verify if a path is a folder. If the path is not valid the promise will be rejected
export const isFolder = (path: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.isDirectory());
      }
    });
  });
}

export function getProjectNameFromPath(path: string): string {
  return pathLib.basename(path,pathLib.extname(path))
}
