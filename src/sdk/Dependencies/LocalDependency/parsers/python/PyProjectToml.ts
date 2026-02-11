import { ILocalDependency } from '../../DependencyTypes';

const rProjectTableContent = new RegExp(/\[project\]\s*\n(.*(?:\n(?!^\s*\[).*)*)/g);
const rDependenciesSection = new RegExp( /dependencies\s*=\s*\[((?:[^\]]|\](?!\n))+)\]/);

const purlPrefix = "pkg:pypi/";

/**
 * Parses Poetry-style key-value dependencies from a TOML section body.
 * Handles simple string values (name = "^1.0") and inline tables (name = {version = "^1.0"}).
 */
const parsePoetryDeps = (sectionContent: string): { purl: string; requirement?: string }[] => {
  const results: { purl: string; requirement?: string }[] = [];
  const lines = sectionContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const kvMatch = trimmed.match(/^([\w][\w.-]*)\s*=\s*(.*)/);
    if (!kvMatch) continue;

    const name = kvMatch[1];
    const value = kvMatch[2].trim();

    // Skip python version constraint
    if (name.toLowerCase() === 'python') continue;

    let requirement: string | null = null;

    if (value.startsWith('"') || value.startsWith("'")) {
      // Simple string version: requests = "^2.28.0"
      const ver = value.replace(/["']/g, '').trim();
      if (ver && ver !== '*') requirement = ver;
    } else if (value.startsWith('{')) {
      // Inline table: click = {version = "^8.1.3", optional = true}
      const versionMatch = value.match(/version\s*=\s*["']([^"']+)["']/);
      if (versionMatch) {
        const ver = versionMatch[1].trim();
        if (ver && ver !== '*') requirement = ver;
      }
    }

    const purl = purlPrefix + name;
    results.push({
      purl,
      ...(requirement !== null && { requirement })
    });
  }

  return results;
};

const pyProjectToml = async (fileContent: string,filePath: string): Promise<ILocalDependency> => {
  const result: ILocalDependency = {file: filePath, purls: []};

  // Try PEP 621 format first
  const projectTableMatch = fileContent.match(rProjectTableContent);
  if (projectTableMatch) {
    const depKeyValueMatch = projectTableMatch[0].match(rDependenciesSection);
    if (depKeyValueMatch) {
      const depValue = depKeyValueMatch[1].toString();

      /* At this point, depKeyValue contains the values for dependencies. Example:
      *
      *     "requests",
      *     # this should be ignored
      *     'importlib-metadata; python_version<"3.8"',  #This line as well
      */

      /* The following code will place each dependency in an array (ignoring comments #) */

      const deps =  depValue
        .replace(",", "\n") //Convert inline dependencies to new line dependencies
        .split(/\n/)    //Generate an array by splitting new lines. Each line contains an independent dependency
        .map(d => d.replace(/(,|"|'|\s|(#.*))/g, "")) // Remove extra spaces, quotes, comments and commas
        .filter(d => d.length !== 0 )  //Filters those lines that are empty


      deps.forEach(d => {
        d = d.replace(/\;.*/g, "")  //Removes environment markers https://packaging.python.org/en/latest/specifications/dependency-specifiers/#environment-markers
        d = d.replace(/\[.*\]/, "") //Removes extras https://packaging.python.org/en/latest/specifications/dependency-specifiers/#extras

        const requirementMatch = d.match(/(?:<|<=|!=|==|>=|>|~=|===).*/);
        const requirement = requirementMatch ? requirementMatch[0] : null

        let purl = d;
        if (requirement) purl = d.replace(requirement, "").trim();

        purl = purlPrefix + purl;

        result.purls.push({
          purl,
          ...(requirement !== null && { requirement })
        })
      })
      return result;
    }
  }

  // Fallback: Try Poetry format
  // Matches [tool.poetry.dependencies], [tool.poetry.dev-dependencies], [tool.poetry.group.<name>.dependencies]
  const rPoetryDepsSection = /\[tool\.poetry(?:\.group\.[\w-]+)?\.(?:dev-)?dependencies\]\s*\n([\s\S]*?)(?=\n\s*\[|$)/g;
  const poetryMatches = fileContent.matchAll(rPoetryDepsSection);
  for (const match of poetryMatches) {
    const deps = parsePoetryDeps(match[1]);
    result.purls.push(...deps);
  }

  return result;
};

export default pyProjectToml;