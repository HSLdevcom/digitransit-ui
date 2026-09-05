const path = require('path');
const react = require('@vitejs/plugin-react');

// This config lives under config/ (like babel.config.js and rollup.config.js)
// rather than the repo root, so `root` must be set explicitly - otherwise
// Vitest would resolve include globs relative to this directory instead of
// the repo root.
const repoRoot = path.resolve(__dirname, '..');

const nodeProject = (name, family) => ({
  test: {
    name,
    root: repoRoot,
    environment: 'node',
    // Persists transformed modules under node_modules/.vitest-cache (keyed
    // by content/plugin hashes, so it self-invalidates on source or config
    // changes) and speeds up reruns - transforms are otherwise redone every
    // time. Rides along with CI's existing whole-node_modules cache too.
    fsModuleCache: true,
    include: [`digitransit-${family}/packages/*/test.js`],
  },
});

module.exports = {
  test: {
    projects: [
      {
        // Sibling `@digitransit-component/*` imports (e.g.
        // digitransit-component-datetimepicker importing
        // digitransit-component-icon in its own src/index.js, as real
        // production code) resolve via node_modules to each sibling's
        // built lib/index.cjs. That's a Rollup UMD bundle with an
        // `e.default = Component; e.__esModule = true` shape - Node's
        // plain require() needs a manual `.default` unwrap for it (as the
        // old Mocha tests did), but Vite's own CJS interop for a
        // symlinked workspace package does not auto-unwrap it either, so
        // `import Icon from '@digitransit-component/digitransit-component-icon'`
        // silently resolves to the whole UMD exports object instead of the
        // component - not a crash, just a wrong value, so it only surfaces
        // once something tries to render/call it. Alias every sibling
        // specifier straight to that package's raw src/index.js instead,
        // consistent with this project already testing raw source rather
        // than the built artifact.
        resolve: {
          alias: [
            {
              find: /^@digitransit-component\/(digitransit-component-.+)$/,
              replacement: path.join(
                repoRoot,
                'digitransit-component/packages/$1/src/index.js',
              ),
            },
          ],
        },
        // @vitejs/plugin-react already handles JSX; the only thing it's
        // missing versus Rollup's build is inline-react-svg, needed for
        // digitransit-component-icon's raw .svg imports. Adding just that
        // one plugin (rather than reusing config/babel.config.js wholesale)
        // keeps plugin-react's own sensible defaults - notably preserving
        // ESM output, which config/babel.config.js's `modules: 'auto'`
        // preset-env otherwise mis-detects as CJS under Vitest's loader.
        plugins: [
          react({
            // Providing custom babel plugins opts out of plugin-react's own
            // automatic JSX handling, so its JSX preset has to be listed
            // explicitly too - otherwise inline-react-svg's JSX output (and
            // any JSX in src/index.js itself) is left untransformed.
            babel: {
              presets: ['@babel/preset-react'],
              plugins: ['inline-react-svg'],
            },
          }),
          // config/rollup.config.js's postcss plugin treats every .scss
          // import as a CSS module (`modules: true`, unconditional - not
          // gated by a `.module.scss` filename). Vitest's own built-in CSS
          // handling (active via `css: false` below) only recognizes
          // `.module.<ext>`-named files as CSS modules and otherwise stubs
          // the import to `export default ""` - a plain string, not the
          // object components expect (e.g. `styles['some-class']`). Stub
          // every .scss import as an object here instead, overriding
          // Vitest's own post-transform (`order: 'post'` needed since both
          // run in the "post" phase and the last transform wins).
          {
            name: 'digitransit-component:css-module-stub',
            enforce: 'post',
            transform: {
              order: 'post',
              handler(_code, id) {
                if (!/\.s?css$/.test(id)) {
                  return undefined;
                }
                return {
                  code: 'export default new Proxy(Object.create(null), { get: (_, prop) => prop });',
                };
              },
            },
          },
        ],
        test: {
          name: 'digitransit-component',
          root: repoRoot,
          environment: 'jsdom',
          // Matches today's CSS-stubbing behaviour (Babel-register stubs
          // .css/.scss requires as no-ops for the main app's Mocha suite);
          // this is also Vitest's own default, kept explicit for clarity.
          css: false,
          // @hsl-fi/modal (react-modal) needs a real DOM node matching its
          // appElement selector for react-modal's aria-hider - set as the
          // jsdom environment's initial document instead of a setup file.
          environmentOptions: {
            jsdom: { html: '<!DOCTYPE html><div id="app"></div>' },
          },
          // Makes `afterEach` (among others) a real global, which is all
          // @testing-library/react's own auto-cleanup checks for (see
          // its dist/index.js) - gets RTL's per-test cleanup() for free
          // instead of registering it manually in a setup file.
          globals: true,
          // Persists transformed modules under node_modules/.vitest-cache
          // (keyed by content/plugin hashes, so it self-invalidates on
          // source or config changes) and speeds up reruns - transforms are
          // otherwise redone every time. Rides along with CI's existing
          // whole-node_modules cache too.
          fsModuleCache: true,
          include: ['digitransit-component/packages/*/test.js'],
        },
      },
      nodeProject('digitransit-search-util', 'search-util'),
      nodeProject('digitransit-store', 'store'),
      nodeProject('digitransit-util', 'util'),
    ],
  },
};
