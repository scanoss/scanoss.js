import fs from 'fs';
import * as fpath from 'path';
import { isBinaryFileSync } from 'isbinaryfile';



export interface IFilter {
  type: FilterListType.ALLOW | FilterListType.BANNED;
  filters: Array<{
    ftype: FilterType;
    scope: FilterScope;
    condition: string;
    value: string;
  }>;
}

export enum FilterType {
  NAME = 'NAME',
  CONTENT = 'CONTENT',
  EXTENSION = 'EXTENSION',
  SIZE = 'SIZE',
  DATE = 'DATE',
  NULL = 'NONE'
};

export enum FilterListType {
  BANNED = 'BANNED',
  ALLOW = 'ALLOW',
};

export enum FilterScope {
  FOLDER = 'FOLDER',
  FILE = 'FILE',
  ALL = 'ALL',
}

class AbstractFilter {
  condition: string;

  value: string;

  ftype: FilterType;

  scope: FilterScope;

  constructor(condition: string, value: string) {
    this.condition = condition;
    this.value = value;
    this.ftype = FilterType.NULL;
    this.scope = FilterScope.ALL;
  }

  evaluate(path: string): boolean {
    return true;
  }

   getScope(): FilterScope {
    return this.scope;
  }
}

export class NameFilter extends AbstractFilter {
  static CONTAINS = 'contains';
  static FULLMATCH = 'fullmatch';
  static STARTS = 'starts';
  static ENDS = 'ends';

  constructor(condition: string, value: string, scope: FilterScope) {
    super(condition, value);
    this.ftype = FilterType.NAME;
    this.scope = scope || this.getScope();
  }

  evaluate(path: string): boolean {
    this.value = this.value.toLowerCase();
    path = path.toLowerCase();

    if (this.condition === NameFilter.CONTAINS) {
      return !(path.indexOf(this.value) >= 0);
    }
    if (this.condition === NameFilter.FULLMATCH) return fpath.basename(path) !== this.value;
    if (this.condition === NameFilter.STARTS) {
      let filename: string;
      filename = fpath.basename(path);
      return !filename.startsWith(this.value);
    }
    if (this.condition === NameFilter.ENDS) {
      let filename: string;
      filename = fpath.basename(path);
      return !filename.endsWith(this.value);
    }

    return true;
  }
}

export class ContentFilter extends AbstractFilter {
  static VALUE_BINARY = 'BINARY';
  static VALUE_TEXT = 'TEXT';
  static EQUAL = '=';
  static NOT_EQUAL = '!=';

  constructor(condition: string, value: string, scope: FilterScope) {
    super(condition, value);
    this.ftype = FilterType.CONTENT;
    this.scope = scope || this.getScope(); // Verificar
  }

  evaluate(path: string): boolean {
    const binary = isBinaryFileSync(path);

    if (this.condition === ContentFilter.EQUAL && this.value === ContentFilter.VALUE_BINARY && binary) return false;
    if (this.condition === ContentFilter.NOT_EQUAL && this.value === ContentFilter.VALUE_TEXT && binary) return false;
    if (this.condition === ContentFilter.EQUAL && this.value === ContentFilter.VALUE_TEXT && !binary) return false;
    if (this.condition === ContentFilter.NOT_EQUAL && this.value === ContentFilter.VALUE_BINARY && !binary) return false;
    return true;
  }
}

export class ExtensionFilter extends AbstractFilter {

  constructor(condition: string, value: string, scope: FilterScope) {
    super(condition, value);
    this.ftype = FilterType.EXTENSION;
    this.scope = scope || this.getScope(); // Verificar
  }

  evaluate(path: string): boolean {
    path = path.toLowerCase();
    this.value = this.value.toLowerCase();
    return !path.endsWith(this.value);
  }
}

export class SizeFilter extends AbstractFilter {
  static BIGGER = '>'
  static SMALLER = '<'
  static EQUAL = '='
  constructor(condition: string, value: string, scope: FilterScope) {
    super(condition, value);
    this.ftype = FilterType.SIZE;
    this.scope = scope || this.getScope(); // Verificar
  }

