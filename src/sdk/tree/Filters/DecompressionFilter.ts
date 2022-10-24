import { Filter } from './Filter';
import Node, { NodeType } from '../Node';
import { DecompressionManager } from '../../Decompress/DecompressionManager';
import path from 'path';

export class DecompressionFilter extends Filter {

  private supportedFileExtension: Array<string>;

  public constructor(filterName: string) {
    super();
    this.supportedFileExtension = new DecompressionManager().getSupportedFormats();
  }

  //Returns true if you want the file
  public evaluate(node: Node): boolean {
    if(node.getType() == NodeType.FOLDER) return true;
    if (this.supportedFileExtension.some(supportedFormat => node.getName().endsWith(supportedFormat))) return true;
    return false;
  }

}
