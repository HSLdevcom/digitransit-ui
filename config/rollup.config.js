import path from 'path';
import fs from 'fs';
import autoprefixer from 'autoprefixer';
import commonjs from 'rollup-plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import babel from 'rollup-plugin-babel';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';
import { getPackages } from '@lerna/project';
import filterPackages from '@lerna/filter-packages';
import batchPackages from '@lerna/batch-packages';

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  classnames: 'cx',
  'prop-types': 'PropTypes',
  i18next: 'i18next',
  'moment-timezone': 'moment',
  'react-autosuggest': 'Autosuggest',
  'react-sortablejs': 'reactSortablejs',
  'react-modal': 'ReactModal',
  '@hsl-fi/modal': 'Modal',
  '@hsl-fi/shimmer': 'Shimmer',
  '@hsl-fi/container-spinner': 'ContainerSpinner',
  '@hsl-fi/hooks': 'hooks',
  '@digitransit-component/digitransit-component-icon': 'Icon',
  '@digitransit-component/digitransit-component-autosuggest': 'DTAutosuggest',
  '@digitransit-component/digitransit-component-dialog-modal': 'DialogModal',
  '@digitransit-component/digitransit-component-suggestion-item':
    'SuggestionItem',
  'lodash/isEmpty': 'isEmpty',
  'lodash/isEqual': 'isEqual',
  'lodash/debounce': 'debounce',
  'lodash/uniqueId': 'uniqueId',
  'lodash/differenceWith': 'differenceWith',
  'lodash/escapeRegExp': 'escapeRegExp',
  'lodash/isNumber': 'isNumber',
  'lodash/flatten': 'flatten',
  'lodash/take': 'take',
  'lodash/isString': 'isString',
  'lodash/orderBy': 'orderBy',
  'lodash/uniqWith': 'uniqWith',
  'lodash/memoize': 'memoize',
  'lodash/cloneDeep': 'cloneDeep',
  'lodash/get': 'get',
  'lodash/uniq': 'uniq',
  'lodash/compact': 'compact',
  moment: 'moment',
  'react-relay': 'reactRelay',
};

async function getSortedPackages() {
  const scope = process.env.SCOPE;
  const ignore = process.env.IGNORE;
  const ignored = [
    '@digitransit-component/digitransit-component',
    '@digitransit-component/digitransit-component-with-breakpoint',
    ignore,
  ];
  const packages = await getPackages(__dirname);
  const filtered = filterPackages(packages, scope, ignored, false);
  return batchPackages(filtered).reduce((arr, batch) => arr.concat(batch), []);
}

export default async () => {
  const config = [];
  const packages = await getSortedPackages();
  packages.forEach(pkg => {
    /* Absolute path to package directory */
    const basePath = path.relative(__dirname, pkg.location);
    let input = path.join(__dirname, basePath, 'src/index.js');
    if (!fs.existsSync(input)) {
      input = path.join(__dirname, basePath, 'index.js');
    }
    const buildConfig = {
      input,
      output: [
        {
          name: pkg.name,
          dir: path.join(__dirname, basePath, 'lib'),
          format: 'umd',
          sourcemap: true,
          inlineDynamicImports: true,
          exports: 'named',
          globals,
        },
        {
          name: pkg.name,
          file: path.join(__dirname, basePath, 'lib', 'index.development.js'),
          format: 'umd',
          sourcemap: 'inline',
          inlineDynamicImports: true,
          exports: 'named',
          globals,
        },
      ],
      context: 'self',
      plugins: [
        peerDepsExternal({
          packageJsonPath: path.join(__dirname, basePath, 'package.json'),
        }),
        nodeResolve(),
        babel({
          runtimeHelpers: true,
          configFile: './config/babel.config.json',
          exclude: /node_modules/,
        }),
        commonjs({
          ignoreGlobal: true,
          include: /node_modules/,
          sourceMap: true,
          namedExports: {
            './node_modules/react-is/index.js': ['isValidElementType'],
          },
        }),
        postcss({
          extract: false,
          plugins: [autoprefixer()],
          modules: true,
          use: ['sass'],
          config: false,
        }),
        json(),
      ],
    };
    if (process.env.NODE_ENV === 'production') {
      buildConfig.plugins.push(terser());
    }
    config.push(buildConfig);
  });
  return config;
};
