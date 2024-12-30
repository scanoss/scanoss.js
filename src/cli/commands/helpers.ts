import pathLib from 'path';
import fs from 'fs';
import path from "path";
import {
  Settings
} from "../../sdk/scanner/ScannnerResultPostProcessor/interfaces/types";


export const DEFAULT_SETTINGS_FILE = 'scanoss.json';

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

export async function getSettingsFilePath(settingsFilePath: string | null, scanPath:string):
  Promise<string> {
  if (settingsFilePath) {
    return settingsFilePath;
  }
  const files = await fs.promises.readdir(scanPath);
  if (files.some((f)=> f === DEFAULT_SETTINGS_FILE)) {
    return path.join(scanPath, DEFAULT_SETTINGS_FILE);
  }
  return null;
}

export function validateSettingsFile(settings: Settings) {
  if (!settings.bom) {
    throw new Error("[ SETTINGS FILE ]: Missing required 'bom' key");
  }

  const { bom } = settings;

  if (bom.include) {
    if (!Array.isArray(bom.include)) {
      return new Error("[ SETTINGS FILE ]: 'include' must be an array");
    }

    bom.include.forEach((item, index) => {
      if (!item.purl) {
        throw new Error(`[ SETTINGS FILE ]: Missing required 'purl' in include item.\n ${JSON.stringify(item,null,2)}`);
      }
    });
  }

  if (bom.remove) {
    if (!Array.isArray(bom.remove)) {
      throw new Error("[ SETTINGS FILE ]: 'remove' must be an array");
    }
  }

  if (bom.replace) {
    if (!Array.isArray(bom.replace)) {
      throw new Error("[ SETTINGS FILE ]: 'replace' must be an array");
    }

    bom.replace.forEach((item, index) => {
      if (!item.replace_with) {
        throw new Error(`[ SETTINGS FILE ]: Missing required 'replace_with' in replace item.\n ${JSON.stringify(item,null,2)}`);
      }
    });
  }

  return true;
}
