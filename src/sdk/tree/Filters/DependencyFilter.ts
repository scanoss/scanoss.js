import { Filter } from './Filter';
import Node from '../Node'
import { FilterList, IFilter} from '../../Filtering/Filtering';
import {
  defaultFilterForDependencies
} from '../../Filtering/DefaultFilterForDependencies';

export class DependencyFilter extends Filter {

  private filter: FilterList;

  public constructor(filterName: string) {
    super();
    this.filter = new FilterList();
    this.filter.load(defaultFilterForDependencies)
  }

  public evaluate(node: Node): boolean {
    return this.filter.include(node.getPath());
  }

}
