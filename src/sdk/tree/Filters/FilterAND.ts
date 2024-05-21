import Node from "../Node";
import { Filter } from "./Filter";

export class FilterAND extends Filter {

    private filters: Array<Filter>;

    constructor(filters: Array<Filter>) {
        super();
        this.filters =  filters;
    }


    public evaluate(node: Node): boolean {
        let valid = false;
       for(let i = 0; i < this.filters.length ; i++){
           valid = this.filters[i].evaluate(node);
           if(!valid) return false;
        }
        return valid;
    }

}
