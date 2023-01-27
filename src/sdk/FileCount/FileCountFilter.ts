import {
  FilterScope,
  FilterType,
  FilterListType,
  NameFilter, IFilter
} from '../Filtering/Filtering';

export const FileCountFilter: IFilter = {
  type: FilterListType.BANNED,
  filters: [
    { ftype: FilterType.NAME, condition: NameFilter.STARTS, value: '.', scope: FilterScope.ALL },
  ],
};

