import path from "path";
import { URL } from "url";

export function isValidUrl(string: string): boolean {
    let url: URL;
    try {
      new URL(string);
    } catch (_) {
      return false;
    }
    return true;
  }

export function isValidPath(string: string): boolean {
  return /^((?:\.\.?)|(?:[a-zA-Z]:\\)|(?:\/))/gm.test(string);
}
