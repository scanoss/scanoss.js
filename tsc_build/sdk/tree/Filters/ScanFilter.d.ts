import { Filter } from './Filter';
import Node from '../Node';
export declare class ScanFilter extends Filter {
    private filter;
    constructor(filterName: string);
    evaluate(node: Node): boolean;
}
