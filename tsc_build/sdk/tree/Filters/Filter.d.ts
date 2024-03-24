import Node from '../Node';
export declare abstract class Filter {
    abstract evaluate(node: Node): boolean;
}
