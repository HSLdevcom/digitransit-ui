// Reads webpack's build-time asset manifest (manifest.json) once at module
// load, and exposes it through small functions rather than bare
// module-level state, so server/middleware/shell.js can stay pure
// templating.
import fs from 'fs';
import path from 'path';

const appRoot = `${process.cwd()}/`;

let assets;
let mainAssets;
let manifestScript;

if (process.env.NODE_ENV !== 'development') {
  assets = JSON.parse(
    fs.readFileSync(path.join(appRoot, 'manifest.json'), 'utf8'),
  );
  // `entrypoints.main.assets` groups the entry's files by extension, each
  // list in load order.
  const { js = [], css = [] } = assets.entrypoints.main.assets;

  const manifestFiles = js.filter(asset => asset.startsWith('js/runtime'));

  manifestScript = manifestFiles
    .map(manifestFile =>
      fs.readFileSync(path.join(appRoot, '_static', manifestFile)),
    )
    .join('\n');

  mainAssets = [...css, ...js.filter(asset => !manifestFiles.includes(asset))];
}

export function getMainAssets() {
  return mainAssets;
}

export function getManifestScript() {
  return manifestScript;
}

export function getAssetPath(assetKey) {
  return assets[assetKey];
}

export function readStaticFile(relativePath) {
  return fs.readFileSync(path.join(appRoot, '_static', relativePath));
}
