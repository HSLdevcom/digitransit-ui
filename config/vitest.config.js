const path = require('path');
const react = require('@vitejs/plugin-react');

// One Vitest config for every in-repo suite, exposed as projects:
//   - digitransit-component / -search-util / -store / -util : the workspace
//     packages (`yarn workspace-packages-test`, run with `--project '!app'`)
//   - app : the former Mocha suite under test/unit/** (`yarn test-unit:app`,
//     run with `--project app`)
// This config lives under config/ (like babel.config.js and rollup.config.js)
// rather than the repo root, so `root` must be set explicitly on every
// project - otherwise Vitest would resolve include globs relative to this
// directory instead of the repo root.
const repoRoot = path.resolve(__dirname, '..');
const r = p => path.join(repoRoot, p);

// --- shared building blocks -------------------------------------------------

// config/rollup.config.js's postcss plugin treats every .scss import as a CSS
// module (`modules: true`, unconditional - not gated by a `.module.scss`
// filename). Vitest's own built-in CSS handling (active via `css: false`
// below) only recognizes `.module.<ext>`-named files as CSS modules and
// otherwise stubs the import to `export default ""` - a plain string, not the
// object components expect (e.g. `styles['some-class']`). Stub every .s?css
// import as a class-name-echoing object instead, overriding Vitest's own
// post-transform (`order: 'post'` needed since both run in the "post" phase
// and the last transform wins).
const cssModuleStubPlugin = () => ({
  name: 'vitest:css-module-stub',
  enforce: 'post',
  transform: {
    order: 'post',
    handler(_code, id) {
      if (!/\.s?css$/.test(id.split('?')[0])) {
        return undefined;
      }
      return {
        code: 'export default new Proxy(Object.create(null), { get: (_, prop) => prop });',
      };
    },
  },
});

// @vitejs/plugin-react already handles JSX; providing custom babel plugins
// opts out of plugin-react's automatic JSX handling, so its JSX preset has to
// be listed explicitly too. `inline-react-svg`: digitransit-component-icon
// (aliased to raw src) and app/**'s .svg imports resolve as components.
// `relay`: the app's `graphql``` literals need babel-plugin-relay (the real
// webpack build does the same); the workspace packages don't use it.
const reactPlugin = ({ relay = false } = {}) =>
  react({
    babel: {
      presets: ['@babel/preset-react'],
      plugins: relay ? ['relay', 'inline-react-svg'] : ['inline-react-svg'],
    },
  });

// Sibling `@digitransit-component/*` imports (e.g.
// digitransit-component-datetimepicker importing digitransit-component-icon in
// its own src/index.js) otherwise resolve via node_modules to each sibling's
// built lib/index.cjs - a Rollup UMD bundle with an
// `e.default = Component; e.__esModule = true` shape that neither Node's plain
// require() nor Vite's CJS interop auto-unwraps for a symlinked workspace
// package, so `import Icon from '@digitransit-component/digitransit-component-icon'`
// silently resolves to the whole exports object instead of the component.
// Alias every sibling specifier straight to that package's raw src/index.js.
const digitransitComponentSrcAlias = {
  find: /^@digitransit-component\/(digitransit-component-.+)$/,
  replacement: r('digitransit-component/packages/$1/src/index.js'),
};

// app/config.js loads a region config with a runtime
// `require(`./configurations/config.${configName}`)`. Under Vitest that
// `require` is Node's own (createRequire), so on Node >=22 it loads the ESM
// config file natively - and the native ESM resolver then rejects that file's
// own extensionless imports (`import { isDevRunEnv } from '../util/envUtils'`).
// The Mocha suite avoided this because @babel/register transformed the file on
// require. Rewrite just that one call site to `import.meta.glob` so the region
// configs go through Vite's transform pipeline like every other app module.
// Test-only: the real webpack build keeps the dynamic require.
const configRegionGlobPlugin = () => ({
  name: 'vitest:config-region-glob',
  transform(code, id) {
    if (!id.replace(/\\/g, '/').endsWith('/app/config.js')) {
      return undefined;
    }
    const rewritten = code.replace(
      /require\(\s*`\.\/configurations\/config\.\$\{configName\}`\s*,?\s*\)\.default/,
      // eslint-disable-next-line no-template-curly-in-string -- emitted as code
      "import.meta.glob('./configurations/config.*.js', { eager: true })[`./configurations/config.${configName}.js`].default",
    );
    return rewritten === code ? undefined : { code: rewritten };
  },
});

// Persists transformed modules under node_modules/.vitest-cache (keyed by
// content/plugin hashes, so it self-invalidates on source or config changes)
// and speeds up reruns - transforms are otherwise redone every time. Rides
// along with CI's existing whole-node_modules cache too.
const nodeProject = name => ({
  test: {
    name,
    root: repoRoot,
    environment: 'node',
    fsModuleCache: true,
    include: [`${name}/packages/*/test.js`],
  },
});

