import {Rule} from "./rule";
import {BomItem, ReplaceBomItem, Settings} from "../interfaces/types";

export class RemoveRule extends Rule {
    private removeBomItems: Array<BomItem>;
    constructor(scanResults: any, settings: Settings) {
        super(scanResults);
        this.removeBomItems = settings.bom.remove;
    }

    run(): any {
        for (const [resultPath, results] of (Object.entries(this.scanResults) as Array<[string, Array<any>]>)) {
            for(const bomItem of this.removeBomItems) {
                if(this.applyRule(resultPath,results,bomItem)) {
                   const { server} =  this.scanResults[resultPath][0];
                   this.scanResults[resultPath] = [{id: 'none', server}];
                   break;
                }
            }
        }
        return this.scanResults;
    }
}
