import path from 'path';
import autoprefixer from 'autoprefixer';
import commonjs from 'rollup-plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import babel from 'rollup-plugin-babel';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { getPackages } from '@lerna/project';
import filterPackages from '@lerna/filter-packages';
import batchPackages from '@lerna/batch-packages';

async function getSortedPackages() {
  const packages = await getPackages(__dirname);

  const filtered = filterPackages(
    packages,
    '@digitransit-component/*',
    '@digitransit-component/digitransit-component',
    false,
  );
  return batchPackages(filtered).reduce((arr, batch) => arr.concat(batch), []);
}

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
};

const nodeOptions = {
  jsnext: true,
  main: true,
  browser: true,
};

export default async () => {
  const config = [];
  const packages = await getSortedPackages();
  packages.forEach(pkg => {
    /* Absolute path to package directory */
    const basePath = path.relative(__dirname, pkg.location);
    /* Absolute path to input file */
    const input = path.join(__dirname, basePath, 'src/index.js');
    config.push({
      input,
      output: [
        {
          dir: path.join(__dirname, basePath, 'lib'),
          format: 'esm',
          sourcemap: true,
          globals,
        },
        // {
        //   file: path.join(__dirname, basePath, 'lib', 'index.es.js'),
        //   format: 'esm'
        // }
      ],
      external: Object.keys(globals),
      plugins: [
        peerDepsExternal({
          packageJsonPath: path.join(__dirname, basePath, 'package.json'),
        }),
        nodeResolve(nodeOptions),
        postcss({
          extract: false,
          plugins: [autoprefixer()],
          modules: true,
          use: ['sass'],
        }),
        babel({
          runtimeHelpers: true,
          configFile: './digitransit-component/packages/babel.config.js',
          exclude: /node_modules/,
        }),
        commonjs({
          ignoreGlobal: true,
          // if false then skip sourceMap generation for CommonJS modules
          sourceMap: true, // Default: true
          namedExports: {
            './node_modules/react-is/index.js': ['isValidElementType'],
          },
        }),
        json(),
      ],
    });
  });
  return config;
};
