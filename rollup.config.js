import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

const BUILD_LIB = {
  input: "tsc_build/index.js",
  output: {
    dir: "lib",
    format: "es",
  },
  plugins: [commonjs(), nodeResolve(), json(), terser()],
};

const BUILD_CLI = {
  input: "tsc_build/cli.js",
  output: {
    dir: "lib",
    format: "es",
  },
  plugins: [commonjs(), nodeResolve(), json(), terser()],
};

export default [BUILD_LIB, BUILD_CLI];
