parser grammar DependencySpecParser;

options { tokenVocab=DependencySpecLexer; }

// Parser Rules
version_cmp
    : VERSION_CMP
    ;

version
    : ( LETTER_OR_DIGIT | DASH | UNDERSCORE | DOT | STAR | PLUS | EXCLAMATION )+
    ;

version_one
    : version_cmp version
    ;

version_many
    : version_one (COMMA version_one)*
    ;

versionspec
    : L_PAREN version_many R_PAREN
    | version_many
    ;

urlspec
    : AT URI_REFERENCE
    ;

// Environment markers
marker_op
    : version_cmp
    | IN
    | NOT_IN
    ;

python_str
    : (SQUOTE (PYTHON_STR_C | DQUOTE)* SQUOTE)
    | (DQUOTE (PYTHON_STR_C | SQUOTE)* DQUOTE)
    ;

env_var
    : PYTHON_VERSION
    | PYTHON_FULL_VERSION
    | OS_NAME
    | SYS_PLATFORM
    | PLATFORM_RELEASE
    | PLATFORM_SYSTEM
    | PLATFORM_VERSION
    | PLATFORM_MACHINE
    | PLATFORM_PYTHON_IMPLEMENTATION
    | IMPLEMENTATION_NAME
    | IMPLEMENTATION_VERSION
    | EXTRA
    ;

marker_var
    : env_var
    | python_str
    ;

marker_expr
    : marker_var marker_op marker_var
    | L_PAREN marker R_PAREN
    ;

marker_and
    : marker_expr AND marker_expr
    | marker_expr
    ;

marker_or
    : marker_and OR marker_and
    | marker_and
    ;

marker
    : marker_or
    ;

quoted_marker
    : SEMICOLON marker
    ;

// Optional components of a distribution
identifier_end
    : LETTER_OR_DIGIT | (DASH | UNDERSCORE | DOT)* LETTER_OR_DIGIT
    ;

identifier
    : LETTER_OR_DIGIT identifier_end*
    ;

extras_list
    : identifier (COMMA identifier)*
    ;

extras
    : L_BRACKET extras_list? R_BRACKET
    ;

name_req
    : identifier extras? versionspec? quoted_marker?
    ;

url_req
    : identifier extras? urlspec quoted_marker?
    ;

specification
    : ( url_req | name_req )
    ;
