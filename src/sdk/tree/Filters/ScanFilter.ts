import { Filter } from './Filter';
import Node from '../Node'
import { FilterList } from '../../filters/filtering';
import {
  defaultFilterForScanning
} from '../../filters/DefaultFilterForScanning';

export class ScanFilter extends Filter {

  private filter: FilterList;

  public constructor(filterName: string) {
    super();
    this.filter = new FilterList(filterName);
    this.filter.load(defaultFilterForScanning as FilterList)
  }

  public evaluate(node: Node): boolean {
    return !this.filter.include(node.getPath());
  }

}
