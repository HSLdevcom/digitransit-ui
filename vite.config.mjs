import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression2';
import flexbugs from 'postcss-flexbugs-fixes';
import autoprefixer from 'autoprefixer';

const require = createRequire(import.meta.url);
const { getBuildInputs } = require('./scripts/build/contextHelper.js');

const rootDir = import.meta.dirname;
const r = (...p) => path.resolve(rootDir, ...p);
const isProd = process.env.NODE_ENV === 'production';

/**
 * Sass importer that resolves webpack-style `~pkg/...` specifiers (still used
 * inside @hsl-fi/sass and a few component partials) to a filesystem URL. Sass
 * then applies its own partial/extension resolution to what we return.
 */
const tildeSassImporter = {
  findFileUrl(url) {
    if (!url.startsWith('~')) {
      return null;
    }
    const spec = url.slice(1);
    const scoped = spec.startsWith('@');
    const parts = spec.split('/');
    const pkg = scoped ? parts.slice(0, 2).join('/') : parts[0];
    const sub = parts.slice(scoped ? 2 : 1).join('/');
    const pkgRoot = path.dirname(
      require.resolve(`${pkg}/package.json`, { paths: [rootDir] }),
    );
    return new URL(`file://${path.join(pkgRoot, sub)}`);
  },
};

/* --------------------------------------------------------------------------
 * Virtual per-theme SCSS entries, keyed by CONFIG. Replaces the old webpack
 * per-theme entry points. Each `virtual:theme/<name>` becomes an entry that
 * just imports that theme's main.scss, so Vite emits `css/<name>_theme.<hash>.css`
 * and records it in the manifest under the entry name `<name>_theme`.
 * ------------------------------------------------------------------------ */
function digitransitEntries() {
  const THEME = 'virtual:theme/';
  return {
    name: 'digitransit-entries',
    resolveId(id) {
      if (id.startsWith(THEME)) {
        return `\0${id}`;
      }
      return null;
    },
    load(id) {
      if (!id.startsWith(`\0${THEME}`)) {
        return null;
      }
      const name = id.slice(`\0${THEME}`.length);
      let scss = r('sass/themes', name, 'main.scss');
      if (!fs.existsSync(scss)) {
        scss = r('sass/themes/default/main.scss');
      }
      return `import ${JSON.stringify(scss)};\n`;
    },
  };
}

/* --------------------------------------------------------------------------
 * relay-compiler emits CommonJS artifacts (`module.exports = node`). Paired
 * with babel-plugin-relay's `eagerEsModules` (which emits `import` for the
 * `graphql` tags) they need a default export. Rewrite the trailing
 * `module.exports = node;` to `export default node;` so the whole graph is ESM
 * in both dev and build.
 * ------------------------------------------------------------------------ */
function relayArtifactsEsm() {
  return {
    name: 'digitransit-relay-artifacts-esm',
    enforce: 'pre',
    transform(code, id) {
      if (!/__generated__\/.*\.graphql\.js$/.test(id)) {
        return null;
      }
      if (!code.includes('module.exports = node;')) {
        return null;
      }
      return {
        code: code.replace(/module\.exports = node;/, 'export default node;'),
        map: null,
      };
    },
  };
}

/* --------------------------------------------------------------------------
 * Dev-only Relay codegen. Replaces `relay-compiler --watch` (which needs
 * watchman). Runs the one-shot compiler via Vite's own chokidar watcher.
 * ------------------------------------------------------------------------ */
