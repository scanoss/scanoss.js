import { Filter } from './Filter';
import Node from '../Node';
export declare class DecompressionFilter extends Filter {
    private supportedFileExtension;
    constructor(filterName: string);
    evaluate(node: Node): boolean;
}
