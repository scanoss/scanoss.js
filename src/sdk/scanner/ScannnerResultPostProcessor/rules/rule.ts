import {BomItem} from "../interfaces/types";

export abstract class Rule {

    protected readonly scanResults: any;

    constructor(scanResults:any) {
        this.scanResults = scanResults;
    }


    protected orderRules(bomItems:Array<BomItem>): Array<BomItem> {
        return bomItems.sort((a,b)=>{
            return Number(('path' in b)) - Number(('path' in a));
        });
    }

    protected byPurl(results:Array<any>, bomItem: BomItem):boolean {
        return results.some((r: any) => {
            if (r.id === 'none') return false;
            return r.purl.some((p: string) => p === bomItem.purl);
        });
    }

    protected byPath(resultPath: string,bomItem: BomItem){
        if (!bomItem.path) return false;
        return resultPath.includes(bomItem.path);
    }

    protected applyRule(resultPath:string, results:Array<any>, bomItem:BomItem): boolean{
        if (bomItem.purl && bomItem.path){
           return this.byPath(resultPath,bomItem) && this.byPurl(results,bomItem);
        }
        if (bomItem.purl){
            return this.byPurl(results,bomItem);
        }

        return false;
    }

    public abstract run (): any;

}
