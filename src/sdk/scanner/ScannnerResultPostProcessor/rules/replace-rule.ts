import {Rule} from "./rule";
import {ReplaceBomItem, Settings} from "../interfaces/types";

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

    private replace(result: any, bomItem: ReplaceBomItem){
        result.purl = [bomItem.replace_with];
        const cachedComponent = this.componentData.get(bomItem.replace_with);
        result.vendor = cachedComponent?.vendor ?? '';
        result.licenses = cachedComponent?.licenses ?? [];
        result.component = cachedComponent?.component ?? '';
        result.url = cachedComponent?.url ?? '';
        result.version =  cachedComponent?.version ?? '';
        result.latest = cachedComponent?.latest ?? '';
        result.release_date = cachedComponent?.release_date ?? '';
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
