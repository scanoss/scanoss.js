import { ILocalDependency } from '../../DependencyTypes';
import path from 'path';
import { PackageURL } from 'packageurl-js';

const MANIFEST_FILE = 'libs.versions.toml';

/**
 * Parses a Gradle Version Catalog TOML file (libs.versions.toml) and extracts
 * Maven dependency coordinates as PURLs.
 *
 * Supports:
 * - module + version.ref: `lib = { module = "group:artifact", version.ref = "key" }`
 * - module + inline version: `lib = { module = "group:artifact", version = "1.0" }`
 * - group/name form: `lib = { group = "g", name = "n", version.ref = "key" }`
 * - simple string: `lib = "group:artifact:version"`
 * - no version (BOM-managed): `lib = { module = "group:artifact" }`
 */
export async function libsVersionsTomlParser(fileContent: string, filePath: string): Promise<ILocalDependency> {
  const results: ILocalDependency = { file: filePath, purls: [] };

  if (path.basename(filePath) !== MANIFEST_FILE) return results;

  const versions = parseVersionsSection(fileContent);
  const libraries = parseLibrariesSection(fileContent, versions);

  for (const lib of libraries) {
    if (lib.namespace && lib.name) {
      const purlObj = new PackageURL('maven', lib.namespace, lib.name, undefined, undefined, undefined);
      results.purls.push({
        purl: purlObj.toString(),
        ...(lib.version && { requirement: lib.version }),
      });
    }
  }

  return results;
}

interface LibraryEntry {
  namespace: string;
  name: string;
  version?: string;
}

/**
 * Extracts the content of a TOML section by header name.
 * Returns the text between `[sectionName]` and the next `[` header (or end of file).
 */
function extractSection(fileContent: string, sectionName: string): string | null {
  const regex = new RegExp(`^\\[${sectionName}\\]\\s*$`, 'm');
  const match = regex.exec(fileContent);
  if (!match) return null;

  const start = match.index + match[0].length;
  const nextSection = fileContent.indexOf('\n[', start);
  return nextSection === -1
    ? fileContent.substring(start)
    : fileContent.substring(start, nextSection);
}

/**
 * Parses the [versions] section into a map of key -> version string.
 */
function parseVersionsSection(fileContent: string): Map<string, string> {
  const versions = new Map<string, string>();
  const section = extractSection(fileContent, 'versions');
  if (!section) return versions;

  for (const line of section.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Match: key = "value" or key = 'value'
    const match = trimmed.match(/^([\w-]+)\s*=\s*["']([^"']+)["']/);
    if (match) {
      versions.set(match[1], match[2]);
    }
  }

  return versions;
}

/**
 * Parses the [libraries] section and resolves version references.
 */
function parseLibrariesSection(fileContent: string, versions: Map<string, string>): LibraryEntry[] {
  const libraries: LibraryEntry[] = [];
  const section = extractSection(fileContent, 'libraries');
  if (!section) return libraries;

  for (const line of section.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Match the key = value pattern
    const kvMatch = trimmed.match(/^[\w-]+\s*=\s*(.*)/);
    if (!kvMatch) continue;

    const value = kvMatch[1].trim();
    const entry = parseLibraryValue(value, versions);
    if (entry) libraries.push(entry);
  }

  return libraries;
}

/**
 * Parses a single library value from the TOML file.
 */
function parseLibraryValue(value: string, versions: Map<string, string>): LibraryEntry | null {
  // Simple string notation: "group:artifact:version"
  if (/^["']/.test(value)) {
    const strContent = value.replace(/^["']|["']$/g, '');
    const parts = strContent.split(':');
    if (parts.length >= 2) {
      return {
        namespace: parts[0],
        name: parts[1],
        ...(parts[2] && { version: parts[2] }),
      };
    }
    return null;
  }

  // Inline table notation: { ... }
  if (value.startsWith('{')) {
    let namespace: string | undefined;
    let name: string | undefined;
    let version: string | undefined;

    // Check for module = "group:artifact"
    const moduleMatch = value.match(/module\s*=\s*["']([^"']+)["']/);
    if (moduleMatch) {
      const parts = moduleMatch[1].split(':');
      if (parts.length >= 2) {
        namespace = parts[0];
        name = parts[1];
      }
    } else {
      // Check for group = "...", name = "..."
      const groupMatch = value.match(/group\s*=\s*["']([^"']+)["']/);
      const nameMatch = value.match(/name\s*=\s*["']([^"']+)["']/);
      if (groupMatch) namespace = groupMatch[1];
      if (nameMatch) name = nameMatch[1];
    }

    // Resolve version: version.ref = "key" or version = "value"
    const versionRefMatch = value.match(/version\.ref\s*=\s*["']([^"']+)["']/);
    if (versionRefMatch) {
      version = versions.get(versionRefMatch[1]);
    } else {
      const versionMatch = value.match(/(?<![.\w])version\s*=\s*["']([^"']+)["']/);
      if (versionMatch) {
        version = versionMatch[1];
      }
    }

    if (namespace && name) {
      return { namespace, name, ...(version && { version }) };
    }
  }

  return null;
}
