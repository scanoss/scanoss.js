import Node from '../Node';
import { Filter } from './Filter';

export class BinaryFilter extends Filter {
    public evaluate(node: Node): boolean {
       return !node.isBinary();
    }

}
