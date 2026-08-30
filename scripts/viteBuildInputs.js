/* eslint-disable global-require */
/**
 * Build inputs for the Vite client build.
 *
 * Replaces the old webpack `themeEntries` / `faviconPlugins` exports. Everything here
 * is derived from the filesystem so this module stays plain CJS and can be `require`d
 * from `vite.config.mjs` without `@babel/register` (unlike `app/config.js`).
 *
 * - `main`            -> app/client.js
 * - `<theme>_theme`   -> `virtual:theme/<theme>`  (resolved by the digitransitEntries
 *                        Vite plugin to `import 'sass/themes/<theme>/main.scss'`)
 * - `<sprite>_sprite` -> `virtual:sprite/<sprite>` (resolved to the hashed SVG asset url)
 *
 * When `process.env.CONFIG` is set only that config's theme + `default` are built
 * (the "fast" single-instance build, mirrors the old behaviour and the Dockerfile
 * `CONFIG` build-arg). Otherwise every theme dir is built.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const THEMES_DIR = path.join(ROOT, 'sass', 'themes');
const SPRITES_DIR = path.join(ROOT, 'static', 'assets');

/** All directories under sass/themes that contain a main.scss. */
function themeDirs() {
  return fs
    .readdirSync(THEMES_DIR, { withFileTypes: true })
    .filter(
      d =>
        d.isDirectory() &&
        fs.existsSync(path.join(THEMES_DIR, d.name, 'main.scss')),
    )
    .map(d => d.name);
}

/** Sprite names from static/assets/svg-sprite.<name>.svg (e.g. 'default', 'hsl'). */
function spriteNames() {
  return fs
    .readdirSync(SPRITES_DIR)
    .filter(f => /^svg-sprite\..+\.svg$/.test(f))
    .map(f => f.replace(/^svg-sprite\./, '').replace(/\.svg$/, ''));
}

/** rollupOptions.input map for `vite build`. */
function getBuildInputs() {
  const only =
    process.env.CONFIG && process.env.CONFIG !== '' ? process.env.CONFIG : null;
  const themes = only
    ? [...new Set(['default', only])].filter(t =>
        fs.existsSync(path.join(THEMES_DIR, t, 'main.scss')),
      )
    : themeDirs();

  const input = { main: path.join(ROOT, 'app', 'client.js') };
  themes.forEach(t => {
    input[`${t}_theme`] = `virtual:theme/${t}`;
  });
  // SVG sprites are not build entries: they are shipped verbatim by the `static`
  // copy into _static/assets/ and referenced directly by app/server.js from
  // `config.sprites`.
  return input;
}

module.exports = { getBuildInputs, themeDirs, spriteNames, ROOT };
