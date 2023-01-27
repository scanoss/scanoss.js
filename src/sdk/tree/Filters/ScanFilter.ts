import { Filter } from './Filter';
import Node from '../Node'
import { FilterList } from '../../Filtering/Filtering';
import {
  defaultFilterForScanning
} from '../../Filtering/DefaultFilterForScanning';

export class ScanFilter extends Filter {

  private filter: FilterList;

  public constructor(filterName: string) {
    super();
    this.filter = new FilterList();
    this.filter.load(defaultFilterForScanning)
  }

  public evaluate(node: Node): boolean {
    return this.filter.include(node.getPath());
  }

}
