#!/usr/bin/env node

// Builds the SVG sprite sheets from the per-icon files in `app/assets/icons/`
// into `_static/assets/svg-sprite.<theme>.svg`, the paths `config.sprites`
// names. Runs outside the bundler, before both `yarn build` (via `prebuild`)
// and `yarn dev` (via scripts/dev.sh, which also keeps a `--watch` instance
// running).
//
// - `icons/default/` holds every icon, and every other directory holds only
//   the icons that theme adds or re-skins. A theme's sprite is the default
//   set with its own files layered on top.
// - Each file's name (minus `.svg`) becomes its symbol id, i.e. the `img` key
//   `<Icon>` and utils/client/mapIconUtils.js look it up by.
// - Each file must be well-formed XML with an `<svg>` root, or the build
//   fails naming the file. The symbol body is copied from the file as-is.
//
// Production: the sprite is still a webpack entry (see contextHelper.js), which
// gives it a content hash in manifest.json. Development: the server reads it
// from disk on every request (server/middleware/shell.js), so with `--watch` an
// icon edit shows up on the next page refresh.

import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const rootDir = path.resolve(import.meta.dirname, '../..');
export const iconsDir = path.join(rootDir, 'app', 'assets', 'icons');
const outDir = path.join(rootDir, '_static', 'assets');

const BASE_THEME = 'default';
const WATCH_DEBOUNCE_MS = 100;

function listIcons(theme) {
  const dir = path.join(iconsDir, theme);
  return fs
    .readdirSync(dir)
    .filter(file => file.endsWith('.svg'))
    .map(file => [path.basename(file, '.svg'), path.join(dir, file)]);
}

/**
 * @returns {string[]} every theme with an icon directory, `default` included.
 */
export function listThemes() {
  return fs
    .readdirSync(iconsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

function toSymbol(id, file) {
  const source = fs.readFileSync(file, 'utf8');
  let root;
  try {
    root = new JSDOM(source, { contentType: 'image/svg+xml' }).window.document
      .documentElement;
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
  const match = source.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/);
  if (root.localName !== 'svg' || !match) {
    throw new Error(`${file}: the root element must be <svg>`);
  }
  // Namespace declarations only matter in a standalone file; inside the
  // sprite the symbol inherits them from the sprite's root.
  const attributes = match[1].replace(/\s+xmlns(:\w+)?="[^"]*"/g, '');
  return `  <symbol id="${id}"${attributes}>${match[2]}</symbol>`;
}

/**
 * @param {string} theme a directory under app/assets/icons/.
 * @returns {string} the sprite sheet's markup.
 */
export function buildSprite(theme) {
  const icons = new Map(listIcons(BASE_THEME));
  if (theme !== BASE_THEME) {
    listIcons(theme).forEach(([id, file]) => icons.set(id, file));
  }
  const symbols = [...icons.keys()]
    .sort()
    .map(id => toSymbol(id, icons.get(id)));
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" style="position:absolute;width:0;height:0">',
    ' <defs>',
    ...symbols,
    ' </defs>',
    '</svg>',
    '',
  ].join('\n');
}

function writeSprites() {
  fs.mkdirSync(outDir, { recursive: true });
  listThemes().forEach(theme => {
    const target = path.join(outDir, `svg-sprite.${theme}.svg`);
    // Written via a rename so the dev server never reads a half-written file.
    const temporary = `${target}.tmp`;
    fs.writeFileSync(temporary, buildSprite(theme));
    fs.renameSync(temporary, target);
  });
}

// Watches the icons directory and each theme directory separately rather than
// with `{ recursive: true }`: on Linux the recursive watcher stops reporting a
// file once an editor saves it by writing a new file and renaming it over the
// old one (as `sed -i` and many editors do).
function watch() {
  const watchers = new Map();
  let timer;

  function rebuild() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // A half-saved or broken icon must not end the dev session: report it
      // and keep the last good sprite until the file is fixed.
      try {
        writeSprites();
        console.log('Rebuilt SVG sprites.');
      } catch (error) {
        console.error(`SVG sprite build failed: ${error.message}`);
      }
    }, WATCH_DEBOUNCE_MS);
  }

  function watchThemes() {
    const themes = listThemes();
    watchers.forEach((watcher, theme) => {
      if (!themes.includes(theme)) {
        watcher.close();
        watchers.delete(theme);
      }
    });
    themes
      .filter(theme => !watchers.has(theme))
      .forEach(theme =>
        watchers.set(theme, fs.watch(path.join(iconsDir, theme), rebuild)),
      );
  }

  fs.watch(iconsDir, () => {
    watchThemes();
    rebuild();
  });
  watchThemes();
  console.log(`Watching ${path.relative(rootDir, iconsDir)} for icon changes.`);
}

if (import.meta.main) {
  writeSprites();
  if (process.argv.includes('--watch')) {
    watch();
  }
}
