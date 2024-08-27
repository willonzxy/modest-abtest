import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import path from "path";

const multiBuildTask = [];

const getSharedConfig = () => ({
  input: "src/main.js",
  plugins: [resolve(), commonjs()],
});

const iifeTask = {
  output: [
    {
      file: "./dist/modest-abtest.iife.min.js",
      format: "iife",
      name: "ABTest",
    },
    {
      file: "./example/modest-abtest.iife.min.js",
      format: "iife",
      name: "ABTest",
    },
  ],
};

const moduleTask = {
  output: [
    {
      file: "./dist/modest-abtest.cjs.js",
      format: "cjs",
      exports: "default",
    },
    {
      file: "./dist/modest-abtest.esm.js",
      format: "es",
      exports: "default",
    },
  ],
};

multiBuildTask.push(Object.assign({}, getSharedConfig(), moduleTask));

const browserTask = Object.assign({}, getSharedConfig(), iifeTask);
browserTask.plugins.push(
  babel({
    exclude: "node_modules/**",
    configFile: path.join(__dirname, "babel.config.js"),
    babelHelpers: "runtime",
  }),
  terser()
);

multiBuildTask.push(browserTask);

export default multiBuildTask;
