import {Rule} from "./rule";
import {ReplaceBomItem, Settings} from "../interfaces/types";
import { PackageURL } from 'packageurl-js';

interface ComponentData {
    vendor: string;
    component: string;
    url: string;
    licenses: Array<any>;
    version: string;
    latest: string;
    release_date: string;
}

export class ReplaceRule extends Rule {
    private componentData: Map<string, ComponentData>;
    private replaceBomItems: Array<ReplaceBomItem>;
    constructor(scanResults:any, settings: Settings) {
        super(scanResults);
        this.replaceBomItems = this.orderRules(settings.bom.replace) as Array<ReplaceBomItem>;
        this.componentData = new Map<string, ComponentData>();
        this.loadComponentData();
    }

    private generateBaseUrlFromPurl(pkg: PackageURL) {

        switch (pkg.type) {

          case 'github':
            return `https://github.com/${pkg.namespace}/${pkg.name}`;

          case 'npm':
            return `https://registry.npmjs.org/${pkg.name}`;

          case 'maven': {
            const groupPath = (pkg.namespace || '').replace(/\./g, '/');
            const artifactId = pkg.name;
            return `https://repo1.maven.org/maven2/${groupPath}/${artifactId}`;
          }

          case 'pypi':
            return `https://pypi.org/simple/${pkg.name}/`;

          case 'golang':
            if (pkg.namespace && pkg.namespace.includes('github.com')) {
              return `https://${pkg.namespace}/${pkg.name}`;
            }
            return `https://proxy.golang.org/${pkg.namespace}/${pkg.name}`;

          case 'nuget':
            return `https://api.nuget.org/v3-flatcontainer/${pkg.name.toLowerCase()}`;

          default:
           return ''
        }
    }

    private replace(result: any, bomItem: ReplaceBomItem){
        if (result.id === 'none') return;
        result.purl = [bomItem.replace_with];
        const pkg  = PackageURL.fromString(bomItem.replace_with);
        const cachedComponent = this.componentData.get(bomItem.replace_with);
        result.vendor = cachedComponent?.vendor ?? pkg.namespace;
        result.licenses = cachedComponent?.licenses ?? [];
        result.component = cachedComponent?.component ?? pkg.name;
        result.url = cachedComponent?.url ?? this.generateBaseUrlFromPurl(pkg);
        result.version =  cachedComponent?.version ?? '0.0.0-unknown';
        result.latest = cachedComponent?.latest ?? '0.0.0-unknown';
        result.release_date = cachedComponent?.release_date ?? '-';
    }

    private loadComponentData(): void{
        for (const [path, results] of Object.entries(this.scanResults)) {
            // @ts-ignore
            results.forEach((r) => {
                if(r.id !== 'none') {
                    if (r.purl.length>0) {
                        this.componentData.set(r.purl[0], {
                            licenses: r.licenses,
                            url: r.url,
                            component: r.component,
                            vendor: r.vendor,
                            version: r.version,
                            latest: r.latest,
                            release_date: r.release_date,
                        });
                    }
                }
            });
        }
    }

    public run(): any {
        for (const [resultPath, results] of (Object.entries(this.scanResults) as Array<[string, Array<any>]>)) {
            for(const bomItem of this.replaceBomItems){
                if(this.applyRule(resultPath,results,bomItem)) {
                    results.forEach((r)=>{
                        this.replace(r, bomItem);
                    });
                    break;
                }
            }
        }
        return this.scanResults;
    }

}
