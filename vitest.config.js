import path from 'path';
import { createRequire } from 'module';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import relayPlugin from '@digitransit-ui/vite-config/relay';

const require = createRequire(import.meta.url);

// A couple of @hsl-fi/* packages ship old-style webpack UMD bundles whose
// real default export sits one level deeper than a plain require()/import
// sees (e.g. `require('@hsl-fi/modal')` returns `{ default: Modal, ... }`,
// not `Modal`). Vite/Vitest's automatic CJS/ESM interop detection is
// unreliable for these across different module-graph shapes, so unwrap them
// by hand instead (see the `hsl-fi-cjs-interop` plugin below).
const hslFiUtilitiesNamedExports = Object.keys(require('@hsl-fi/utilities'));

const hslFiCjsInteropModules = {
  '@hsl-fi/modal': `
    import { createRequire } from 'module';
    const require = createRequire(import.meta.url);
    const raw = require('@hsl-fi/modal');
    export default raw.default;
  `,
  '@hsl-fi/shimmer': `
    import { createRequire } from 'module';
    const require = createRequire(import.meta.url);
    const raw = require('@hsl-fi/shimmer');
    export default raw.default;
  `,
  '@hsl-fi/utilities': `
    import { createRequire } from 'module';
    const require = createRequire(import.meta.url);
    const unwrapped = require('@hsl-fi/utilities');
    export default unwrapped;
    ${hslFiUtilitiesNamedExports
      .map(key => `export const ${key} = unwrapped[${JSON.stringify(key)}];`)
      .join('\n    ')}
  `,
};

/**
 * Vite plugin unwrapping the packages listed in `hslFiCjsInteropModules`
 * above. Each project that inlines @hsl-fi/* needs its own plugin instance.
 *
 * @returns {import('vite').Plugin}
 */
const hslFiCjsInteropPlugin = () => ({
  name: 'digitransit-ui:hsl-fi-cjs-interop',
  enforce: 'pre',
  resolveId(source) {
    if (source in hslFiCjsInteropModules) {
      return `\0hsl-fi-cjs-interop:${source}`;
    }
    return undefined;
  },
  load(id) {
    if (!id.startsWith('\0hsl-fi-cjs-interop:')) {
      return undefined;
    }
    const source = id.slice('\0hsl-fi-cjs-interop:'.length);
    return hslFiCjsInteropModules[source];
  },
});

// Run by the `server` project below instead of the `app` project.
const serverTestFiles = [
  'test/unit/server/**/*.test.js',
  'test/unit/utils/server/**/*.test.js',
];

const nodeProject = name => ({
  test: {
    name,
    root: import.meta.dirname,
    environment: 'node',
    // Caches transformed modules under node_modules/.vitest-cache to speed
    // up reruns; rides along with CI's whole-node_modules cache.
    fsModuleCache: true,
    include: [`packages/${name}/*/test.js`],
  },
});

