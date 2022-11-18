import fs from 'fs';
import * as fpath from 'path';
import { isBinaryFileSync } from 'isbinaryfile';

export enum FilterType {
  NAME = 'NAME',
  CONTENT = 'CONTENT',
  EXTENSION = 'EXTENSION',
  SIZE = 'SIZE',
  DATE = 'DATE',
};

export enum FilterListType {
  BANNED = 'BANNED',
  WHITELIST = 'WHITELIST',
};

class AbstractFilter {
  condition: string;

  value: string;

  ftype: string;

  scope: string;

  constructor(condition: string, value: string) {
    this.condition = condition;
    this.value = value;
    this.ftype = 'NONE';
    this.scope = 'ALL';
  }

  evaluate(path: string): boolean {
    return true;
  }
}

class NameFilter extends AbstractFilter {
  constructor(condition: string, value: string, scope: string) {
    super(condition, value);
    this.ftype = 'NAME';
    this.scope = scope || super.scope;
  }

  evaluate(path: string): boolean {
    this.value = this.value.toLowerCase();
    path = path.toLowerCase();

    if (this.condition === 'contains') {
      return !(path.indexOf(this.value) >= 0);
    }
    if (this.condition === 'fullmatch') return fpath.basename(path) !== this.value;
    if (this.condition === 'starts') {
      let filename: string;
      filename = fpath.basename(path);
      return !filename.startsWith(this.value);
    }
    if (this.condition === 'ends') {
      let filename: string;
      filename = fpath.basename(path);
      return !filename.endsWith(this.value);
    }

    return true;
  }
}

class ContentFilter extends AbstractFilter {
  constructor(condition: string, value: string, scope: string) {
    super(condition, value);
    this.ftype = 'CONTENT';
    this.scope = scope || super.scope; // Verificar
  }

  evaluate(path: string): boolean {
    const binary = isBinaryFileSync(path);

    if (this.condition === '=' && this.value === 'BINARY' && binary) return false;
    if (this.condition === '!=' && this.value === 'TEXT' && binary) return false;
    if (this.condition === '=' && this.value === 'TEXT' && !binary) return false;
    if (this.condition === '!=' && this.value === 'BINARY' && !binary) return false;
    return true;
  }
}

class ExtensionFilter extends AbstractFilter {
  constructor(condition: string, value: string, scope: string) {
    super(condition, value);
    this.ftype = 'EXTENSION';
    this.scope = scope || super.scope; // Verificar
  }

  evaluate(path: string): boolean {
    path = path.toLowerCase();
    this.value = this.value.toLowerCase();
    return !path.endsWith(this.value);
  }
}

class SizeFilter extends AbstractFilter {
  constructor(condition: string, value: string, scope: string) {
    super(condition, value);
    this.ftype = 'SIZE';
    this.scope = scope || super.scope; // Verificar
  }

  evaluate(path: string): boolean {
    const stat = fs.statSync(path);

    if (this.condition === '>') {
      if (stat.size > parseInt(this.value, 10)) {
        //   console.log("NO aceptado por que NO es mayor");
        return false;
      }
      return true;
    }
    if (this.condition === '<') {
      if (stat.size < parseInt(this.value, 10)) {
        return false;
      }
      return true;
    }
    if (this.condition === '=') {
      if (stat.size === parseInt(this.value, 10)) {
        return false;
      }

      return true;
    }

    return true;
  }
}
class DateFilter extends AbstractFilter {
  constructor(condition: string, value: string, scope: string) {
    super(condition, value);
    this.ftype = 'DATE';
    this.scope = scope || super.scope; // Verificar
  }

  evaluate(path: string): boolean {
    const stats = fs.statSync(path);

    modified = stats.mtime;

    const lDate = new Date(this.value);

    const ms: number = stats.mtimeMs;
    var modified = new Date(ms);
    // console.log(lDate);
    // console.log(modified);
    if (this.condition === '>') {
      if (modified > lDate) {
        return false;
      }
      return true;
    }
    if (this.condition === '<') {
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

  name: string;

  filters: AbstractFilter[];

  constructor(name: string) {
    this.name = name;
    this.filters = [];
  }

  addFilter(filter: AbstractFilter): void {
    this.filters.push(filter);
  }

  // Returns false if the path match with some filter in the list
  evaluate(path: string): boolean {
    const pathStat = fs.lstatSync(path);

    let i: number;
    for (i = 0; i < this.filters.length; i += 1) {
      const evaluation = this.filters[i].evaluate(path);

      if (this.filters[i].scope === 'FOLDER' && pathStat.isDirectory() && !evaluation) return false;

      if (this.filters[i].scope === 'FILE' && pathStat.isFile() && !evaluation) return false;

      if (this.filters[i].scope === 'ALL' && !evaluation) return false;
    }
    return true;
  }

  public include(path: string): boolean {
    if(this.type === FilterListType.BANNED) return this.evaluate(path);
    return !this.evaluate(path);
  }

  save(path: string) {
    fs.writeFileSync(path, JSON.stringify(this.filters).toString());
  }

  loadFromFile(path: string) {
    const json = fs.readFileSync(path, 'utf8');
    const filters = JSON.parse(json);
    this.load(filters);
  }

  load(fList: FilterList) {
    this.name = fList.name;
    this.type = fList.type;

    const a = fList.filters;

    let i: number;
    for (i = 0; i < a.length; i += 1) {
      const scope = a[i].scope || 'ALL';
      if (a[i].ftype === 'NAME') this.addFilter(new NameFilter(a[i].condition, a[i].value, scope));
      if (a[i].ftype === 'DATE') this.addFilter(new DateFilter(a[i].condition, a[i].value, scope));
      if (a[i].ftype === 'SIZE') this.addFilter(new SizeFilter(a[i].condition, a[i].value, scope));
      if (a[i].ftype === 'EXTENSION') this.addFilter(new ExtensionFilter(a[i].condition, a[i].value, scope));
      if (a[i].ftype === 'CONTENT') this.addFilter(new ContentFilter(a[i].condition, a[i].value, scope));
    }
  }
}


