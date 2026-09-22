import path from 'path';
import { createRequire } from 'module';
import react from '@vitejs/plugin-react';

// This config lives under config/ (like config/vitest.config.js and
// config/babel.config.cjs) rather than the repo root, so `root` must be set
// explicitly - otherwise Vitest would resolve include globs relative to this
// directory instead of the repo root.
const repoRoot = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);

// A couple of @hsl-fi/* packages ship old-style webpack UMD bundles
// (`!function(t,o){...}` wrappers) whose real default export sits one level
// deeper than what a plain `require()`/`import` sees - e.g.
// `require('@hsl-fi/modal')` returns `{ default: Modal,
// MODAL_MOBILE_BREAKPOINT, ... }`, not `Modal` itself. Compiled/bundled app
// code (webpack/Babel) applies this same double-unwrap automatically via
// `_interopRequireDefault`; Vite/Vitest's own equivalent mechanism (the SSR
// dep optimizer's `needsInterop` detection, tried first here) works when
// tested in isolation but was found to be inconsistent across different
// module-graph shapes/import orders in this suite (surfacing as `Modal`
// intermittently resolving to the raw UMD exports object instead of the
// component function). These packages are both imported directly by app
// source (`grep -rn "from '@hsl-fi/(modal|utilities)'" app/`) and required
// transitively via genuine ESM `import { X } from '@hsl-fi/utilities'`
// syntax by other, newer @hsl-fi/* ESM packages (e.g. @hsl-fi/form) - so
// sidestep the problem deterministically for these with an explicit
// virtual-module plugin doing the unwrap by hand (see the
// `hsl-fi-cjs-interop` plugin below) and re-exporting every real named
// export, rather than relying on Vite's automatic (but here unreliable)
// interop detection.
const hslFiUtilitiesNamedExports = Object.keys(require('@hsl-fi/utilities'));

const hslFiCjsInteropModules = {
  '@hsl-fi/modal': `
    import { createRequire } from 'module';
    const require = createRequire(import.meta.url);
    const raw = require('@hsl-fi/modal');
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

export default {
  // known pending exception to the project's .jsx-for-JSX convention - see
  // docs/Architecture.md / the repo's code conventions). Vite/esbuild only
  // parses JSX syntax for files it treats with the 'jsx' loader, which by
  // default only applies to .jsx/.tsx - force it for this suite's .test.js
  // files specifically, both for the dev/transform path (esbuild.include)
  // and dependency pre-bundling (optimizeDeps.esbuildOptions.loader).
  esbuild: {
    loader: 'jsx',
    // Vite's default esbuild include (`/\.(m?ts|[jt]sx)$/`) already covers
    // real .jsx/.tsx source files; add test/unit/*.test.js on top of that
    // default rather than replacing it, since test/unit/**/*.test.js files
    // contain JSX despite the .js extension (a known pending exception to
    // the project's .jsx-for-JSX convention - see docs/Architecture.md / the
    // repo's code conventions).
    include: /\.(m?ts|[jt]sx)$|test\/unit\/.*\.js$/,
    // Vite's esbuild plugin excludes .js from its own JSX-capable filter by
    // default (assuming JSX only lives in .jsx/.tsx) - override so the
    // `include` regex above actually takes effect for test/unit/*.test.js.
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  test: {
    name: 'app',
    root: repoRoot,
    environment: 'jsdom',
    // Makes describe/it/expect/vi (etc.) available without per-file imports,
    // consistent with the digitransit-component Vitest project in
    // config/vitest.config.js. Test files that still `import { expect } from
    // 'chai'` are unaffected (a local import always shadows a global), and
    // test/unit/helpers/vitest.setup.js re-points the global `expect` at
    // chai's for the files that rely on the old Mocha global.
    globals: true,
    // Auto-restores any vi.fn()/vi.spyOn() mocks between tests, mirroring
    // sinon-sandbox `.restore()` calls that test files already do for their
    // own sinon stubs. Needed because a handful of tests use vi.spyOn (not
    // sinon) to stub this repo's own ESM exports — sinon.stub can't do that
    // reliably (see vitest.setup.js comment near the top for why).
    restoreMocks: true,
    setupFiles: [path.join(repoRoot, 'test/unit/helpers/vitest.setup.js')],
    // Some deps reachable from @hsl-fi/* (@hsl-fi itself, @radix-ui/*
    // underneath @hsl-fi/dialog|form|notifications|overlays|site-header,
    // and @floating-ui/* underneath @radix-ui/react-popper) are normally
    // "externalized" (imported straight via Node's own ESM resolver,
    // bypassing Vite) for speed. That resolver can't match their
    // extensionless `react/jsx-runtime` subpath imports against react's
    // `exports` map ("Cannot find module react/jsx-runtime"), where Vite's
    // own (more lenient) dev-server resolution can - force these specific
    // scopes through Vite's pipeline instead. (Not inlining node_modules
    // blanket: some other deps, e.g. `uuid`, break under Vite's default
    // CJS/ESM interop when inlined, so keep this scoped rather than
    // blanket `true`.)
    server: {
      deps: {
        inline: [/node_modules\/(@hsl-fi|@radix-ui|@floating-ui)\//],
      },
    },
    // Persists transformed modules under node_modules/.vitest-cache (keyed
    // by content/plugin hashes, so it self-invalidates on source or config
    // changes) and speeds up reruns - transforms are otherwise redone every
    // time. Rides along with CI's existing whole-node_modules cache too.
    fsModuleCache: true,
    include: ['test/unit/**/*.test.js'],
  },
  plugins: [
    react({
      // The app's own Babel config (babel.config.cjs) only adds the `relay`
      // plugin on top of preset-env/preset-react (compiles `graphql``
      // tagged templates into the generated __generated__ modules that
      // relay-compiler produces) - everything else preset-react/plugin-react
      // already handles by default.
      babel: {
        plugins: ['relay'],
      },
    }),
    // Matches the previous Mocha suite's require.extensions['.css'/'.scss']
    // no-ops (test/unit/helpers/babel-register.cjs): app code only ever
    // side-effect-imports stylesheets (no CSS Modules usage), so stubbing
    // them to an empty module is enough to avoid Vite trying to actually
    // parse/compile Sass.
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
    // See the `hslFiCjsInteropModules` comment above - deterministically
    // fixes default-export interop for the two @hsl-fi/* UMD packages the
    // app imports directly, sidestepping Vite/Vitest's own (here unreliable
    // across different module-graph shapes) automatic CJS/ESM interop.
    {
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
    },
  ],
};