function relayCodegen() {
  const cli = r('node_modules/relay-compiler/cli.js');
  let timer = null;
  const run = () => {
    try {
      execFileSync(process.execPath, [cli], { stdio: 'inherit', cwd: rootDir });
    } catch {
      /* relay-compiler prints its own diagnostics */
    }
  };
  return {
    name: 'digitransit-relay-codegen',
    apply: 'serve',
    buildStart() {
      run();
    },
    configureServer(server) {
      const onChange = file => {
        const f = file.split(path.sep).join('/');
        if (!/\.jsx?$/.test(f) || f.includes('__generated__')) {
          return;
        }
        if (!/\/app\//.test(f)) {
          return;
        }
        let src;
        try {
          src = fs.readFileSync(file, 'utf8');
        } catch {
          return;
        }
        if (!/graphql`/.test(src)) {
          return;
        }
        clearTimeout(timer);
        timer = setTimeout(run, 200);
      };
      server.watcher.on('change', onChange);
      server.watcher.on('add', onChange);
    },
  };
}

/* --------------------------------------------------------------------------
 * Service worker (prod only). Replaces offline-plugin + app/util/font-sw.js.
 * The `__ASSET_URL__/` prefix on precache urls is rewritten to the runtime
 * ASSET_URL (or '') by server/server.js when it serves /sw.js.
 * ------------------------------------------------------------------------ */
const pwaOptions = {
  strategies: 'generateSW',
  registerType: 'autoUpdate',
  injectRegister: null, // registered manually from app/client.js
  filename: 'sw.js',
  outDir: r('_static'),
  manifest: false, // web app manifest is produced by scripts/generate-favicons.js
  devOptions: { enabled: false }, // no service worker in dev (matches old behaviour)
  workbox: {
    globDirectory: r('_static'),
    globPatterns: [
      'js/**/*.js',
      'css/**/*.css',
      'assets/**/*.{svg,woff,woff2}',
    ],
    globIgnores: [
      '**/*.map',
      '**/*.txt',
      '**/*.gz',
      '**/*.br',
      'stats.json',
      'manifest.json',
      '.vite/**',
      'js/*_theme*.js',
      'js/*_sprite*.js',
      'assets/iconstats-*.json',
      'assets/icons-*/**',
      'sw.js',
      'workbox-*.js',
    ],
    navigateFallback: null, // not a SPA: every navigation must hit the Express shell
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // some vendor chunks are >2 MiB
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
    sourcemap: false,
    manifestTransforms: [
      manifestEntries => ({
        manifest: manifestEntries.map(e => ({
          ...e,
          url: `__ASSET_URL__/${e.url}`,
        })),
        warnings: [],
      }),
    ],
    runtimeCaching: [
      {
        // replaces app/util/font-sw.js
        urlPattern: /^https:\/\/cloud\.typography\.com\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'font-cache-v1',
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // replaces offline-plugin `externals` (HSL font CSS)
        urlPattern:
          /^https:\/\/prod\.hslfi\.hsldev\.com\/fonts\/.*\.css(\?.*)?$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'hsl-font-css',
          expiration: { maxEntries: 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // replaces offline-plugin `externals` (Google Fonts woff2)
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*\.woff2(\?.*)?$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts',
          expiration: { maxEntries: 40 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // was offline-plugin optional: *.png under assets/
        urlPattern: ({ url }) =>
          url.pathname.startsWith('/assets/') && url.pathname.endsWith('.png'),
        handler: 'CacheFirst',
        options: {
          cacheName: 'img',
          expiration: { maxEntries: 100 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // was offline-plugin optional: assets/geojson/*.geojson
        urlPattern: ({ url }) => url.pathname.startsWith('/assets/geojson/'),
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'geojson',
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
};

export default defineConfig({
  root: rootDir,
  base: './',
  publicDir: false, // _static is owned by the `static` script + prebuild scripts
  appType: 'custom',
  clearScreen: false,

  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.json'],
    mainFields: ['browser', 'module', 'jsnext:main', 'main'],
    alias: [
      { find: /^lodash$/, replacement: 'lodash-es' },
      { find: /^lodash\/(.*)$/, replacement: 'lodash-es/$1' },
      { find: /^lodash\.merge$/, replacement: 'lodash-es/merge' },
      // This workspace meta-package's package.json `main`/`module` point at
      // files that don't exist (`digitransit-util` / `digitransit-util.mjs`);
      // webpack silently fell back to `index.mjs`, Rollup errors. Sub-packages
      // (`@digitransit-util/digitransit-util-*`) resolve fine on their own.
      {
        find: /^@digitransit-util\/digitransit-util$/,
        replacement: r('digitransit-util/packages/digitransit-util/index.mjs'),
      },
      { find: /^net$/, replacement: r('scripts/build/empty.js') },
      { find: /^tls$/, replacement: r('scripts/build/empty.js') },
      // webpack shimmed the Node stream/Buffer stack `mqtt` v4 needs; use its
      // self-contained browserify UMD bundle instead (lazy-loaded for real-time
      // vehicle positions in app/util/mqttClient.js).
      { find: /^mqtt$/, replacement: r('node_modules/mqtt/dist/mqtt.min.js') },
    ],
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(
      isProd ? 'production' : 'development',
    ),
    // A few client-reachable modules read these off `process.env`; webpack's
    // node `process` shim made them `undefined` in the browser. Match that.
    'process.env.RUN_ENV': 'undefined',
    'process.env.SURVEY_SHARE': 'undefined',
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        importers: [tildeSassImporter],
        loadPaths: [r('node_modules/foundation-sites/scss')],
        quietDeps: true,
        silenceDeprecations: [
          'import',
          'global-builtin',
          'color-functions',
          'if-function',
        ],
      },
    },
    postcss: {
      plugins: isProd ? [flexbugs, autoprefixer()] : [],
    },
  },

  optimizeDeps: {
    // Force the digitransit-* workspace packages through the dep optimizer:
    // they are symlinked (so Vite treats them as source and skips them) but
    // their `lib/` output is UMD, which breaks named imports unless pre-bundled.
    include: [
      '@digitransit-component/digitransit-component-autosuggest',
      '@digitransit-component/digitransit-component-autosuggest-panel',
      '@digitransit-component/digitransit-component-control-panel',
      '@digitransit-component/digitransit-component-datetimepicker',
      '@digitransit-component/digitransit-component-favourite-bar',
      '@digitransit-component/digitransit-component-favourite-editing-modal',
      '@digitransit-component/digitransit-component-favourite-modal',
      '@digitransit-component/digitransit-component-icon',
      '@digitransit-component/digitransit-component-traffic-now-link',
      '@digitransit-search-util/digitransit-search-util-distance',
      '@digitransit-search-util/digitransit-search-util-get-geocoding-results',
      '@digitransit-search-util/digitransit-search-util-get-json',
      '@digitransit-search-util/digitransit-search-util-get-label',
      '@digitransit-search-util/digitransit-search-util-query-utils',
      '@digitransit-search-util/digitransit-search-util-route-name-compare',
      '@digitransit-search-util/digitransit-search-util-suggestion-to-location',
      '@digitransit-search-util/digitransit-search-util-uniq-by-label',
      '@digitransit-store/digitransit-store-future-route',
      '@digitransit-util/digitransit-util-enrich-patterns',
      'mqtt', // pre-bundled UMD (see resolve.alias) — pre-bundle for CJS interop
    ],
    esbuildOptions: {
      loader: { '.js': 'jsx' },
      define: { global: 'globalThis' },
    },
  },

  plugins: [
    react({
      jsxRuntime: 'classic',
      babel: {
        babelrc: false,
        configFile: false,
        plugins: [
          // eagerEsModules: emit `import x from './__generated__/x.graphql'`
          // instead of `require(...)`, which has no meaning in the ESM bundle.
          ['babel-plugin-relay', { eagerEsModules: true }],
          // @vitejs/plugin-react only auto-adds the JSX transform for classic
          // runtime when the file ends in `x`. This project keeps JSX in `.js`,
          // so add it explicitly (classic runtime => React.createElement).
          ['@babel/plugin-transform-react-jsx', { runtime: 'classic' }],
          '@babel/plugin-transform-react-display-name',
        ],
      },
    }),
    relayArtifactsEsm(),
    digitransitEntries(),
    relayCodegen(),
    legacy({
      renderModernChunks: true,
      modernPolyfills: false,
    }),
    // VitePWA is included in dev too so `virtual:pwa-register` resolves;
    // devOptions.enabled is false so no service worker is served in dev.
    VitePWA(pwaOptions),
    ...(isProd
      ? [
          compression({
            algorithm: 'gzip',
            include: /\.(js|css|html|svg|ico)$/i,
            filename: '[path][base].gz',
            threshold: 0,
            skipIfLargerOrEqual: true,
          }),
          compression({
            algorithm: 'brotliCompress',
            include: /\.(js|css|html|svg|ico)$/i,
            filename: '[path][base].br',
            threshold: 0,
            skipIfLargerOrEqual: true,
          }),
        ]
      : []),
  ],

  build: {
    outDir: r('_static'),
    emptyOutDir: false,
    assetsDir: 'assets',
    manifest: true,
    sourcemap: true,
    // The digitransit-* workspace packages are symlinked into node_modules but
    // their `lib/` output is a UMD bundle living outside node_modules, so Vite's
    // commonjs interop skips it by default and named imports fail. Opt them in.
    commonjsOptions: {
      include: [
        /node_modules/,
        /digitransit-(component|search-util|util|store)[/\\]packages[/\\]/,
      ],
      transformMixedEsModules: true,
    },
    // build.target is left to @vitejs/plugin-legacy (it controls the modern
    // target and emits the nomodule bundle from `browserslist`).
    cssCodeSplit: true,
    modulePreload: { polyfill: true },
    rollupOptions: {
      input: getBuildInputs(),
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[hash].js',
        assetFileNames: info => {
          const n = info.names?.[0] || info.name || '';
          return n.endsWith('.css')
            ? 'css/[name].[hash][extname]'
            : 'assets/[name].[hash][extname]';
        },
        manualChunks(id) {
          const n = id.split(path.sep).join('/');
          if (
            /\/node_modules\/(react|react-dom|react-relay|relay-runtime)\//.test(
              n,
            )
          ) {
            return 'react';
          }
          if (
            /\/node_modules\/@hsl-fi\//.test(n) ||
            /\/node_modules\/@digitransit-(component|search-util|util)\//.test(
              n,
            ) ||
            /\/digitransit-(component|search-util|util)\/packages\//.test(n)
          ) {
            return 'digitransit-components';
          }
          return undefined;
        },
      },
    },
  },
});
