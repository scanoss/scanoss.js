import { CharStream, CommonTokenStream } from "antlr4";

import TomlLexer from "../../antlr4/toml/TomlLexer";
import TomlParser, {
  Array_valuesContext,
  DocumentContext,
  KeyContext, Standard_tableContext,
  TableContext
} from "../../antlr4/toml/TomlParser";
import TomlParserVisitor from "../../antlr4/toml/TomlParserVisitor";



function ProcessExample(pyproject: string) {

  const chars = new CharStream(pyproject); // replace this with a FileStream as required

  const lexer = new TomlLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new TomlParser(tokens);
  const tree = parser.document();

  console.log("Looking for Dependencies: ")
  console.log("")
  tree.accept(new DependencyVisitor());

  console.log("\n")

  console.log("Looking for Optional Dependencies: ")
  console.log("")
  tree.accept(new OptionalDependencyVisitor());
}




/*
https://packaging.python.org/en/latest/specifications/pyproject-toml/#dependencies-optional-dependencies

dependencies: Array of PEP 508 strings
optional-dependencies: Table with values of arrays of PEP 508 strings

For dependencies, it is a key whose value is an array of strings.
Each string represents a dependency of the project and MUST be formatted as
a valid PEP 508 string. Each string maps directly to a Requires-Dist entry.

For optional-dependencies, it is a table where each key specifies an
extra and whose value is an array of strings. The strings of the arrays
must be valid PEP 508 strings. The keys MUST be valid values for Provides-Extra.
Each value in the array thus becomes a corresponding Requires-Dist entry for the
matching Provides-Extra metadata.
*/

class DependencyVisitor extends TomlParserVisitor<void> {
  private inDependencies: boolean = false;
  private inProjectTable: boolean = false;

  visitTable = (ctx: TableContext): void => {
    this.inProjectTable = false
    if (ctx.getText().includes("project")) { //Tables can be inline
      this.inProjectTable = true
    }
    return this.visitChildren(ctx);
  };

  visitKey = (ctx: KeyContext): void => {
    this.inDependencies = false;
    if (ctx.getText().includes("dependencies")) {
      this.inDependencies = true;
    }
    return this.visitChildren(ctx);
  }

  visitArray_values = (ctx: Array_valuesContext): void => {
    if (this.inProjectTable && this.inDependencies) {
      console.log(ctx.value().getText())
    }
    return this.visitChildren(ctx);
  }

}


class OptionalDependencyVisitor extends TomlParserVisitor<void> {
  private inOptionalDependencies: boolean = false;

  visitTable = (ctx: TableContext): void => {
    //Tables can be inline
    this.inOptionalDependencies = false
    if (ctx.getText().includes("project.optional-dependencies")) {
      this.inOptionalDependencies = true
    }
    return this.visitChildren(ctx);
  };

  visitArray_values = (ctx: Array_valuesContext): void => {

    if (this.inOptionalDependencies) {
      console.log(ctx.value().getText())
      this.visitChildren(ctx);
    }

  }

}

it("Run example parser", async () => {
  const pyproject = `
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "spam-eggs"
version = "2020.0.0"
dependencies = [
  "httpx",
  "gidgethub[httpx]>4.0.0",
  "django>2.1; os_name != 'nt'",
  "django>2.0; os_name == 'nt'",
]
requires-python = ">=3.8"
authors = [
  {name = "Pradyun Gedam", email = "pradyun@example.com"},
  {name = "Tzu-Ping Chung", email = "tzu-ping@example.com"},
  {name = "Another person"},
  {email = "different.person@example.com"},
]
maintainers = [
  {name = "Brett Cannon", email = "brett@example.com"}
]
description = "Lovely Spam! Wonderful Spam!"
readme = "README.rst"
license = {file = "LICENSE.txt"}
keywords = ["egg", "bacon", "sausage", "tomatoes", "Lobster Thermidor"]
classifiers = [
  "Development Status :: 4 - Beta",
  "Programming Language :: Python"
]

[project.optional-dependencies]
gui = ["PyQt5"]
cli = [
  "rich",
  "click",
]

[project.urls]
Homepage = "https://example.com"
Documentation = "https://readthedocs.org"
Repository = "https://github.com/me/spam.git"
"Bug Tracker" = "https://github.com/me/spam/issues"
Changelog = "https://github.com/me/spam/blob/master/CHANGELOG.md"

[project.scripts]
spam-cli = "spam:main_cli"

[project.gui-scripts]
spam-gui = "spam:main_gui"

[project.entry-points."spam.magical"]
tomatoes = "spam:main_tomatoes"
`;

  ProcessExample(pyproject);

});
