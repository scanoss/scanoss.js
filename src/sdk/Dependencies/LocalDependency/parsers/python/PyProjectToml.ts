import { ILocalDependency } from '../../DependencyTypes';

//TODO: Start working parser
const pyProjectToml = async (fileContent: string,filePath: string): Promise<ILocalDependency> => {
  return { file: 'pyproject.toml', purls: [{purl: "httpx"},{purl: "pkg:pypi/gidgethub", requirement:">4.0.0"}, {purl: "django", requirement:">2.1"}, {purl: "django", requirement: ">2.0"}] }
};

export default pyProjectToml;
