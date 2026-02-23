import path from "path";
import { PackageURL } from "packageurl-js";
import { ILocalDependency } from "../DependencyTypes";

const PURL_TYPE = "npm";
const MANIFEST_FILE = "pnpm-lock.yaml";

// Regex for pnpm lockfile v5 format: /package-name/version or /@scope/package-name/version
// May include peer dep suffixes like /@scope/pkg/1.0.0_peer@2.0.0
const V5_PACKAGE_REGEX = /^\s{2,4}\/?(?<fullname>(?:@(?<scope>[^/]+)\/)?(?<name>[^/]+))\/(?<version>\d[^_:]*)/;

// Regex for pnpm lockfile v6+ format: /package-name@version or /@scope/package-name@version
// May include peer dep suffixes like /@scope/pkg@1.0.0(@peer/pkg@2.0.0)
const V6_PACKAGE_REGEX = /^\s{2,4}'?\/?(?<fullname>(?:@(?<scope>[^/@]+)\/)?(?<name>[^@']+))@(?<version>\d[^(':\s]*)/;

interface PnpmPackageEntry {
  scope: string | undefined;
  name: string;
  version: string;
  dev: boolean;
}

function parseLockfileVersion(fileContent: string): number {
  const match = fileContent.match(/^lockfileVersion:\s*'?(\d+)/m);
  if (match) return parseInt(match[1], 10);
  return 0;
}

// For pnpm v9+: Parse importers section to get direct prod/dev dependency resolved versions.
// Returns sets of package keys like "express@4.18.2" or "@angular/core@14.2.0".
function parseImportersDeps(lines: string[]): { prodKeys: Set<string>; devKeys: Set<string> } {
  const prodKeys = new Set<string>();
  const devKeys = new Set<string>();

  let inImporters = false;
  let currentTarget: Set<string> | null = null;
  let pkgName: string | null = null;

  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (trimmed === '') continue;

    if (/^importers:\s*$/.test(trimmed)) {
      inImporters = true;
      currentTarget = null;
      pkgName = null;
      continue;
    }

    if (!inImporters) continue;

    // End of importers section (next top-level key)
    if (/^\S/.test(trimmed) && !trimmed.startsWith('#')) {
      inImporters = false;
      break;
    }

    const indent = line.search(/\S/);

    // Workspace key at indent 2 (e.g., "  .:" or "  packages/app:")
    if (indent === 2) {
      currentTarget = null;
      pkgName = null;
      continue;
    }

    // Section header at indent 4 (dependencies:, devDependencies:, etc.)
    if (indent === 4) {
      if (/^\s{4}dependencies:\s*$/.test(trimmed) || /^\s{4}optionalDependencies:\s*$/.test(trimmed)) {
        currentTarget = prodKeys;
      } else if (/^\s{4}devDependencies:\s*$/.test(trimmed)) {
        currentTarget = devKeys;
      } else {
        currentTarget = null;
      }
      pkgName = null;
      continue;
    }

    if (!currentTarget) continue;

    // Package name at indent 6 (e.g., "      express:" or "      '@angular/core':")
    if (indent === 6) {
      const match = trimmed.match(/^\s{6}'?([^':]+)'?:\s*$/);
      if (match) {
        pkgName = match[1];
      }
      continue;
    }

    // Version at indent 8 (e.g., "        version: 4.18.2" or "        version: 14.2.0(rxjs@7.8.0)")
    if (indent === 8 && pkgName) {
      const match = trimmed.match(/^\s{8}version:\s*'?([^'\s]+)'?\s*$/);
      if (match) {
        // Strip peer dep suffixes in parentheses
        const version = match[1].replace(/\(.*$/, '');
        currentTarget.add(`${pkgName}@${version}`);
        pkgName = null;
      }
    }
  }

  return { prodKeys, devKeys };
}

// For pnpm v9+: Build dependency graph from snapshots section.
// Maps each package key (e.g., "express@4.18.2") to its dependency keys.
function buildSnapshotGraph(lines: string[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  let inSnapshots = false;
  let currentKey: string | null = null;
  let inDeps = false;

  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (trimmed === '') continue;

    if (/^snapshots:\s*$/.test(trimmed)) {
      inSnapshots = true;
      currentKey = null;
      inDeps = false;
      continue;
    }

    if (!inSnapshots) continue;

    // End of snapshots section (next top-level key)
    if (/^\S/.test(trimmed) && !trimmed.startsWith('#')) {
      inSnapshots = false;
      break;
    }

    const indent = line.search(/\S/);

    // Snapshot entry at indent 2 (e.g., "  express@4.18.2:" or "  lodash@4.17.21: {}")
    if (indent === 2) {
      const match = trimmed.match(/^\s{2}'?(.+?)(?:\([^)]*\))*'?:\s*(\{\})?\s*$/);
      if (match) {
        // Strip peer dep suffixes from key
        currentKey = match[1].replace(/\(.*$/, '');
        if (!graph.has(currentKey)) {
          graph.set(currentKey, []);
        }
        inDeps = false;
        // Empty entry like "  lodash@4.17.21: {}"
        if (match[2] === '{}') {
          currentKey = null;
        }
      }
      continue;
    }

    if (!currentKey) continue;

    // Subsection header at indent 4
    if (indent === 4) {
      inDeps = /^\s{4}(?:dependencies|optionalDependencies):\s*$/.test(trimmed);
      continue;
    }

    // Dependency entry at indent 6 (e.g., "      accepts: 1.3.8")
    if (indent === 6 && inDeps) {
      const match = trimmed.match(/^\s{6}'?([^':]+)'?:\s*'?([^'\s]+)'?/);
      if (match) {
        const depVersion = match[2].replace(/\(.*$/, '');
        const depKey = `${match[1]}@${depVersion}`;
        graph.get(currentKey)!.push(depKey);
      }
    }
  }

  return graph;
}

// BFS from prod dependencies through the snapshot graph to find all production-reachable packages.
function findProductionPackages(
  prodKeys: Set<string>,
  graph: Map<string, string[]>
): Set<string> {
  const visited = new Set<string>();
  const queue = [...prodKeys];

  while (queue.length > 0) {
    const key = queue.shift()!;
    if (visited.has(key)) continue;
    visited.add(key);

    const deps = graph.get(key);
    if (deps) {
      for (const dep of deps) {
        if (!visited.has(dep)) {
          queue.push(dep);
        }
      }
    }
  }

  return visited;
}

function parsePackagesSection(fileContent: string): PnpmPackageEntry[] {
  const entries: PnpmPackageEntry[] = [];
  const lines = fileContent.split('\n');
  const lockfileVersion = parseLockfileVersion(fileContent);

  let inPackagesSection = false;
  let currentEntry: PnpmPackageEntry | null = null;

  const packageRegex = lockfileVersion >= 6 ? V6_PACKAGE_REGEX : V5_PACKAGE_REGEX;

  // For v9+, determine dev scope from importers + snapshots instead of dev: flag
  let prodPackages: Set<string> | null = null;
  if (lockfileVersion >= 9) {
    const { prodKeys, devKeys } = parseImportersDeps(lines);
    // Only use v9 logic if importers section was found; otherwise fall back to defaults
    if (prodKeys.size > 0 || devKeys.size > 0) {
      const graph = buildSnapshotGraph(lines);
      prodPackages = findProductionPackages(prodKeys, graph);
    }
  }

  for (const line of lines) {
    // Detect start of packages section
    if (/^packages:/.test(line)) {
      inPackagesSection = true;
      continue;
    }

    // Detect end of packages section (next top-level key)
    if (inPackagesSection && /^\S/.test(line) && !line.startsWith('#')) {
      // Save last entry
      if (currentEntry) entries.push(currentEntry);
      inPackagesSection = false;
      continue;
    }

    if (!inPackagesSection) continue;

    // Try to match a package key line
    const match = line.match(packageRegex);
    if (match && match.groups) {
      // Save previous entry
      if (currentEntry) entries.push(currentEntry);

      const pkgScope = match.groups.scope || undefined;
      const pkgName = match.groups.name;
      const pkgVersion = match.groups.version;

      let isDev = false;
      if (lockfileVersion >= 9 && prodPackages) {
        // For v9+, a package is dev if it's NOT reachable from production dependencies
        const key = pkgScope ? `@${pkgScope}/${pkgName}@${pkgVersion}` : `${pkgName}@${pkgVersion}`;
        isDev = !prodPackages.has(key);
      }

      currentEntry = {
        scope: pkgScope,
        name: pkgName,
        version: pkgVersion,
        dev: isDev,
      };
      continue;
    }

    // Check for dev flag within current entry (v5-v8 only)
    if (lockfileVersion < 9 && currentEntry && /^\s+dev:\s*true/.test(line)) {
      currentEntry.dev = true;
    }
  }

  // Don't forget last entry
  if (currentEntry) entries.push(currentEntry);

  return entries;
}

export function pnpmLockParser(fileContent: string, filePath: string): Promise<ILocalDependency> {
  const results: ILocalDependency = { file: filePath, purls: [] };

  if (path.basename(filePath) != MANIFEST_FILE)
    return Promise.resolve(results);

  try {
    const packages = parsePackagesSection(fileContent);

    for (const pkg of packages) {
      const namespace = pkg.scope ? `@${pkg.scope}` : undefined;
      const purlString = new PackageURL(PURL_TYPE, namespace, pkg.name, pkg.version, undefined, undefined).toString();
      const scope = pkg.dev ? "devDependencies" : "dependencies";
      results.purls.push({ purl: purlString, requirement: pkg.version, scope: scope });
    }
  } catch (e) {
    console.error(e);
  }

  return Promise.resolve(results);
}
