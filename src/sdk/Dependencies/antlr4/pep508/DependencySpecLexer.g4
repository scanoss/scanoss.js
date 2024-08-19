lexer grammar DependencySpecLexer;

// Skip whitespace and handle comments
WS : [ \t\r\n]+ -> skip ;

// Token definitions
fragment DIGIT : [0-9] ;
fragment LETTER : [a-zA-Z] ;
fragment LETTER_OR_DIGIT : LETTER | DIGIT ;

VERSION_CMP
    : '<'
    | '<='
    | '!='
    | '=='
    | '>='
    | '>'
    | '~='
    | '==='
    ;

DASH : '-' ;
UNDERSCORE : '_' ;
DOT : '.' ;
STAR : '*' ;
PLUS : '+' ;
EXCLAMATION : '!' ;

AT : '@' ;

IN : 'in' ;
NOT_IN : 'not' WS+ 'in' ;

DQUOTE : '"' ;
SQUOTE : '\'' ;

L_PAREN : '(' ;
R_PAREN : ')' ;
L_BRACKET : '[' ;
R_BRACKET : ']' ;
L_BRACE : '{' ;
R_BRACE : '}' ;

AND : 'and' ;
OR : 'or' ;

SEMICOLON : ';' ;
COMMA : ',' ;

// Basic Python string characters (without quotes)
PYTHON_STR_C
    : WS
    | LETTER
    | DIGIT
    | '(' | ')' | '.' | '{' | '}' | '-' | '_' | '*' | '#' | ':' | ';'
    | ',' | '/' | '?' | '[' | ']' | '!' | '~' | '`' | '@' | '$' | '%'
    | '^' | '&' | '=' | '+' | '|' | '<' | '>'
    ;

// Terminal rule for URI reference (simple version)
URI_REFERENCE : ~[ \t\r\n]+ ;

// Python environment variables
PYTHON_VERSION : 'python_version' ;
PYTHON_FULL_VERSION : 'python_full_version' ;
OS_NAME : 'os_name' ;
SYS_PLATFORM : 'sys_platform' ;
PLATFORM_RELEASE : 'platform_release' ;
PLATFORM_SYSTEM : 'platform_system' ;
PLATFORM_VERSION : 'platform_version' ;
PLATFORM_MACHINE : 'platform_machine' ;
PLATFORM_PYTHON_IMPLEMENTATION : 'platform_python_implementation' ;
IMPLEMENTATION_NAME : 'implementation_name' ;
IMPLEMENTATION_VERSION : 'implementation_version' ;
EXTRA : 'extra' ;
