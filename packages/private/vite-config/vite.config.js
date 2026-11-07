import fs from 'node:fs';
import path from 'node:path';
import browserslist from 'browserslist';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import { browserslistToTargets } from 'lightningcss';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import relay from './relay.js';

const ENTRY_CANDIDATES = ['src/index.js', 'src/index.jsx'];

/**
 * Builds the package in the current working directory as an ESM library:
 * `lib/index.js`, plus `lib/index.css` (imported by `lib/index.js`) if it
 * has styles. Every dependency and peer dependency stays external.
 * Run through the package's own `vite.config.js`, e.g. by `yarn build`.
 */
export default function defineLibraryConfig() {
  const packageDir = process.cwd();
  const pkg = JSON.parse(
    fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'),
  );
  const entry = ENTRY_CANDIDATES.map(file => path.join(packageDir, file)).find(
    file => fs.existsSync(file),
  );
  if (!entry) {
    throw new Error(`${pkg.name} has no ${ENTRY_CANDIDATES.join(' or ')}`);
  }
  // The consumer's bundler has to see the CSS import, so it isn't a
  // side-effect free module.
  const hasCss = [pkg.sideEffects].flat().includes('**/*.css');
  const externals = Object.keys({
    ...pkg.dependencies,
    ...pkg.peerDependencies,
  });
  const browsers = browserslist(undefined, { path: packageDir });
  // `@digitransit-component/digitransit-component-icon` ->
  // `digitransit-component-icon`, i.e. family and package.
  const unscopedName = pkg.name.split('/').pop();

  return {
    // packages/, so CSS Module hashes, which come from the root-relative
    // path, include the family and package, e.g. `digitransit-component/icon`.
    root: path.resolve(packageDir, '../..'),
    resolve: {
      // @hsl-fi/sass imports its own partials webpack-style (`~@hsl-fi/...`).
      alias: [{ find: /^~/, replacement: '' }],
    },
    plugins: [
      svgr({
        include: '**/*.svg',
        svgrOptions: { svgo: false, ref: false, titleProp: false },
      }),
      react(),
      relay(),
      {
        name: 'digitransit-ui:check-css',
        // Vite emits the CSS asset in its own late generateBundle hook.
        writeBundle(_, bundle) {
          const emitsCss = Object.keys(bundle).some(file =>
            file.endsWith('.css'),
          );
          if (emitsCss !== hasCss) {
            this.error(
              `${pkg.name} ${emitsCss ? 'has' : 'has no'} styles, so ` +
                `package.json must ${emitsCss ? '' : 'not '}declare ` +
                '"sideEffects": ["**/*.css"]',
            );
          }
        },
      },
    ],
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        targets: browserslistToTargets(browsers),
        // The name makes classes readable; the hash keeps them unique. Keep
        // `[local]`: the app matches some class names by substring.
        cssModules: { pattern: `${unscopedName}_[local]_[hash]` },
      },
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
        },
      },
    },
    build: {
      lib: {
        entry,
        formats: ['es'],
        fileName: 'index',
        cssFileName: 'index',
      },
      outDir: path.join(packageDir, 'lib'),
      emptyOutDir: true,
      copyPublicDir: false,
      // The consumer minifies.
      minify: false,
      sourcemap: true,
      target: browserslistToEsbuild(browsers),
      rolldownOptions: {
        external: id =>
          externals.some(dep => id === dep || id.startsWith(`${dep}/`)),
        output: hasCss ? { banner: "import './index.css';" } : {},
      },
    },
  };
}