export default {
  test: {
    projects: [
      {
        // The main app suite (test/unit/**, minus the server tests).
        plugins: [
          react(),
          relayPlugin(),
          // Stub global stylesheets instead of letting Vite compile Sass.
          // Vitest stubs `.module.scss` itself, with real class names.
          {
            name: 'digitransit-ui:style-import-stub',
            enforce: 'pre',
            transform(_code, id) {
              if (!/\.s?css$/.test(id) || /\.module\.s?css$/.test(id)) {
                return undefined;
              }
              return { code: 'export default {};' };
            },
          },
          hslFiCjsInteropPlugin(),
        ],
        test: {
          name: 'app',
          root: import.meta.dirname,
          environment: 'jsdom',
          // Makes describe/it/expect/vi available without per-file imports.
          // Files that still `import { expect } from 'chai'` are unaffected
          // (a local import shadows a global).
          globals: true,
          // Auto-restores vi.fn()/vi.spyOn() mocks between tests. Needed
          // because a handful of tests use vi.spyOn to stub this repo's own
          // ESM exports, which sinon can't do.
          restoreMocks: true,
          setupFiles: ['./test/unit/helpers/vitest.setup.js'],
          // @hsl-fi/*, @radix-ui/* (under @hsl-fi/dialog|form|notifications|
          // overlays|site-header), and @floating-ui/* (under
          // @radix-ui/react-popper) are normally externalized (resolved via
          // Node, bypassing Vite) for speed. Node's resolver can't match
          // their extensionless `react/jsx-runtime` imports against react's
          // `exports` map, so force these through Vite's own resolver
          // instead. (Not inlining node_modules blanket: other deps, e.g.
          // `uuid`, break under Vite's CJS/ESM interop when inlined.)
          server: {
            deps: {
              inline: [/node_modules\/(@hsl-fi|@radix-ui|@floating-ui)\//],
            },
          },
          // Caches transformed modules under node_modules/.vitest-cache to
          // speed up reruns; rides along with CI's whole-node_modules cache.
          fsModuleCache: true,
          include: ['test/unit/**/*.test.{js,jsx}'],
          exclude: serverTestFiles,
        },
      },
      {
        // Server-side tests (server/** and utils/server/**), run in plain
        // Node rather than jsdom and without the app project's React/Relay
        // setup file - they exercise native-ESM Node code only. Isolated per
        // file (Vitest's default), since several server modules keep
        // module-level state or read process.env at import time.
        test: {
          name: 'server',
          root: import.meta.dirname,
          environment: 'node',
          globals: true,
          // Restore vi.spyOn() spies and clear vi.fn() call history between
          // tests, so module-level vi.mock() fns start each test fresh.
          restoreMocks: true,
          clearMocks: true,
          // Caches transformed modules under node_modules/.vitest-cache to
          // speed up reruns; rides along with CI's whole-node_modules cache.
          fsModuleCache: true,
          include: serverTestFiles,
        },
      },
      {
        // Tests run against raw source, so sibling `@digitransit-component/*`
        // imports are aliased to their src/index instead of the built lib/.
        resolve: {
          alias: [
            {
              find: /^@digitransit-component\/digitransit-component-(.+)$/,
              replacement: path.join(
                import.meta.dirname,
                'packages/digitransit-component/$1/src/index',
              ),
            },
          ],
        },
        // SVGR is needed for digitransit-component-icon's raw .svg imports.
        plugins: [
          svgr({
            include: '**/*.svg',
            svgrOptions: { svgo: false, ref: false, titleProp: false },
          }),
          react(),
          hslFiCjsInteropPlugin(),
        ],
        test: {
          name: 'digitransit-component',
          root: import.meta.dirname,
          environment: 'jsdom',
          // Matches this repo's other stylesheet stubbing; also Vitest's
          // own default, kept explicit for clarity.
          css: false,
          // @hsl-fi/modal (react-modal) needs a real DOM node matching its
          // appElement selector for react-modal's aria-hider.
          environmentOptions: {
            jsdom: { html: '<!DOCTYPE html><div id="app"></div>' },
          },
          // Makes `afterEach` a real global, which is all
          // @testing-library/react's auto-cleanup checks for - gets RTL's
          // per-test cleanup() for free.
          globals: true,
          // @hsl-fi/dialog (pulled in by digitransit-component-dialog-modal,
          // and transitively by MobileView.js in several other packages)
          // and its own @radix-ui/@floating-ui dependencies all ship real
          // ESM builds that statically import the extensionless
          // `react/jsx-runtime` subpath, which this React version's
          // `exports` map doesn't resolve under Node's own strict ESM
          // resolver. Forcing these through Vite's own (more lenient)
          // resolver instead avoids that; the hsl-fi-cjs-interop plugin
          // above handles the resulting default-export unwrap for
          // @hsl-fi/modal, @hsl-fi/shimmer, and @hsl-fi/utilities.
          server: {
            deps: {
              inline: [/node_modules\/(@hsl-fi|@radix-ui|@floating-ui)\//],
            },
          },
          // Caches transformed modules under node_modules/.vitest-cache to
          // speed up reruns; rides along with CI's whole-node_modules cache.
          fsModuleCache: true,
          include: ['packages/digitransit-component/*/test.{js,jsx}'],
        },
      },
      nodeProject('digitransit-search-util'),
      nodeProject('digitransit-store'),
      nodeProject('digitransit-util'),
    ],
  },
};
