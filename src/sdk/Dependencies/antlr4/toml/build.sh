#! /bin/bash
antlr4 -Dlanguage=TypeScript -no-listener -visitor TomlParser.g4 TomlLexer.g4
