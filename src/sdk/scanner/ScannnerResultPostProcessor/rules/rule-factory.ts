import { Settings } from "../interfaces/types";
import {RemoveRule} from "./remove-rule";
import {ReplaceRule} from "./replace-rule";
import { Rule } from "./rule";

export class ScannerResultsRuleFactory {

    public static create(settings: Settings, scanResults:any): Array<Rule>{
        const rules: Array<Rule> = [];

        if(settings.bom.remove.length>0){
            rules.push(new RemoveRule(scanResults, settings));
        }

        if(settings.bom.replace.length>0){
            rules.push(new ReplaceRule(scanResults, settings));
        }

        return rules;
    }

}
