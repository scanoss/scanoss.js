import Node from '../Node'

export abstract class Filter {
  public abstract evaluate(node: Node): boolean
}
