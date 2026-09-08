const path = require('path');
const fs = require('fs');
const autoprefixer = require('autoprefixer');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const { babel } = require('@rollup/plugin-babel');
const json = require('@rollup/plugin-json');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const terser = require('@rollup/plugin-terser').default;

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  classnames: 'cx',
  'prop-types': 'PropTypes',
  'react-is': 'react-is',
  i18next: 'i18next',
  'react-i18next': 'reactI18next',
  'react-sortablejs': 'reactSortablejs',
  'react-modal': 'ReactModal',
  '@hsl-fi/modal': 'Modal',
  '@hsl-fi/shimmer': 'Shimmer',
  '@hsl-fi/loading-indicators': 'LoadingIndicators',
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
  'react-relay': 'reactRelay',
  downshift: 'downshift',
  luxon: 'luxon',
  'react-select': 'Select',
};

/**
 * This config builds a single package: the one whose directory is the
 * current working directory. It's designed to be run per-package via
 * `lerna run build --scope ...` (each package's own "build" script invokes
 * `rollup -c <path-to-this-file>` from within its own directory), so that
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
  return { name: pkg.name, location: packageDir };
}

module.exports = () => {
  const pkg = getPackage();
  let input = path.join(pkg.location, 'src/index.js');
  if (!fs.existsSync(input)) {
    input = path.join(pkg.location, 'index.js');
  }
  const buildConfig = {
    input,
    output: [
      {
        name: pkg.name,
        dir: path.join(pkg.location, 'lib'),
        format: 'umd',
        sourcemap: true,
        inlineDynamicImports: true,
        exports: 'named',
        // Rollup 3+ changed the default from 'compat' to 'default', which
        // stopped unwrapping `.default` on externalized ESM-as-CJS peer
        // deps (e.g. react-select). 'auto' restores that interop safely.
        interop: 'auto',
        globals,
      },
      {
        name: pkg.name,
        file: path.join(pkg.location, 'lib', 'index.development.js'),
        format: 'umd',
        sourcemap: 'inline',
        inlineDynamicImports: true,
        exports: 'named',
        interop: 'auto',
        globals,
      },
    ],
    context: 'self',
    plugins: [
      peerDepsExternal({
        packageJsonPath: path.join(pkg.location, 'package.json'),
      }),
      nodeResolve({ browser: true }),
      babel({
        babelHelpers: 'runtime',
        // Absolute path: this config now runs with cwd set to the
        // package being built, not the repo root, so a relative path
        // here would no longer resolve correctly.
        configFile: path.join(__dirname, 'babel.config.js'),
        exclude: /node_modules/,
      }),
      commonjs({
        ignoreGlobal: true,
        include: /node_modules/,
        sourceMap: true,
      }),
      postcss({
        extract: false,
        plugins: [autoprefixer()],
        modules: true,
        use: [
          [
            'sass',
            {
              quietDeps: true,
              silenceDeprecations: [
                'import',
                'global-builtin',
                'color-functions',
              ],
            },
          ],
        ],
        config: false,
      }),
      json(),
    ],
  };
  if (process.env.NODE_ENV === 'production') {
    buildConfig.plugins.push(terser());
  }
  return buildConfig;
};