  evaluate(path: string): boolean {
    const stat = fs.statSync(path);

    if (this.condition === SizeFilter.BIGGER) {
      if (stat.size > parseInt(this.value, 10)) {
        //   console.log("NO aceptado por que NO es mayor");
        return false;
      }
      return true;
    }
    if (this.condition === SizeFilter.SMALLER) {
      if (stat.size < parseInt(this.value, 10)) {
        return false;
      }
      return true;
    }
    if (this.condition === SizeFilter.EQUAL) {
      if (stat.size === parseInt(this.value, 10)) {
        return false;
      }

      return true;
    }

    return true;
  }
}
export class DateFilter extends AbstractFilter {
  static BIGGER = '>'
  static SMALLER = '<'
  constructor(condition: string, value: string, scope: FilterScope) {
    super(condition, value);
    this.ftype = FilterType.NAME;
    this.scope = scope || this.getScope(); // Verificar
  }

  evaluate(path: string): boolean {
    const stats = fs.statSync(path);

    modified = stats.mtime;

    const lDate = new Date(this.value);

    const ms: number = stats.mtimeMs;
    var modified = new Date(ms);
    // console.log(lDate);
    // console.log(modified);
    if (this.condition === DateFilter.BIGGER) {
      if (modified > lDate) {
        return false;
      }
      return true;
    }
    if (this.condition === DateFilter.SMALLER) {
      if (modified < lDate) {
        return false;
      }
      return true;
    }
    return true;
  }
}

export class FilterList {
  type: FilterListType;

  filters: AbstractFilter[];

  constructor(fList?: IFilter) {
    this.filters = [];
    if (fList) this.load(fList);
  }

  public addFilter(filter: AbstractFilter): void {
    this.filters.push(filter);
  }

  // Returns false if the path match with some filter in the list
  // IMPORTANT: This method DOES NOT honor the FilterType (BANNED | ALLOW)
  // Use the method include to honor the FilterType
  public evaluate(path: string): boolean {
    const pathStat = fs.lstatSync(path);

    let i: number;
    for (i = 0; i < this.filters.length; i += 1) {
      const evaluation = this.filters[i].evaluate(path);

      if (this.filters[i].scope === FilterScope.FOLDER && pathStat.isDirectory() && !evaluation) return false;

      if (this.filters[i].scope === FilterScope.FILE && pathStat.isFile() && !evaluation) return false;

      if (this.filters[i].scope === FilterScope.ALL && !evaluation) return false;
    }
    return true;
  }

  //
  public include(path: string): boolean {
    if(this.type === FilterListType.BANNED) return this.evaluate(path);
    return !this.evaluate(path);
  }

  public save(path: string) {
    fs.writeFileSync(path, JSON.stringify(this.filters).toString());
  }

  public loadFromFile(path: string) {
    const json = fs.readFileSync(path, 'utf8');
    const filters = JSON.parse(json);
    this.load(filters);
  }

  public unload() {
    this.filters = [];
  }

  public load(fList: IFilter) {
    this.type = fList.type;
    const a = fList.filters;

    let i: number;
    for (i = 0; i < a.length; i += 1) {
      const scope = a[i].scope || FilterScope.ALL;
      if (a[i].ftype === FilterType.NAME) this.addFilter(new NameFilter(a[i].condition, a[i].value, scope));
      if (a[i].ftype === FilterType.DATE) this.addFilter(new DateFilter(a[i].condition, a[i].value, scope));
      if (a[i].ftype === FilterType.SIZE) this.addFilter(new SizeFilter(a[i].condition, a[i].value, scope));
      if (a[i].ftype === FilterType.EXTENSION) this.addFilter(new ExtensionFilter(a[i].condition, a[i].value, scope));
      if (a[i].ftype === FilterType.CONTENT) this.addFilter(new ContentFilter(a[i].condition, a[i].value, scope));
    }
  }
}