// --- projects ------------------------------------------------------------- --

module.exports = {
  test: {
    projects: [
      {
        resolve: { alias: [digitransitComponentSrcAlias] },
        plugins: [reactPlugin(), cssModuleStubPlugin()],
        test: {
          name: 'digitransit-component',
          root: repoRoot,
          environment: 'jsdom',
          // Matches today's CSS-stubbing behaviour; also Vitest's own default,
          // kept explicit for clarity.
          css: false,
          // @hsl-fi/modal (react-modal) needs a real DOM node matching its
          // appElement selector for react-modal's aria-hider - set as the
          // jsdom environment's initial document instead of a setup file.
          environmentOptions: {
            jsdom: { html: '<!DOCTYPE html><div id="app"></div>' },
          },
          // Makes `afterEach` (among others) a real global, which is all
          // @testing-library/react's own auto-cleanup checks for - gets RTL's
          // per-test cleanup() for free instead of registering it manually.
          globals: true,
          fsModuleCache: true,
          include: ['digitransit-component/packages/*/test.js'],
        },
      },
      nodeProject('digitransit-search-util'),
      nodeProject('digitransit-store'),
      nodeProject('digitransit-util'),
      {
        // The former Mocha suite under test/unit/**, now native Vitest:
        // jsdom + Enzyme (via test/unit/helpers/) exercising the app's own
        // module graph. Vite's transform pipeline replaces what
        // babel-esm-loader.mjs / babel-register.js / init.js used to do.
        resolve: {
          // Context libs must resolve to a single instance or `useRouter()` /
          // `useIntl()` read a different context than the provider writes.
          dedupe: ['react', 'react-dom', 'react-intl', 'react-relay', 'found'],
          alias: [
            digitransitComponentSrcAlias,
            {
              find: /^@digitransit-store\/(digitransit-store-.+)$/,
              replacement: r('digitransit-store/packages/$1/src/index.js'),
            },
            {
              find: /^@digitransit-util\/digitransit-util$/,
              replacement: r(
                'digitransit-util/packages/digitransit-util/index.mjs',
              ),
            },
            {
              find: /^@digitransit-util\/(digitransit-util-.+)$/,
              replacement: r('digitransit-util/packages/$1/index.js'),
            },
            // @hsl-fi/dialog: interactive stub - 6 tests assert dialog markup
            // and Escape handling. @hsl-fi/form + @hsl-fi/site-header: the real
            // packages drag in large @radix-ui / react-imask trees the unit
            // tests never exercise. @hsl-fi/button, /modal and
            // /container-spinner are legacy Rollup UMD bundles whose
            // `export default` interop Vite doesn't unwrap for a symlinked dep.
            // Every other @hsl-fi/* package (layout-primitives, navigation,
            // icons, site-footer, utilities, content-delivery-api-types) loads
            // for real - its bundled CSS is neutralised by cssModuleStubPlugin.
            {
              find: /^@hsl-fi\/dialog$/,
              replacement: r('test/unit/helpers/stubs/hsl-fi-dialog.js'),
            },
            {
              find: /^@hsl-fi\/form$/,
              replacement: r('test/unit/helpers/stubs/hsl-fi-form.js'),
            },
            {
              find: /^@hsl-fi\/site-header$/,
              replacement: r('test/unit/helpers/stubs/hsl-fi-site-header.js'),
            },
            {
              find: /^@hsl-fi\/button$/,
              replacement: r('test/unit/helpers/stubs/hsl-fi-button.js'),
            },
            {
              find: /^@hsl-fi\/modal$/,
              replacement: r('test/unit/helpers/stubs/hsl-fi-modal.js'),
            },
            {
              find: /^@hsl-fi\/container-spinner$/,
              replacement: r(
                'test/unit/helpers/stubs/hsl-fi-container-spinner.js',
              ),
            },
          ],
        },
        plugins: [
          reactPlugin({ relay: true }),
          cssModuleStubPlugin(),
          configRegionGlobPlugin(),
        ],
        test: {
          name: 'app',
          root: repoRoot,
          environment: 'jsdom',
          environmentOptions: { jsdom: { url: 'https://localhost:8080' } },
          css: false,
          globals: true,
          fsModuleCache: true,
          // Restore every spy before each test (replaces the old per-suite
          // sinon sandboxes; helpers/vitest.setup.js re-installs its
          // suite-wide spies in a beforeEach for the same reason).
          restoreMocks: true,
          setupFiles: [r('test/unit/helpers/vitest.setup.js')],
          include: ['test/unit/**/*.test.js'],
          // These packages ship untranspiled / extensionless ESM that Vite
          // must transform rather than externalise.
          server: {
            deps: {
              inline: [
                'react-relay',
                'react-leaflet',
                /@digitransit-/,
                /@hsl-fi\//,
                'found',
                'farce',
              ],
            },
          },
        },
      },
    ],
  },
};
