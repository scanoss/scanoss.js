import fs from 'fs';
import * as fpath from 'path';
import { isBinaryFileSync } from 'isbinaryfile';
export var FilterType;
(function (FilterType) {
    FilterType["NAME"] = "NAME";
    FilterType["CONTENT"] = "CONTENT";
    FilterType["EXTENSION"] = "EXTENSION";
    FilterType["SIZE"] = "SIZE";
    FilterType["DATE"] = "DATE";
    FilterType["NULL"] = "NONE";
})(FilterType || (FilterType = {}));
;
export var FilterListType;
(function (FilterListType) {
    FilterListType["BANNED"] = "BANNED";
    FilterListType["ALLOW"] = "ALLOW";
})(FilterListType || (FilterListType = {}));
;
export var FilterScope;
(function (FilterScope) {
    FilterScope["FOLDER"] = "FOLDER";
    FilterScope["FILE"] = "FILE";
    FilterScope["ALL"] = "ALL";
})(FilterScope || (FilterScope = {}));
class AbstractFilter {
    constructor(condition, value) {
        this.condition = condition;
        this.value = value;
        this.ftype = FilterType.NULL;
        this.scope = FilterScope.ALL;
    }
    evaluate(path) {
        return true;
    }
}
export class NameFilter extends AbstractFilter {
    constructor(condition, value, scope) {
        super(condition, value);
        this.ftype = FilterType.NAME;
        this.scope = scope || super.scope;
    }
    evaluate(path) {
        this.value = this.value.toLowerCase();
        path = path.toLowerCase();
        if (this.condition === NameFilter.CONTAINS) {
            return !(path.indexOf(this.value) >= 0);
        }
        if (this.condition === NameFilter.FULLMATCH)
            return fpath.basename(path) !== this.value;
        if (this.condition === NameFilter.STARTS) {
            let filename;
            filename = fpath.basename(path);
            return !filename.startsWith(this.value);
        }
        if (this.condition === NameFilter.ENDS) {
            let filename;
            filename = fpath.basename(path);
            return !filename.endsWith(this.value);
        }
        return true;
    }
}
NameFilter.CONTAINS = 'contains';
NameFilter.FULLMATCH = 'fullmatch';
NameFilter.STARTS = 'starts';
NameFilter.ENDS = 'ends';
export class ContentFilter extends AbstractFilter {
    constructor(condition, value, scope) {
        super(condition, value);
        this.ftype = FilterType.CONTENT;
        this.scope = scope || super.scope; // Verificar
    }
    evaluate(path) {
        const binary = isBinaryFileSync(path);
        if (this.condition === ContentFilter.EQUAL && this.value === ContentFilter.VALUE_BINARY && binary)
            return false;
        if (this.condition === ContentFilter.NOT_EQUAL && this.value === ContentFilter.VALUE_TEXT && binary)
            return false;
        if (this.condition === ContentFilter.EQUAL && this.value === ContentFilter.VALUE_TEXT && !binary)
            return false;
        if (this.condition === ContentFilter.NOT_EQUAL && this.value === ContentFilter.VALUE_BINARY && !binary)
            return false;
        return true;
    }
}
ContentFilter.VALUE_BINARY = 'BINARY';
ContentFilter.VALUE_TEXT = 'TEXT';
ContentFilter.EQUAL = '=';
ContentFilter.NOT_EQUAL = '!=';
export class ExtensionFilter extends AbstractFilter {
    constructor(condition, value, scope) {
        super(condition, value);
        this.ftype = FilterType.EXTENSION;
        this.scope = scope || super.scope; // Verificar
    }
    evaluate(path) {
        path = path.toLowerCase();
        this.value = this.value.toLowerCase();
        return !path.endsWith(this.value);
    }
}
export class SizeFilter extends AbstractFilter {
    constructor(condition, value, scope) {
        super(condition, value);
        this.ftype = FilterType.SIZE;
        this.scope = scope || super.scope; // Verificar
    }
    evaluate(path) {
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
SizeFilter.BIGGER = '>';
SizeFilter.SMALLER = '<';
SizeFilter.EQUAL = '=';
export class DateFilter extends AbstractFilter {
    constructor(condition, value, scope) {
        super(condition, value);
        this.ftype = FilterType.NAME;
        this.scope = scope || super.scope; // Verificar
    }
    evaluate(path) {
        const stats = fs.statSync(path);
        modified = stats.mtime;
        const lDate = new Date(this.value);
        const ms = stats.mtimeMs;
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
DateFilter.BIGGER = '>';
DateFilter.SMALLER = '<';
export class FilterList {
    constructor(fList) {
        this.filters = [];
        if (fList)
            this.load(fList);
    }
    addFilter(filter) {
        this.filters.push(filter);
    }
    // Returns false if the path match with some filter in the list
    // IMPORTANT: This method DOES NOT honor the FilterType (BANNED | ALLOW)
    // Use the method include to honor the FilterType
    evaluate(path) {
        const pathStat = fs.lstatSync(path);
        let i;
        for (i = 0; i < this.filters.length; i += 1) {
            const evaluation = this.filters[i].evaluate(path);
            if (this.filters[i].scope === FilterScope.FOLDER && pathStat.isDirectory() && !evaluation)
                return false;
            if (this.filters[i].scope === FilterScope.FILE && pathStat.isFile() && !evaluation)
                return false;
            if (this.filters[i].scope === FilterScope.ALL && !evaluation)
                return false;
        }
        return true;
    }
    //
    include(path) {
        if (this.type === FilterListType.BANNED)
            return this.evaluate(path);
        return !this.evaluate(path);
    }
    save(path) {
        fs.writeFileSync(path, JSON.stringify(this.filters).toString());
    }
    loadFromFile(path) {
        const json = fs.readFileSync(path, 'utf8');
        const filters = JSON.parse(json);
        this.load(filters);
    }
    unload() {
        this.filters = [];
    }
    load(fList) {
        this.type = fList.type;
        const a = fList.filters;
        let i;
        for (i = 0; i < a.length; i += 1) {
            const scope = a[i].scope || FilterScope.ALL;
            if (a[i].ftype === FilterType.NAME)
                this.addFilter(new NameFilter(a[i].condition, a[i].value, scope));
            if (a[i].ftype === FilterType.DATE)
                this.addFilter(new DateFilter(a[i].condition, a[i].value, scope));
            if (a[i].ftype === FilterType.SIZE)
                this.addFilter(new SizeFilter(a[i].condition, a[i].value, scope));
            if (a[i].ftype === FilterType.EXTENSION)
                this.addFilter(new ExtensionFilter(a[i].condition, a[i].value, scope));
            if (a[i].ftype === FilterType.CONTENT)
                this.addFilter(new ContentFilter(a[i].condition, a[i].value, scope));
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsdGVyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Nkay9GaWx0ZXJpbmcvRmlsdGVyaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQztBQUNwQixPQUFPLEtBQUssS0FBSyxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFjaEQsTUFBTSxDQUFOLElBQVksVUFPWDtBQVBELFdBQVksVUFBVTtJQUNwQiwyQkFBYSxDQUFBO0lBQ2IsaUNBQW1CLENBQUE7SUFDbkIscUNBQXVCLENBQUE7SUFDdkIsMkJBQWEsQ0FBQTtJQUNiLDJCQUFhLENBQUE7SUFDYiwyQkFBYSxDQUFBO0FBQ2YsQ0FBQyxFQVBXLFVBQVUsS0FBVixVQUFVLFFBT3JCO0FBQUEsQ0FBQztBQUVGLE1BQU0sQ0FBTixJQUFZLGNBR1g7QUFIRCxXQUFZLGNBQWM7SUFDeEIsbUNBQWlCLENBQUE7SUFDakIsaUNBQWUsQ0FBQTtBQUNqQixDQUFDLEVBSFcsY0FBYyxLQUFkLGNBQWMsUUFHekI7QUFBQSxDQUFDO0FBRUYsTUFBTSxDQUFOLElBQVksV0FJWDtBQUpELFdBQVksV0FBVztJQUNyQixnQ0FBaUIsQ0FBQTtJQUNqQiw0QkFBYSxDQUFBO0lBQ2IsMEJBQVcsQ0FBQTtBQUNiLENBQUMsRUFKVyxXQUFXLEtBQVgsV0FBVyxRQUl0QjtBQUVELE1BQU0sY0FBYztJQVNsQixZQUFZLFNBQWlCLEVBQUUsS0FBYTtRQUMxQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDO0lBQy9CLENBQUM7SUFFRCxRQUFRLENBQUMsSUFBWTtRQUNuQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxVQUFXLFNBQVEsY0FBYztJQU01QyxZQUFZLFNBQWlCLEVBQUUsS0FBYSxFQUFFLEtBQWtCO1FBQzlELEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDcEMsQ0FBQztJQUVELFFBQVEsQ0FBQyxJQUFZO1FBQ25CLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN0QyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTFCLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxVQUFVLENBQUMsUUFBUSxFQUFFO1lBQzFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFVBQVUsQ0FBQyxTQUFTO1lBQUUsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEYsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDeEMsSUFBSSxRQUFnQixDQUFDO1lBQ3JCLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN6QztRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxVQUFVLENBQUMsSUFBSSxFQUFFO1lBQ3RDLElBQUksUUFBZ0IsQ0FBQztZQUNyQixRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoQyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdkM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7O0FBL0JNLG1CQUFRLEdBQUcsVUFBVSxDQUFDO0FBQ3RCLG9CQUFTLEdBQUcsV0FBVyxDQUFDO0FBQ3hCLGlCQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ2xCLGVBQUksR0FBRyxNQUFNLENBQUM7QUErQnZCLE1BQU0sT0FBTyxhQUFjLFNBQVEsY0FBYztJQU0vQyxZQUFZLFNBQWlCLEVBQUUsS0FBYSxFQUFFLEtBQWtCO1FBQzlELEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxZQUFZO0lBQ2pELENBQUM7SUFFRCxRQUFRLENBQUMsSUFBWTtRQUNuQixNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV0QyxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssYUFBYSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLGFBQWEsQ0FBQyxZQUFZLElBQUksTUFBTTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ2hILElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxhQUFhLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssYUFBYSxDQUFDLFVBQVUsSUFBSSxNQUFNO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDbEgsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLGFBQWEsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxhQUFhLENBQUMsVUFBVSxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQy9HLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxhQUFhLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssYUFBYSxDQUFDLFlBQVksSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLEtBQUssQ0FBQztRQUNySCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7O0FBbkJNLDBCQUFZLEdBQUcsUUFBUSxDQUFDO0FBQ3hCLHdCQUFVLEdBQUcsTUFBTSxDQUFDO0FBQ3BCLG1CQUFLLEdBQUcsR0FBRyxDQUFDO0FBQ1osdUJBQVMsR0FBRyxJQUFJLENBQUM7QUFtQjFCLE1BQU0sT0FBTyxlQUFnQixTQUFRLGNBQWM7SUFFakQsWUFBWSxTQUFpQixFQUFFLEtBQWEsRUFBRSxLQUFrQjtRQUM5RCxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUNsQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsWUFBWTtJQUNqRCxDQUFDO0lBRUQsUUFBUSxDQUFDLElBQVk7UUFDbkIsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxVQUFXLFNBQVEsY0FBYztJQUk1QyxZQUFZLFNBQWlCLEVBQUUsS0FBYSxFQUFFLEtBQWtCO1FBQzlELEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxZQUFZO0lBQ2pELENBQUM7SUFFRCxRQUFRLENBQUMsSUFBWTtRQUNuQixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRS9CLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQ3hDLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRTtnQkFDeEMsb0RBQW9EO2dCQUNwRCxPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxVQUFVLENBQUMsT0FBTyxFQUFFO1lBQ3pDLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRTtnQkFDeEMsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssVUFBVSxDQUFDLEtBQUssRUFBRTtZQUN2QyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUU7Z0JBQzFDLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFFRCxPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDOztBQWxDTSxpQkFBTSxHQUFHLEdBQUcsQ0FBQTtBQUNaLGtCQUFPLEdBQUcsR0FBRyxDQUFBO0FBQ2IsZ0JBQUssR0FBRyxHQUFHLENBQUE7QUFrQ3BCLE1BQU0sT0FBTyxVQUFXLFNBQVEsY0FBYztJQUc1QyxZQUFZLFNBQWlCLEVBQUUsS0FBYSxFQUFFLEtBQWtCO1FBQzlELEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxZQUFZO0lBQ2pELENBQUM7SUFFRCxRQUFRLENBQUMsSUFBWTtRQUNuQixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhDLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBRXZCLE1BQU0sS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVuQyxNQUFNLEVBQUUsR0FBVyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ2pDLElBQUksUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLHNCQUFzQjtRQUN0Qix5QkFBeUI7UUFDekIsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDeEMsSUFBSSxRQUFRLEdBQUcsS0FBSyxFQUFFO2dCQUNwQixPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxVQUFVLENBQUMsT0FBTyxFQUFFO1lBQ3pDLElBQUksUUFBUSxHQUFHLEtBQUssRUFBRTtnQkFDcEIsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7O0FBaENNLGlCQUFNLEdBQUcsR0FBRyxDQUFBO0FBQ1osa0JBQU8sR0FBRyxHQUFHLENBQUE7QUFrQ3RCLE1BQU0sT0FBTyxVQUFVO0lBS3JCLFlBQVksS0FBZTtRQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLEtBQUs7WUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTSxTQUFTLENBQUMsTUFBc0I7UUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELCtEQUErRDtJQUMvRCx3RUFBd0U7SUFDeEUsaURBQWlEO0lBQzFDLFFBQVEsQ0FBQyxJQUFZO1FBQzFCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFcEMsSUFBSSxDQUFTLENBQUM7UUFDZCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDM0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFbEQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFeEcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFakcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVTtnQkFBRSxPQUFPLEtBQUssQ0FBQztTQUM1RTtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELEVBQUU7SUFDSyxPQUFPLENBQUMsSUFBWTtRQUN6QixJQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssY0FBYyxDQUFDLE1BQU07WUFBRSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkUsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVNLElBQUksQ0FBQyxJQUFZO1FBQ3RCLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVNLFlBQVksQ0FBQyxJQUFZO1FBQzlCLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRU0sTUFBTTtRQUNYLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFTSxJQUFJLENBQUMsS0FBYztRQUN4QixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDdkIsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUV4QixJQUFJLENBQVMsQ0FBQztRQUNkLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2hDLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQztZQUM1QyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDLElBQUk7Z0JBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN0RyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDLElBQUk7Z0JBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN0RyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDLElBQUk7Z0JBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN0RyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDLFNBQVM7Z0JBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoSCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDLE9BQU87Z0JBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUM3RztJQUNILENBQUM7Q0FDRiJ9