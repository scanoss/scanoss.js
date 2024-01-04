import { ILocalDependency } from '../../DependencyTypes';

const rProjectTableContent = new RegExp(/\[project\]\s*\n(.*(?:\n(?!^\s*\[).*)*)/g);
const rDependenciesSection = new RegExp( /dependencies\s*=\s*\[((?:[^\]]|\](?!\n))+)\]/);

const purlPrefix = "pkg:pypi/";

const pyProjectToml = async (fileContent: string,filePath: string): Promise<ILocalDependency> => {
  const result: ILocalDependency = {file: filePath, purls: []};

  const projectTableMatch = fileContent.match(rProjectTableContent);
  if (!projectTableMatch) return result;

  const depKeyValueMatch = projectTableMatch[0].match(rDependenciesSection);
  if (!depKeyValueMatch) return result;

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
};

export default pyProjectToml;
