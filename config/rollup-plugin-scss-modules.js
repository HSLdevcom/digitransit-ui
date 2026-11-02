import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import * as sass from 'sass';
import browserslist from 'browserslist';
import { transform, browserslistToTargets, Features } from 'lightningcss';

// Resolves webpack-style `~pkg/path` Sass imports from the nearest node_modules.
const tildeImporter = {
  findFileUrl(url, { containingUrl }) {
    if (!url.startsWith('~')) {
      return null;
    }
    const request = url.slice(1);
    const segments = request.split('/');
    const packageName = request.startsWith('@')
      ? segments.slice(0, 2).join('/')
      : segments[0];
    let dir = containingUrl
      ? path.dirname(fileURLToPath(containingUrl))
      : process.cwd();
    for (;;) {
      const modules = path.join(dir, 'node_modules');
      if (fs.existsSync(path.join(modules, packageName))) {
        return pathToFileURL(path.join(modules, request));
      }
      const parent = path.dirname(dir);
      if (parent === dir) {
        return null;
      }
      dir = parent;
    }
  },
};

/**
 * Compiles `.scss` files with Sass (modern API) and scopes class names with
 * Lightning CSS modules. The default export of each file is the map of local
 * to scoped class names. The CSS itself is emitted as `index.css` next to the
 * ES output (see `hasCss` for the matching import banner).
 *
 * The package name is part of the scoped name hash, so unrelated packages
 * using the same local class name never collide once bundled together.
 */
export default function scssModules({
  packageName,
  packageRoot,
  rootDir,
  sideEffects,
  minify,
}) {
  const stylesheets = new Map();
  const targets = browserslistToTargets(
    browserslist(undefined, { path: rootDir }),
  );

  return {
    name: 'scss-modules',

    hasCss: id => stylesheets.has(id),

    transform(code, id) {
      if (!id.endsWith('.scss')) {
        return null;
      }
      const compiled = sass.compile(id, {
        importers: [tildeImporter],
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      });
      compiled.loadedUrls
        .filter(url => url.protocol === 'file:')
        .forEach(url => this.addWatchFile(fileURLToPath(url)));

      const result = transform({
        filename: `${packageName}/${path.relative(packageRoot, id)}`,
        code: Buffer.from(compiled.css),
        cssModules: { pattern: '[name]_[local]__[hash]' },
        targets,
        minify,
        // Keep `min-width`/`max-width` queries, as in webpack.config.js.
        include: Features.MediaRangeSyntax,
      });
      result.warnings.forEach(warning => this.warn(warning.message));
      stylesheets.set(id, result.code.toString());

      const classNames = Object.fromEntries(
        Object.entries(result.exports).map(([local, { name, composes }]) => [
          local,
          [name, ...composes.map(c => c.name)].join(' '),
        ]),
      );
      return {
        code: `export default ${JSON.stringify(classNames)};`,
        map: null,
      };
    },

    buildEnd() {
      // Without it webpack tree-shakes away the CSS import of the ES build.
      if (stylesheets.size && ![sideEffects].flat().includes('**/*.css')) {
        this.error(
          `${packageName} has SCSS: add "sideEffects": ["**/*.css"] to its package.json`,
        );
      }
    },

    generateBundle(outputOptions, bundle) {
      if (outputOptions.format !== 'es') {
        return;
      }
      Object.values(bundle)
        .filter(chunk => chunk.type === 'chunk')
        .forEach(chunk => {
          const css = chunk.moduleIds
            .filter(id => stylesheets.has(id))
            .map(id => stylesheets.get(id));
          if (css.length) {
            this.emitFile({
              type: 'asset',
              fileName: 'index.css',
              source: css.join('\n'),
            });
          }
        });
    },
  };
}
