import { ILocalDependency } from '../../DependencyTypes';
declare const pyProjectToml: (fileContent: string, filePath: string) => Promise<ILocalDependency>;
export default pyProjectToml;
