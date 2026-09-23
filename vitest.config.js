import path from 'path';
import { createRequire } from 'module';
import react from '@vitejs/plugin-react';

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

// Vite plugin unwrapping the packages in `hslFiCjsInteropModules` above.
// Each project that inlines @hsl-fi/* needs its own plugin instance.
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

const nodeProject = name => ({
  test: {
    name,
    root: import.meta.dirname,
    environment: 'node',
    // Caches transformed modules under node_modules/.vitest-cache to speed
    // up reruns; rides along with CI's whole-node_modules cache.
    fsModuleCache: true,
    include: [`${name}/packages/*/test.js`],
  },
});

export default {
  test: {
    // Prints one line per test case (like Mocha's spec reporter), instead
    // of the default reporter's one-line-per-file summary.
    reporters: ['verbose'],
    projects: [
      {
        // The main app suite (test/unit/**). Run alone with `--project app`
        // (see the `test-unit:app`/`test-single` scripts) - doesn't need
        // `workspace-packages-build` first, unlike the projects below.
        plugins: [
          react({
            // babel.config.cjs only adds the `relay` plugin on top of
            // preset-env/preset-react (compiles `graphql`` tagged templates)
            // - everything else plugin-react already handles by default.
            babel: {
              plugins: ['relay'],
            },
          }),
          // App code only ever side-effect-imports stylesheets (no CSS
          // Modules), so stub them to an empty module instead of letting
          // Vite try to compile Sass.
          {
            name: 'digitransit-ui:style-import-stub',
            enforce: 'pre',
            transform(_code, id) {
              if (!/\.s?css$/.test(id)) {
                return undefined;
              }
              return { code: 'export default {};' };
            },
          },
          // See the `hslFiCjsInteropModules` comment above - unwraps the
          // two @hsl-fi/* UMD packages the app imports directly.
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
          // Shares one jsdom environment/module registry per worker instead
          // of recreating it per test file - jsdom env creation is the
          // biggest chunk of this project's test time. Safe here because
          // vitest.setup.js's afterEach already resets shared state (RTL
          // cleanup, localStorage/sessionStorage, mocks via restoreMocks).
          isolate: false,
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
        },
      },
      {
        // Sibling `@digitransit-component/*` imports resolve via
        // node_modules to each package's built lib/index.cjs, a Rollup UMD
        // bundle Vite doesn't auto-unwrap correctly (resolves to the whole
        // exports object, not the default export). Alias every sibling
        // specifier to that package's raw src/index.js instead, consistent
        // with this project testing raw source rather than built output.
        resolve: {
          alias: [
            {
              find: /^@digitransit-component\/(digitransit-component-.+)$/,
              replacement: path.join(
                import.meta.dirname,
                'digitransit-component/packages/$1/src/index',
              ),
            },
          ],
        },
        // @vitejs/plugin-react already handles JSX; the only thing missing
        // versus Rollup's build is inline-react-svg, needed for
        // digitransit-component-icon's raw .svg imports.
        plugins: [
          react({
            // Custom babel plugins opt out of plugin-react's automatic JSX
            // handling, so its JSX preset needs listing explicitly too.
            babel: {
              presets: ['@babel/preset-react'],
              plugins: ['inline-react-svg'],
            },
          }),
          // See the `hslFiCjsInteropModules` comment above - unwraps the
          // @hsl-fi/* UMD packages this project's own components import
          // (directly or transitively).
          hslFiCjsInteropPlugin(),
          // rollup.config.js's postcss plugin treats every .scss import as
          // a CSS module. Vitest's built-in CSS handling (`css: false`
          // below) only does that for `.module.<ext>` files, otherwise
          // stubbing to a plain string - stub every .scss import as an
          // object here instead (`order: 'post'` wins over Vitest's own
          // post-transform).
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
          include: ['digitransit-component/packages/*/test.{js,jsx}'],
        },
      },
      nodeProject('digitransit-search-util'),
      nodeProject('digitransit-store'),
      nodeProject('digitransit-util'),
    ],
  },
};
