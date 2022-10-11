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
    const nodeFileExtension = path.extname(node.getPath());
    if (this.supportedFileExtension.some(supportedFormat => supportedFormat === nodeFileExtension)) return true;
    return false;
  }

}
