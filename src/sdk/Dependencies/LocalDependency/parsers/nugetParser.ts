import { ILocalDependency } from '../DependencyTypes';
import xml, { Element } from 'xml-js';
import { PackageURL } from 'packageurl-js';

const PURL_TYPE = "nuget";

export function csprojParser(fileContent: string, filePath: string): Promise<ILocalDependency> {

  const results: ILocalDependency = {file: filePath, purls: []};

  try {
    const fileProject = xml.xml2js(fileContent);
    const project = fileProject.elements.find(item => item.name == 'Project');
    const itemGroups = project.elements.filter(item => item.name == 'ItemGroup');

    const packageReference: Array<Element> = [];
    itemGroups.forEach(itemGroup => {
      itemGroup.elements.forEach(item => {
        if (item.name == "PackageReference")
          packageReference.push(item);
      });
    });

    //Generates purls
    packageReference.forEach(itemPackage => {
      const packageName = itemPackage.attributes?.Include?.toString();
      const version = itemPackage.attributes?.Version?.toString();

      results.purls.push({
        purl: new PackageURL(PURL_TYPE, null, packageName, null, null,null).toString(),
        requirement: version
      })
    });

  } catch (e) {
    console.error(e);
    return Promise.resolve({file: filePath, purls: []});
  }

  return Promise.resolve(results)
}


export function packagesConfigParser(fileContent: string, filePath: string): Promise<ILocalDependency> {

  const results: ILocalDependency = { file: filePath, purls: [] };
  const packageConfig = xml.xml2js(fileContent);

  const packages = packageConfig.elements.filter(item => item.name == "packages")

  packages.forEach(pkg => {
    pkg.elements.forEach(dep => {
      const depName = dep.attributes?.id;
      const depVersion = dep.attributes?.version;

      results.purls.push({
        purl: new PackageURL(PURL_TYPE, null, depName, null, null, null).toString(),
        requirement: depVersion
      })
    })
  });

  return Promise.resolve(results);
}
