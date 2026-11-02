import path from 'path';
import fs from 'fs';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import svgr from '@svgr/rollup';
import terser from '@rollup/plugin-terser';
import scssModules from './rollup-plugin-scss-modules.js';

const isProduction = process.env.NODE_ENV === 'production';

const babelPresets = [
  ['@babel/preset-env', { bugfixes: true, modules: 'auto' }],
  [
    '@babel/preset-react',
    {
      development: process.env.NODE_ENV === 'development',
      runtime: 'automatic',
    },
  ],
];

const babelPlugins = [
  'relay',
  'babel-plugin-optimize-clsx',
  '@babel/plugin-transform-class-properties',
  '@babel/plugin-transform-object-rest-spread',
  [
    '@babel/plugin-transform-runtime',
    { helpers: true, regenerator: true, useESModules: true },
  ],
  ...(isProduction
    ? [
        [
          'babel-plugin-transform-react-remove-prop-types',
          { mode: 'unsafe-wrap' },
        ],
      ]
    : []),
];

const rootDir = import.meta.dirname;

const globals = {
  react: 'React',
  'react/jsx-runtime': 'jsxRuntime',
  'react/jsx-dev-runtime': 'jsxDevRuntime',
  'react-dom': 'ReactDOM',
  classnames: 'cx',
  'prop-types': 'PropTypes',
  'react-is': 'react-is',
  i18next: 'i18next',
  'react-i18next': 'reactI18next',
  '@dnd-kit/react': 'dndKitReact',
  '@dnd-kit/react/sortable': 'dndKitReactSortable',
  'react-modal': 'ReactModal',
  '@hsl-fi/modal': 'Modal',
  '@hsl-fi/shimmer': 'Shimmer',
  '@hsl-fi/loading-indicators': 'LoadingIndicators',
  '@hsl-fi/hooks': 'hooks',
  '@hsl-fi/dialog': 'dialog',
  '@hsl-fi/form': 'form',
  '@hsl-fi/layout-primitives': 'layoutPrimitives',
  '@digitransit-component/digitransit-component-icon': 'Icon',
  '@digitransit-component/digitransit-component-autosuggest': 'DTAutosuggest',
  '@digitransit-component/digitransit-component-dialog-modal': 'DialogModal',
  '@digitransit-component/digitransit-component-suggestion-item':
    'SuggestionItem',
  lodash: 'lodash',
  'lodash/omit': 'omit',
  'lodash/sortBy': 'sortBy',
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
  'react-relay': 'reactRelay',
  downshift: 'downshift',
  luxon: 'luxon',
  'react-select': 'Select',
};

/**
 * This config builds a single package: the one whose directory is the
 * current working directory. It's designed to be run per-package via
 * `lerna run build --scope ...` (each package's own "build" script invokes
 * `rollup -c`, whose local rollup.config.js re-exports this file, from within
 * its own directory), so that
 * Lerna's Nx-powered task pipeline (see nx.json) can order/parallelize/
 * cache builds across packages instead of this config looping over all of
 * them in one process.
 */
function getPackage() {
  const packageDir = process.cwd();
  const packageJsonPath = path.join(packageDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(
      `No package.json found in ${packageDir}. Run this config from a ` +
        'package directory, e.g. via that package\'s own "build" script ' +
        '(invoked through `lerna run build --scope ...`), not directly ' +
        'from the repo root.',
    );
  }
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return { name: pkg.name, location: packageDir, sideEffects: pkg.sideEffects };
}

export default () => {
  const pkg = getPackage();
  let input = path.join(pkg.location, 'src/index.js');
  if (!fs.existsSync(input)) {
    input = path.join(pkg.location, 'src/index.jsx');
  }
  if (!fs.existsSync(input)) {
    input = path.join(pkg.location, 'index.js');
  }
  if (!fs.existsSync(input)) {
    input = path.join(pkg.location, 'index.jsx');
  }
  const scss = scssModules({
    packageName: pkg.name,
    packageRoot: pkg.location,
    rootDir,
    sideEffects: pkg.sideEffects,
    minify: process.env.NODE_ENV === 'production',
  });
  const buildConfig = {
    input,
    output: [
      {
        name: pkg.name,
        // .cjs, not .js: these packages set "type": "module" in their own
        // package.json (so their raw source/tests run as native ESM), but
        // this UMD bundle uses CJS-style `module.exports`/`require`
        // branches. Node always treats a .cjs file as CommonJS regardless
        // of the containing package's "type" field, which keeps this
        // require()-able without fighting Node's ESM parser.
        file: path.join(pkg.location, 'lib', 'index.cjs'),
        format: 'umd',
        sourcemap: true,
        inlineDynamicImports: true,
        exports: 'named',
        // Rollup 3+ changed the default from 'compat' to 'default', which
        // stopped unwrapping `.default` on externalized ESM-as-CJS peer
        // deps (e.g. react-select). 'auto' restores that interop safely.
        interop: 'auto',
        globals,
        // Scoped to this output only (rather than pushed into the shared
        // top-level `plugins` below) so minification only ever applies to
        // this one "production" UMD file, never to index.development.cjs or
        // the ESM output below, regardless of NODE_ENV.
        plugins: [terser()],
      },
      {
        name: pkg.name,
        file: path.join(pkg.location, 'lib', 'index.development.cjs'),
        format: 'umd',
        sourcemap: 'inline',
        inlineDynamicImports: true,
        exports: 'named',
        interop: 'auto',
        globals,
      },
      {
        // ESM build for the "module"/"exports" (import condition) fields.
        // Deliberately a single, unminified file — unlike the two UMD
        // outputs above there's no dev/prod split here: ESM `import`
        // statements are static and can't branch on process.env.NODE_ENV
        // the way the CJS shim (see the per-package index.cjs files) does,
        // and shipping unminified ESM for the consuming bundler to minify
        // itself is the standard idiom behind a "module" field anyway.
        // No `name`/`globals`/`interop`: those only affect umd/iife output.
        // Plain `.js`, not `.mjs`: every one of these packages already sets
        // "type": "module", so a .js file here is already parsed as ESM -
        // no extension trick needed (unlike the .cjs files above, which
        // rely on their extension to force CJS parsing despite "type").
        file: path.join(pkg.location, 'lib', 'index.js'),
        format: 'es',
        sourcemap: true,
        inlineDynamicImports: true,
        exports: 'named',
        // The consumer's bundler resolves extracted css, so no manual CSS import needed.
        banner: chunk =>
          chunk.moduleIds.some(scss.hasCss) ? "import './index.css';" : '',
      },
    ],
    context: 'self',
    plugins: [
      peerDepsExternal({
        packageJsonPath: path.join(pkg.location, 'package.json'),
      }),
      nodeResolve({
        browser: true,
        extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
      }),
      svgr({
        svgo: false,
        ref: false,
        titleProp: false,
        jsxRuntime: 'classic',
      }),
      babel({
        babelHelpers: 'runtime',
        configFile: false,
        babelrc: false,
        presets: babelPresets,
        plugins: babelPlugins,
        exclude: /node_modules/,
      }),
      commonjs({
        ignoreGlobal: true,
        include: /node_modules/,
        sourceMap: true,
      }),
      scss,
      json(),
    ],
  };
  return buildConfig;
};
