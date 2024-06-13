// Generated from TomlParser.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import TomlParserVisitor from "./TomlParserVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class TomlParser extends Parser {
	public static readonly WS = 1;
	public static readonly NL = 2;
	public static readonly COMMENT = 3;
	public static readonly L_BRACKET = 4;
	public static readonly DOUBLE_L_BRACKET = 5;
	public static readonly R_BRACKET = 6;
	public static readonly DOUBLE_R_BRACKET = 7;
	public static readonly EQUALS = 8;
	public static readonly DOT = 9;
	public static readonly COMMA = 10;
	public static readonly BASIC_STRING = 11;
	public static readonly LITERAL_STRING = 12;
	public static readonly UNQUOTED_KEY = 13;
	public static readonly VALUE_WS = 14;
	public static readonly L_BRACE = 15;
	public static readonly BOOLEAN = 16;
	public static readonly ML_BASIC_STRING = 17;
	public static readonly ML_LITERAL_STRING = 18;
	public static readonly FLOAT = 19;
	public static readonly INF = 20;
	public static readonly NAN = 21;
	public static readonly DEC_INT = 22;
	public static readonly HEX_INT = 23;
	public static readonly OCT_INT = 24;
	public static readonly BIN_INT = 25;
	public static readonly OFFSET_DATE_TIME = 26;
	public static readonly LOCAL_DATE_TIME = 27;
	public static readonly LOCAL_DATE = 28;
	public static readonly LOCAL_TIME = 29;
	public static readonly INLINE_TABLE_WS = 30;
	public static readonly R_BRACE = 31;
	public static readonly ARRAY_WS = 32;
	public static readonly EOF = Token.EOF;
	public static readonly RULE_document = 0;
	public static readonly RULE_expression = 1;
	public static readonly RULE_comment = 2;
	public static readonly RULE_key_value = 3;
	public static readonly RULE_key = 4;
	public static readonly RULE_simple_key = 5;
	public static readonly RULE_unquoted_key = 6;
	public static readonly RULE_quoted_key = 7;
	public static readonly RULE_dotted_key = 8;
	public static readonly RULE_value = 9;
	public static readonly RULE_string = 10;
	public static readonly RULE_integer = 11;
	public static readonly RULE_floating_point = 12;
	public static readonly RULE_bool_ = 13;
	public static readonly RULE_date_time = 14;
	public static readonly RULE_array_ = 15;
	public static readonly RULE_array_values = 16;
	public static readonly RULE_comment_or_nl = 17;
	public static readonly RULE_nl_or_comment = 18;
	public static readonly RULE_table = 19;
	public static readonly RULE_standard_table = 20;
	public static readonly RULE_inline_table = 21;
	public static readonly RULE_inline_table_keyvals = 22;
	public static readonly RULE_inline_table_keyvals_non_empty = 23;
	public static readonly RULE_array_table = 24;
	public static readonly literalNames: (string | null)[] = [ null, null, 
                                                            null, null, 
                                                            "'['", "'[['", 
                                                            "']'", "']]'", 
                                                            "'='", "'.'", 
                                                            "','", null, 
                                                            null, null, 
                                                            null, "'{'", 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, "'}'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, "WS", 
                                                             "NL", "COMMENT", 
                                                             "L_BRACKET", 
                                                             "DOUBLE_L_BRACKET", 
                                                             "R_BRACKET", 
                                                             "DOUBLE_R_BRACKET", 
                                                             "EQUALS", "DOT", 
                                                             "COMMA", "BASIC_STRING", 
                                                             "LITERAL_STRING", 
                                                             "UNQUOTED_KEY", 
                                                             "VALUE_WS", 
                                                             "L_BRACE", 
                                                             "BOOLEAN", 
                                                             "ML_BASIC_STRING", 
                                                             "ML_LITERAL_STRING", 
                                                             "FLOAT", "INF", 
                                                             "NAN", "DEC_INT", 
                                                             "HEX_INT", 
                                                             "OCT_INT", 
                                                             "BIN_INT", 
                                                             "OFFSET_DATE_TIME", 
                                                             "LOCAL_DATE_TIME", 
                                                             "LOCAL_DATE", 
                                                             "LOCAL_TIME", 
                                                             "INLINE_TABLE_WS", 
                                                             "R_BRACE", 
                                                             "ARRAY_WS" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"document", "expression", "comment", "key_value", "key", "simple_key", 
		"unquoted_key", "quoted_key", "dotted_key", "value", "string", "integer", 
		"floating_point", "bool_", "date_time", "array_", "array_values", "comment_or_nl", 
		"nl_or_comment", "table", "standard_table", "inline_table", "inline_table_keyvals", 
		"inline_table_keyvals_non_empty", "array_table",
	];
	public get grammarFileName(): string { return "TomlParser.g4"; }
	public get literalNames(): (string | null)[] { return TomlParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return TomlParser.symbolicNames; }
	public get ruleNames(): string[] { return TomlParser.ruleNames; }
	public get serializedATN(): number[] { return TomlParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, TomlParser._ATN, TomlParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public document(): DocumentContext {
		let localctx: DocumentContext = new DocumentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, TomlParser.RULE_document);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 50;
			this.expression();
			this.state = 55;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===2) {
				{
				{
				this.state = 51;
				this.match(TomlParser.NL);
				this.state = 52;
				this.expression();
				}
				}
				this.state = 57;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 58;
			this.match(TomlParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public expression(): ExpressionContext {
		let localctx: ExpressionContext = new ExpressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, TomlParser.RULE_expression);
		try {
			this.state = 67;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 11:
			case 12:
			case 13:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 60;
				this.key_value();
				this.state = 61;
				this.comment();
				}
				break;
			case 4:
			case 5:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 63;
				this.table();
				this.state = 64;
				this.comment();
				}
				break;
			case -1:
			case 2:
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 66;
				this.comment();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public comment(): CommentContext {
		let localctx: CommentContext = new CommentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, TomlParser.RULE_comment);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 70;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===3) {
				{
				this.state = 69;
				this.match(TomlParser.COMMENT);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public key_value(): Key_valueContext {
		let localctx: Key_valueContext = new Key_valueContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, TomlParser.RULE_key_value);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 72;
			this.key();
			this.state = 73;
			this.match(TomlParser.EQUALS);
			this.state = 74;
			this.value();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public key(): KeyContext {
		let localctx: KeyContext = new KeyContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, TomlParser.RULE_key);
		try {
			this.state = 78;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 76;
				this.simple_key();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 77;
				this.dotted_key();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public simple_key(): Simple_keyContext {
		let localctx: Simple_keyContext = new Simple_keyContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, TomlParser.RULE_simple_key);
		try {
			this.state = 82;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 11:
			case 12:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 80;
				this.quoted_key();
				}
				break;
			case 13:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 81;
				this.unquoted_key();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public unquoted_key(): Unquoted_keyContext {
		let localctx: Unquoted_keyContext = new Unquoted_keyContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, TomlParser.RULE_unquoted_key);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 84;
			this.match(TomlParser.UNQUOTED_KEY);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public quoted_key(): Quoted_keyContext {
		let localctx: Quoted_keyContext = new Quoted_keyContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, TomlParser.RULE_quoted_key);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 86;
			_la = this._input.LA(1);
			if(!(_la===11 || _la===12)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public dotted_key(): Dotted_keyContext {
		let localctx: Dotted_keyContext = new Dotted_keyContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, TomlParser.RULE_dotted_key);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 88;
			this.simple_key();
			this.state = 91;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 89;
				this.match(TomlParser.DOT);
				this.state = 90;
				this.simple_key();
				}
				}
				this.state = 93;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la===9);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public value(): ValueContext {
		let localctx: ValueContext = new ValueContext(this, this._ctx, this.state);
		this.enterRule(localctx, 18, TomlParser.RULE_value);
		try {
			this.state = 102;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 11:
			case 12:
			case 17:
			case 18:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 95;
				this.string_();
				}
				break;
			case 22:
			case 23:
			case 24:
			case 25:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 96;
				this.integer();
				}
				break;
			case 19:
			case 20:
			case 21:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 97;
				this.floating_point();
				}
				break;
			case 16:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 98;
				this.bool_();
				}
				break;
			case 26:
			case 27:
			case 28:
			case 29:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 99;
				this.date_time();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 100;
				this.array_();
				}
				break;
			case 15:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 101;
				this.inline_table();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public string_(): StringContext {
		let localctx: StringContext = new StringContext(this, this._ctx, this.state);
		this.enterRule(localctx, 20, TomlParser.RULE_string);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 104;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 399360) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public integer(): IntegerContext {
		let localctx: IntegerContext = new IntegerContext(this, this._ctx, this.state);
		this.enterRule(localctx, 22, TomlParser.RULE_integer);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 106;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 62914560) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public floating_point(): Floating_pointContext {
		let localctx: Floating_pointContext = new Floating_pointContext(this, this._ctx, this.state);
		this.enterRule(localctx, 24, TomlParser.RULE_floating_point);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 108;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 3670016) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public bool_(): Bool_Context {
		let localctx: Bool_Context = new Bool_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 26, TomlParser.RULE_bool_);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 110;
			this.match(TomlParser.BOOLEAN);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public date_time(): Date_timeContext {
		let localctx: Date_timeContext = new Date_timeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 28, TomlParser.RULE_date_time);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 112;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 1006632960) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public array_(): Array_Context {
		let localctx: Array_Context = new Array_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 30, TomlParser.RULE_array_);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 114;
			this.match(TomlParser.L_BRACKET);
			this.state = 116;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 7, this._ctx) ) {
			case 1:
				{
				this.state = 115;
				this.array_values();
				}
				break;
			}
			this.state = 118;
			this.comment_or_nl();
			this.state = 119;
			this.match(TomlParser.R_BRACKET);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public array_values(): Array_valuesContext {
		let localctx: Array_valuesContext = new Array_valuesContext(this, this._ctx, this.state);
		this.enterRule(localctx, 32, TomlParser.RULE_array_values);
		let _la: number;
		try {
			this.state = 134;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 9, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				{
				this.state = 121;
				this.comment_or_nl();
				this.state = 122;
				this.value();
				this.state = 123;
				this.nl_or_comment();
				this.state = 124;
				this.match(TomlParser.COMMA);
				this.state = 125;
				this.array_values();
				this.state = 126;
				this.comment_or_nl();
				}
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 128;
				this.comment_or_nl();
				this.state = 129;
				this.value();
				this.state = 130;
				this.nl_or_comment();
				this.state = 132;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===10) {
					{
					this.state = 131;
					this.match(TomlParser.COMMA);
					}
				}

				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public comment_or_nl(): Comment_or_nlContext {
		let localctx: Comment_or_nlContext = new Comment_or_nlContext(this, this._ctx, this.state);
		this.enterRule(localctx, 34, TomlParser.RULE_comment_or_nl);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 142;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 11, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 137;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===3) {
						{
						this.state = 136;
						this.match(TomlParser.COMMENT);
						}
					}

					this.state = 139;
					this.match(TomlParser.NL);
					}
					}
				}
				this.state = 144;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 11, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public nl_or_comment(): Nl_or_commentContext {
		let localctx: Nl_or_commentContext = new Nl_or_commentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 36, TomlParser.RULE_nl_or_comment);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 151;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 13, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 145;
					this.match(TomlParser.NL);
					this.state = 147;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 12, this._ctx) ) {
					case 1:
						{
						this.state = 146;
						this.match(TomlParser.COMMENT);
						}
						break;
					}
					}
					}
				}
				this.state = 153;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 13, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public table(): TableContext {
		let localctx: TableContext = new TableContext(this, this._ctx, this.state);
		this.enterRule(localctx, 38, TomlParser.RULE_table);
		try {
			this.state = 156;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 154;
				this.standard_table();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 155;
				this.array_table();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public standard_table(): Standard_tableContext {
		let localctx: Standard_tableContext = new Standard_tableContext(this, this._ctx, this.state);
		this.enterRule(localctx, 40, TomlParser.RULE_standard_table);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 158;
			this.match(TomlParser.L_BRACKET);
			this.state = 159;
			this.key();
			this.state = 160;
			this.match(TomlParser.R_BRACKET);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public inline_table(): Inline_tableContext {
		let localctx: Inline_tableContext = new Inline_tableContext(this, this._ctx, this.state);
		this.enterRule(localctx, 42, TomlParser.RULE_inline_table);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 162;
			this.match(TomlParser.L_BRACE);
			this.state = 163;
			this.inline_table_keyvals();
			this.state = 164;
			this.match(TomlParser.R_BRACE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public inline_table_keyvals(): Inline_table_keyvalsContext {
		let localctx: Inline_table_keyvalsContext = new Inline_table_keyvalsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 44, TomlParser.RULE_inline_table_keyvals);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 167;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 14336) !== 0)) {
				{
				this.state = 166;
				this.inline_table_keyvals_non_empty();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public inline_table_keyvals_non_empty(): Inline_table_keyvals_non_emptyContext {
		let localctx: Inline_table_keyvals_non_emptyContext = new Inline_table_keyvals_non_emptyContext(this, this._ctx, this.state);
		this.enterRule(localctx, 46, TomlParser.RULE_inline_table_keyvals_non_empty);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 169;
			this.key();
			this.state = 170;
			this.match(TomlParser.EQUALS);
			this.state = 171;
			this.value();
			this.state = 174;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===10) {
				{
				this.state = 172;
				this.match(TomlParser.COMMA);
				this.state = 173;
				this.inline_table_keyvals_non_empty();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public array_table(): Array_tableContext {
		let localctx: Array_tableContext = new Array_tableContext(this, this._ctx, this.state);
		this.enterRule(localctx, 48, TomlParser.RULE_array_table);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 176;
			this.match(TomlParser.DOUBLE_L_BRACKET);
			this.state = 177;
			this.key();
			this.state = 178;
			this.match(TomlParser.DOUBLE_R_BRACKET);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public static readonly _serializedATN: number[] = [4,1,32,181,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,
	24,1,0,1,0,1,0,5,0,54,8,0,10,0,12,0,57,9,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,3,1,68,8,1,1,2,3,2,71,8,2,1,3,1,3,1,3,1,3,1,4,1,4,3,4,79,8,4,1,
	5,1,5,3,5,83,8,5,1,6,1,6,1,7,1,7,1,8,1,8,1,8,4,8,92,8,8,11,8,12,8,93,1,
	9,1,9,1,9,1,9,1,9,1,9,1,9,3,9,103,8,9,1,10,1,10,1,11,1,11,1,12,1,12,1,13,
	1,13,1,14,1,14,1,15,1,15,3,15,117,8,15,1,15,1,15,1,15,1,16,1,16,1,16,1,
	16,1,16,1,16,1,16,1,16,1,16,1,16,1,16,3,16,133,8,16,3,16,135,8,16,1,17,
	3,17,138,8,17,1,17,5,17,141,8,17,10,17,12,17,144,9,17,1,18,1,18,3,18,148,
	8,18,5,18,150,8,18,10,18,12,18,153,9,18,1,19,1,19,3,19,157,8,19,1,20,1,
	20,1,20,1,20,1,21,1,21,1,21,1,21,1,22,3,22,168,8,22,1,23,1,23,1,23,1,23,
	1,23,3,23,175,8,23,1,24,1,24,1,24,1,24,1,24,0,0,25,0,2,4,6,8,10,12,14,16,
	18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,0,5,1,0,11,12,2,0,11,12,
	17,18,1,0,22,25,1,0,19,21,1,0,26,29,178,0,50,1,0,0,0,2,67,1,0,0,0,4,70,
	1,0,0,0,6,72,1,0,0,0,8,78,1,0,0,0,10,82,1,0,0,0,12,84,1,0,0,0,14,86,1,0,
	0,0,16,88,1,0,0,0,18,102,1,0,0,0,20,104,1,0,0,0,22,106,1,0,0,0,24,108,1,
	0,0,0,26,110,1,0,0,0,28,112,1,0,0,0,30,114,1,0,0,0,32,134,1,0,0,0,34,142,
	1,0,0,0,36,151,1,0,0,0,38,156,1,0,0,0,40,158,1,0,0,0,42,162,1,0,0,0,44,
	167,1,0,0,0,46,169,1,0,0,0,48,176,1,0,0,0,50,55,3,2,1,0,51,52,5,2,0,0,52,
	54,3,2,1,0,53,51,1,0,0,0,54,57,1,0,0,0,55,53,1,0,0,0,55,56,1,0,0,0,56,58,
	1,0,0,0,57,55,1,0,0,0,58,59,5,0,0,1,59,1,1,0,0,0,60,61,3,6,3,0,61,62,3,
	4,2,0,62,68,1,0,0,0,63,64,3,38,19,0,64,65,3,4,2,0,65,68,1,0,0,0,66,68,3,
	4,2,0,67,60,1,0,0,0,67,63,1,0,0,0,67,66,1,0,0,0,68,3,1,0,0,0,69,71,5,3,
	0,0,70,69,1,0,0,0,70,71,1,0,0,0,71,5,1,0,0,0,72,73,3,8,4,0,73,74,5,8,0,
	0,74,75,3,18,9,0,75,7,1,0,0,0,76,79,3,10,5,0,77,79,3,16,8,0,78,76,1,0,0,
	0,78,77,1,0,0,0,79,9,1,0,0,0,80,83,3,14,7,0,81,83,3,12,6,0,82,80,1,0,0,
	0,82,81,1,0,0,0,83,11,1,0,0,0,84,85,5,13,0,0,85,13,1,0,0,0,86,87,7,0,0,
	0,87,15,1,0,0,0,88,91,3,10,5,0,89,90,5,9,0,0,90,92,3,10,5,0,91,89,1,0,0,
	0,92,93,1,0,0,0,93,91,1,0,0,0,93,94,1,0,0,0,94,17,1,0,0,0,95,103,3,20,10,
	0,96,103,3,22,11,0,97,103,3,24,12,0,98,103,3,26,13,0,99,103,3,28,14,0,100,
	103,3,30,15,0,101,103,3,42,21,0,102,95,1,0,0,0,102,96,1,0,0,0,102,97,1,
	0,0,0,102,98,1,0,0,0,102,99,1,0,0,0,102,100,1,0,0,0,102,101,1,0,0,0,103,
	19,1,0,0,0,104,105,7,1,0,0,105,21,1,0,0,0,106,107,7,2,0,0,107,23,1,0,0,
	0,108,109,7,3,0,0,109,25,1,0,0,0,110,111,5,16,0,0,111,27,1,0,0,0,112,113,
	7,4,0,0,113,29,1,0,0,0,114,116,5,4,0,0,115,117,3,32,16,0,116,115,1,0,0,
	0,116,117,1,0,0,0,117,118,1,0,0,0,118,119,3,34,17,0,119,120,5,6,0,0,120,
	31,1,0,0,0,121,122,3,34,17,0,122,123,3,18,9,0,123,124,3,36,18,0,124,125,
	5,10,0,0,125,126,3,32,16,0,126,127,3,34,17,0,127,135,1,0,0,0,128,129,3,
	34,17,0,129,130,3,18,9,0,130,132,3,36,18,0,131,133,5,10,0,0,132,131,1,0,
	0,0,132,133,1,0,0,0,133,135,1,0,0,0,134,121,1,0,0,0,134,128,1,0,0,0,135,
	33,1,0,0,0,136,138,5,3,0,0,137,136,1,0,0,0,137,138,1,0,0,0,138,139,1,0,
	0,0,139,141,5,2,0,0,140,137,1,0,0,0,141,144,1,0,0,0,142,140,1,0,0,0,142,
	143,1,0,0,0,143,35,1,0,0,0,144,142,1,0,0,0,145,147,5,2,0,0,146,148,5,3,
	0,0,147,146,1,0,0,0,147,148,1,0,0,0,148,150,1,0,0,0,149,145,1,0,0,0,150,
	153,1,0,0,0,151,149,1,0,0,0,151,152,1,0,0,0,152,37,1,0,0,0,153,151,1,0,
	0,0,154,157,3,40,20,0,155,157,3,48,24,0,156,154,1,0,0,0,156,155,1,0,0,0,
	157,39,1,0,0,0,158,159,5,4,0,0,159,160,3,8,4,0,160,161,5,6,0,0,161,41,1,
	0,0,0,162,163,5,15,0,0,163,164,3,44,22,0,164,165,5,31,0,0,165,43,1,0,0,
	0,166,168,3,46,23,0,167,166,1,0,0,0,167,168,1,0,0,0,168,45,1,0,0,0,169,
	170,3,8,4,0,170,171,5,8,0,0,171,174,3,18,9,0,172,173,5,10,0,0,173,175,3,
	46,23,0,174,172,1,0,0,0,174,175,1,0,0,0,175,47,1,0,0,0,176,177,5,5,0,0,
	177,178,3,8,4,0,178,179,5,7,0,0,179,49,1,0,0,0,17,55,67,70,78,82,93,102,
	116,132,134,137,142,147,151,156,167,174];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!TomlParser.__ATN) {
			TomlParser.__ATN = new ATNDeserializer().deserialize(TomlParser._serializedATN);
		}

		return TomlParser.__ATN;
	}


	static DecisionsToDFA = TomlParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class DocumentContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
	public EOF(): TerminalNode {
		return this.getToken(TomlParser.EOF, 0);
	}
	public NL_list(): TerminalNode[] {
	    	return this.getTokens(TomlParser.NL);
	}
	public NL(i: number): TerminalNode {
		return this.getToken(TomlParser.NL, i);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_document;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitDocument) {
			return visitor.visitDocument(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public key_value(): Key_valueContext {
		return this.getTypedRuleContext(Key_valueContext, 0) as Key_valueContext;
	}
	public comment(): CommentContext {
		return this.getTypedRuleContext(CommentContext, 0) as CommentContext;
	}
	public table(): TableContext {
		return this.getTypedRuleContext(TableContext, 0) as TableContext;
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_expression;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitExpression) {
			return visitor.visitExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CommentContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public COMMENT(): TerminalNode {
		return this.getToken(TomlParser.COMMENT, 0);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_comment;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitComment) {
			return visitor.visitComment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Key_valueContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public key(): KeyContext {
		return this.getTypedRuleContext(KeyContext, 0) as KeyContext;
	}
	public EQUALS(): TerminalNode {
		return this.getToken(TomlParser.EQUALS, 0);
	}
	public value(): ValueContext {
		return this.getTypedRuleContext(ValueContext, 0) as ValueContext;
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_key_value;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitKey_value) {
			return visitor.visitKey_value(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class KeyContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simple_key(): Simple_keyContext {
		return this.getTypedRuleContext(Simple_keyContext, 0) as Simple_keyContext;
	}
	public dotted_key(): Dotted_keyContext {
		return this.getTypedRuleContext(Dotted_keyContext, 0) as Dotted_keyContext;
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_key;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitKey) {
			return visitor.visitKey(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Simple_keyContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public quoted_key(): Quoted_keyContext {
		return this.getTypedRuleContext(Quoted_keyContext, 0) as Quoted_keyContext;
	}
	public unquoted_key(): Unquoted_keyContext {
		return this.getTypedRuleContext(Unquoted_keyContext, 0) as Unquoted_keyContext;
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_simple_key;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitSimple_key) {
			return visitor.visitSimple_key(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Unquoted_keyContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public UNQUOTED_KEY(): TerminalNode {
		return this.getToken(TomlParser.UNQUOTED_KEY, 0);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_unquoted_key;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitUnquoted_key) {
			return visitor.visitUnquoted_key(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Quoted_keyContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public BASIC_STRING(): TerminalNode {
		return this.getToken(TomlParser.BASIC_STRING, 0);
	}
	public LITERAL_STRING(): TerminalNode {
		return this.getToken(TomlParser.LITERAL_STRING, 0);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_quoted_key;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitQuoted_key) {
			return visitor.visitQuoted_key(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Dotted_keyContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simple_key_list(): Simple_keyContext[] {
		return this.getTypedRuleContexts(Simple_keyContext) as Simple_keyContext[];
	}
	public simple_key(i: number): Simple_keyContext {
		return this.getTypedRuleContext(Simple_keyContext, i) as Simple_keyContext;
	}
	public DOT_list(): TerminalNode[] {
	    	return this.getTokens(TomlParser.DOT);
	}
	public DOT(i: number): TerminalNode {
		return this.getToken(TomlParser.DOT, i);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_dotted_key;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitDotted_key) {
			return visitor.visitDotted_key(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ValueContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public string_(): StringContext {
		return this.getTypedRuleContext(StringContext, 0) as StringContext;
	}
	public integer(): IntegerContext {
		return this.getTypedRuleContext(IntegerContext, 0) as IntegerContext;
	}
	public floating_point(): Floating_pointContext {
		return this.getTypedRuleContext(Floating_pointContext, 0) as Floating_pointContext;
	}
	public bool_(): Bool_Context {
		return this.getTypedRuleContext(Bool_Context, 0) as Bool_Context;
	}
	public date_time(): Date_timeContext {
		return this.getTypedRuleContext(Date_timeContext, 0) as Date_timeContext;
	}
	public array_(): Array_Context {
		return this.getTypedRuleContext(Array_Context, 0) as Array_Context;
	}
	public inline_table(): Inline_tableContext {
		return this.getTypedRuleContext(Inline_tableContext, 0) as Inline_tableContext;
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_value;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitValue) {
			return visitor.visitValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StringContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public BASIC_STRING(): TerminalNode {
		return this.getToken(TomlParser.BASIC_STRING, 0);
	}
	public ML_BASIC_STRING(): TerminalNode {
		return this.getToken(TomlParser.ML_BASIC_STRING, 0);
	}
	public LITERAL_STRING(): TerminalNode {
		return this.getToken(TomlParser.LITERAL_STRING, 0);
	}
	public ML_LITERAL_STRING(): TerminalNode {
		return this.getToken(TomlParser.ML_LITERAL_STRING, 0);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_string;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitString) {
			return visitor.visitString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IntegerContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public DEC_INT(): TerminalNode {
		return this.getToken(TomlParser.DEC_INT, 0);
	}
	public HEX_INT(): TerminalNode {
		return this.getToken(TomlParser.HEX_INT, 0);
	}
	public OCT_INT(): TerminalNode {
		return this.getToken(TomlParser.OCT_INT, 0);
	}
	public BIN_INT(): TerminalNode {
		return this.getToken(TomlParser.BIN_INT, 0);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_integer;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitInteger) {
			return visitor.visitInteger(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Floating_pointContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public FLOAT(): TerminalNode {
		return this.getToken(TomlParser.FLOAT, 0);
	}
	public INF(): TerminalNode {
		return this.getToken(TomlParser.INF, 0);
	}
	public NAN(): TerminalNode {
		return this.getToken(TomlParser.NAN, 0);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_floating_point;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitFloating_point) {
			return visitor.visitFloating_point(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Bool_Context extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public BOOLEAN(): TerminalNode {
		return this.getToken(TomlParser.BOOLEAN, 0);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_bool_;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitBool_) {
			return visitor.visitBool_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Date_timeContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public OFFSET_DATE_TIME(): TerminalNode {
		return this.getToken(TomlParser.OFFSET_DATE_TIME, 0);
	}
	public LOCAL_DATE_TIME(): TerminalNode {
		return this.getToken(TomlParser.LOCAL_DATE_TIME, 0);
	}
	public LOCAL_DATE(): TerminalNode {
		return this.getToken(TomlParser.LOCAL_DATE, 0);
	}
	public LOCAL_TIME(): TerminalNode {
		return this.getToken(TomlParser.LOCAL_TIME, 0);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_date_time;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitDate_time) {
			return visitor.visitDate_time(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Array_Context extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public L_BRACKET(): TerminalNode {
		return this.getToken(TomlParser.L_BRACKET, 0);
	}
	public comment_or_nl(): Comment_or_nlContext {
		return this.getTypedRuleContext(Comment_or_nlContext, 0) as Comment_or_nlContext;
	}
	public R_BRACKET(): TerminalNode {
		return this.getToken(TomlParser.R_BRACKET, 0);
	}
	public array_values(): Array_valuesContext {
		return this.getTypedRuleContext(Array_valuesContext, 0) as Array_valuesContext;
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_array_;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitArray_) {
			return visitor.visitArray_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Array_valuesContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public comment_or_nl_list(): Comment_or_nlContext[] {
		return this.getTypedRuleContexts(Comment_or_nlContext) as Comment_or_nlContext[];
	}
	public comment_or_nl(i: number): Comment_or_nlContext {
		return this.getTypedRuleContext(Comment_or_nlContext, i) as Comment_or_nlContext;
	}
	public value(): ValueContext {
		return this.getTypedRuleContext(ValueContext, 0) as ValueContext;
	}
	public nl_or_comment(): Nl_or_commentContext {
		return this.getTypedRuleContext(Nl_or_commentContext, 0) as Nl_or_commentContext;
	}
	public COMMA(): TerminalNode {
		return this.getToken(TomlParser.COMMA, 0);
	}
	public array_values(): Array_valuesContext {
		return this.getTypedRuleContext(Array_valuesContext, 0) as Array_valuesContext;
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_array_values;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitArray_values) {
			return visitor.visitArray_values(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Comment_or_nlContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NL_list(): TerminalNode[] {
	    	return this.getTokens(TomlParser.NL);
	}
	public NL(i: number): TerminalNode {
		return this.getToken(TomlParser.NL, i);
	}
	public COMMENT_list(): TerminalNode[] {
	    	return this.getTokens(TomlParser.COMMENT);
	}
	public COMMENT(i: number): TerminalNode {
		return this.getToken(TomlParser.COMMENT, i);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_comment_or_nl;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitComment_or_nl) {
			return visitor.visitComment_or_nl(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Nl_or_commentContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NL_list(): TerminalNode[] {
	    	return this.getTokens(TomlParser.NL);
	}
	public NL(i: number): TerminalNode {
		return this.getToken(TomlParser.NL, i);
	}
	public COMMENT_list(): TerminalNode[] {
	    	return this.getTokens(TomlParser.COMMENT);
	}
	public COMMENT(i: number): TerminalNode {
		return this.getToken(TomlParser.COMMENT, i);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_nl_or_comment;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitNl_or_comment) {
			return visitor.visitNl_or_comment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TableContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public standard_table(): Standard_tableContext {
		return this.getTypedRuleContext(Standard_tableContext, 0) as Standard_tableContext;
	}
	public array_table(): Array_tableContext {
		return this.getTypedRuleContext(Array_tableContext, 0) as Array_tableContext;
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_table;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitTable) {
			return visitor.visitTable(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Standard_tableContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public L_BRACKET(): TerminalNode {
		return this.getToken(TomlParser.L_BRACKET, 0);
	}
	public key(): KeyContext {
		return this.getTypedRuleContext(KeyContext, 0) as KeyContext;
	}
	public R_BRACKET(): TerminalNode {
		return this.getToken(TomlParser.R_BRACKET, 0);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_standard_table;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitStandard_table) {
			return visitor.visitStandard_table(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Inline_tableContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public L_BRACE(): TerminalNode {
		return this.getToken(TomlParser.L_BRACE, 0);
	}
	public inline_table_keyvals(): Inline_table_keyvalsContext {
		return this.getTypedRuleContext(Inline_table_keyvalsContext, 0) as Inline_table_keyvalsContext;
	}
	public R_BRACE(): TerminalNode {
		return this.getToken(TomlParser.R_BRACE, 0);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_inline_table;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitInline_table) {
			return visitor.visitInline_table(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Inline_table_keyvalsContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public inline_table_keyvals_non_empty(): Inline_table_keyvals_non_emptyContext {
		return this.getTypedRuleContext(Inline_table_keyvals_non_emptyContext, 0) as Inline_table_keyvals_non_emptyContext;
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_inline_table_keyvals;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitInline_table_keyvals) {
			return visitor.visitInline_table_keyvals(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Inline_table_keyvals_non_emptyContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public key(): KeyContext {
		return this.getTypedRuleContext(KeyContext, 0) as KeyContext;
	}
	public EQUALS(): TerminalNode {
		return this.getToken(TomlParser.EQUALS, 0);
	}
	public value(): ValueContext {
		return this.getTypedRuleContext(ValueContext, 0) as ValueContext;
	}
	public COMMA(): TerminalNode {
		return this.getToken(TomlParser.COMMA, 0);
	}
	public inline_table_keyvals_non_empty(): Inline_table_keyvals_non_emptyContext {
		return this.getTypedRuleContext(Inline_table_keyvals_non_emptyContext, 0) as Inline_table_keyvals_non_emptyContext;
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_inline_table_keyvals_non_empty;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitInline_table_keyvals_non_empty) {
			return visitor.visitInline_table_keyvals_non_empty(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Array_tableContext extends ParserRuleContext {
	constructor(parser?: TomlParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public DOUBLE_L_BRACKET(): TerminalNode {
		return this.getToken(TomlParser.DOUBLE_L_BRACKET, 0);
	}
	public key(): KeyContext {
		return this.getTypedRuleContext(KeyContext, 0) as KeyContext;
	}
	public DOUBLE_R_BRACKET(): TerminalNode {
		return this.getToken(TomlParser.DOUBLE_R_BRACKET, 0);
	}
    public get ruleIndex(): number {
    	return TomlParser.RULE_array_table;
	}
	// @Override
	public accept<Result>(visitor: TomlParserVisitor<Result>): Result {
		if (visitor.visitArray_table) {
			return visitor.visitArray_table(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
