/* eslint-disable no-console, no-restricted-syntax, no-await-in-loop */
/**
 * Generate favicons / touch icons per regional config, replacing
 * `favicons-webpack-plugin` (which only ran inside the webpack build).
 *
 * For each config it writes `_static/assets/icons-<CONFIG>-<hash>/<icon files>`
 * plus `_static/assets/iconstats-<CONFIG>.json`. `app/config.js` `addMetaData()`
 * finds the hashed directory by its `icons-<CONFIG>-` prefix and substitutes the
 * name into `app/ssrmeta.json`'s `<themehash>` placeholders, so only the prefix
 * matters, not the exact hash.
 *
 * Honors `process.env.CONFIG` (single config, the "fast" build) like the old
 * plugin + the Dockerfile CONFIG build-arg. Skips a config whose output dir
 * already exists.
 */
require('@babel/register')({
  ignore: [
    /node_modules\/(?!react-leaflet|@babel\/runtime\/helpers\/esm|@digitransit-util)/,
  ],
});

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const favicons = require('favicons');
const { getNamedConfiguration } = require('../app/config');

const ROOT = path.join(__dirname, '..');
const OUT_ASSETS = path.join(ROOT, '_static', 'assets');

const ICONS = {
  android: true,
  appleIcon: true,
  appleStartup: false,
  coast: false,
  favicons: true,
  firefox: true,
  opengraph: false,
  twitter: false,
  yandex: false,
  windows: false,
};

function configNames() {
  if (process.env.CONFIG && process.env.CONFIG !== '') {
    return [process.env.CONFIG];
  }
  return fs
    .readdirSync(path.join(ROOT, 'app', 'configurations'))
    .filter(f => /^config\.\w+\.js$/.test(f))
    .map(f => f.replace(/^config\./, '').replace(/\.js$/, ''));
}

function resolveLogo(config) {
  const candidates = [
    config.favicon,
    `app/configurations/images/${config.CONFIG}/${config.CONFIG}-favicon.png`,
    'app/configurations/images/default/default-favicon.png',
  ].filter(Boolean);
  for (const c of candidates) {
    const abs = path.isAbsolute(c) ? c : path.join(ROOT, c);
    if (fs.existsSync(abs)) {
      return abs;
    }
  }
  throw new Error(`No favicon source found for config ${config.CONFIG}`);
}

async function run() {
  fs.mkdirSync(OUT_ASSETS, { recursive: true });
  for (const name of configNames()) {
    const config = getNamedConfiguration(name);
    const logo = resolveLogo(config);
    const hash = crypto
      .createHash('md5')
      .update(fs.readFileSync(logo))
      .update(config.CONFIG)
      .digest('hex')
      .slice(0, 20);
    const prefix = `icons-${config.CONFIG}-${hash}`;
    const outDir = path.join(OUT_ASSETS, prefix);

    if (fs.existsSync(outDir)) {
      console.log(`favicons: ${config.CONFIG} up to date (${prefix})`);
      continue; // eslint-disable-line no-continue
    }

    // eslint-disable-next-line no-await-in-loop
    const res = await favicons(logo, {
      path: `/assets/${prefix}/`,
      appName: config.title,
      appShortName: config.title,
      appDescription: (config.meta && config.meta.description) || config.title,
      background: '#eef1f3',
      theme_color: config.colors ? config.colors.primary : '#eef1f3',
      icons: ICONS,
    });

    fs.mkdirSync(outDir, { recursive: true });
    [...res.images, ...res.files].forEach(file => {
      fs.writeFileSync(path.join(outDir, file.name), file.contents);
    });
    fs.writeFileSync(
      path.join(OUT_ASSETS, `iconstats-${config.CONFIG}.json`),
      JSON.stringify({
        prefix: `/assets/${prefix}/`,
        files: res.files.map(f => f.name),
        images: res.images.map(i => i.name),
      }),
    );
    console.log(
      `favicons: ${config.CONFIG} -> ${prefix} (${res.images.length} icons)`,
    );
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
