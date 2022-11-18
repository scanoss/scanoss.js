import { Filter } from './Filter';
import Node from '../Node'
import { FilterList } from '../../filters/filtering';
import {
  defaultFilterForDependencies
} from '../../filters/DefaultFilterForDependencies';

export class DependencyFilter extends Filter {

  private filter: FilterList;

  public constructor(filterName: string) {
    super();
    this.filter = new FilterList(filterName);
    this.filter.load(defaultFilterForDependencies as FilterList)
  }

  public evaluate(node: Node): boolean {
    return this.filter.include(node.getPath());
  }

}
