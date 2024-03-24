export interface IFilter {
    type: FilterListType.ALLOW | FilterListType.BANNED;
    filters: Array<{
        ftype: FilterType;
        scope: FilterScope;
        condition: string;
        value: string;
    }>;
}
export declare enum FilterType {
    NAME = "NAME",
    CONTENT = "CONTENT",
    EXTENSION = "EXTENSION",
    SIZE = "SIZE",
    DATE = "DATE",
    NULL = "NONE"
}
export declare enum FilterListType {
    BANNED = "BANNED",
    ALLOW = "ALLOW"
}
export declare enum FilterScope {
    FOLDER = "FOLDER",
    FILE = "FILE",
    ALL = "ALL"
}
declare class AbstractFilter {
    condition: string;
    value: string;
    ftype: FilterType;
    scope: FilterScope;
    constructor(condition: string, value: string);
    evaluate(path: string): boolean;
}
export declare class NameFilter extends AbstractFilter {
    static CONTAINS: string;
    static FULLMATCH: string;
    static STARTS: string;
    static ENDS: string;
    constructor(condition: string, value: string, scope: FilterScope);
    evaluate(path: string): boolean;
}
export declare class ContentFilter extends AbstractFilter {
    static VALUE_BINARY: string;
    static VALUE_TEXT: string;
    static EQUAL: string;
    static NOT_EQUAL: string;
    constructor(condition: string, value: string, scope: FilterScope);
    evaluate(path: string): boolean;
}
export declare class ExtensionFilter extends AbstractFilter {
    constructor(condition: string, value: string, scope: FilterScope);
    evaluate(path: string): boolean;
}
export declare class SizeFilter extends AbstractFilter {
    static BIGGER: string;
    static SMALLER: string;
    static EQUAL: string;
    constructor(condition: string, value: string, scope: FilterScope);
    evaluate(path: string): boolean;
}
export declare class DateFilter extends AbstractFilter {
    static BIGGER: string;
    static SMALLER: string;
    constructor(condition: string, value: string, scope: FilterScope);
    evaluate(path: string): boolean;
}
export declare class FilterList {
    type: FilterListType;
    filters: AbstractFilter[];
    constructor(fList?: IFilter);
    addFilter(filter: AbstractFilter): void;
    evaluate(path: string): boolean;
    include(path: string): boolean;
    save(path: string): void;
    loadFromFile(path: string): void;
    unload(): void;
    load(fList: IFilter): void;
}
export {};
