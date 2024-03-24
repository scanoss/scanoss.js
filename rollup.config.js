import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import url from "@rollup/plugin-url";

const BUILD_LIB = {
  input: "tsc_build/index.js",
  output: {
    dir: "lib",
    format: "es",
  },
  plugins: [
    commonjs(),
    nodeResolve(),
    json(),
    terser(),
    // url({ limit: 0, include: ["**/*.worker.*"], emitFiles: true }),
  ],
};

const BUILD_CLI = {
  input: "tsc_build/cli.js",
  output: {
    dir: "lib",
    format: "es",
  },
  plugins: [
    commonjs(),
    nodeResolve(),
    json(),
    terser(),
    url({ limit: 0, include: ["**/*.worker.js", "**/*.worker.ts"], emitFiles: true }),
  ],
};

export default [BUILD_CLI];
