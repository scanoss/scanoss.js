// Generated from TomlParser.g4 by ANTLR 4.13.1

import {ParseTreeVisitor} from 'antlr4';


import { DocumentContext } from "./TomlParser";
import { ExpressionContext } from "./TomlParser";
import { CommentContext } from "./TomlParser";
import { Key_valueContext } from "./TomlParser";
import { KeyContext } from "./TomlParser";
import { Simple_keyContext } from "./TomlParser";
import { Unquoted_keyContext } from "./TomlParser";
import { Quoted_keyContext } from "./TomlParser";
import { Dotted_keyContext } from "./TomlParser";
import { ValueContext } from "./TomlParser";
import { StringContext } from "./TomlParser";
import { IntegerContext } from "./TomlParser";
import { Floating_pointContext } from "./TomlParser";
import { Bool_Context } from "./TomlParser";
import { Date_timeContext } from "./TomlParser";
import { Array_Context } from "./TomlParser";
import { Array_valuesContext } from "./TomlParser";
import { Comment_or_nlContext } from "./TomlParser";
import { Nl_or_commentContext } from "./TomlParser";
import { TableContext } from "./TomlParser";
import { Standard_tableContext } from "./TomlParser";
import { Inline_tableContext } from "./TomlParser";
import { Inline_table_keyvalsContext } from "./TomlParser";
import { Inline_table_keyvals_non_emptyContext } from "./TomlParser";
import { Array_tableContext } from "./TomlParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `TomlParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class TomlParserVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `TomlParser.document`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDocument?: (ctx: DocumentContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.comment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComment?: (ctx: CommentContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.key_value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitKey_value?: (ctx: Key_valueContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.key`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitKey?: (ctx: KeyContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.simple_key`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSimple_key?: (ctx: Simple_keyContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.unquoted_key`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnquoted_key?: (ctx: Unquoted_keyContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.quoted_key`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQuoted_key?: (ctx: Quoted_keyContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.dotted_key`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDotted_key?: (ctx: Dotted_keyContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.value`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitValue?: (ctx: ValueContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.string`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitString?: (ctx: StringContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.integer`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInteger?: (ctx: IntegerContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.floating_point`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFloating_point?: (ctx: Floating_pointContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.bool_`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBool_?: (ctx: Bool_Context) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.date_time`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDate_time?: (ctx: Date_timeContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.array_`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArray_?: (ctx: Array_Context) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.array_values`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArray_values?: (ctx: Array_valuesContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.comment_or_nl`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComment_or_nl?: (ctx: Comment_or_nlContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.nl_or_comment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNl_or_comment?: (ctx: Nl_or_commentContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.table`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTable?: (ctx: TableContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.standard_table`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStandard_table?: (ctx: Standard_tableContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.inline_table`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInline_table?: (ctx: Inline_tableContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.inline_table_keyvals`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInline_table_keyvals?: (ctx: Inline_table_keyvalsContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.inline_table_keyvals_non_empty`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInline_table_keyvals_non_empty?: (ctx: Inline_table_keyvals_non_emptyContext) => Result;
	/**
	 * Visit a parse tree produced by `TomlParser.array_table`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArray_table?: (ctx: Array_tableContext) => Result;
}

