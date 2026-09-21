// Reads webpack's build-time asset manifest (manifest.json/stats.json) once
// at module load, and exposes it through small functions rather than bare
// module-level state, so server/middleware/shell.js can stay pure
// templating. This is the one module a future webpack -> Vite migration
// would need to rewrite (Vite's manifest shape differs) without touching
// the HTML-shell logic around it.
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
  const stats = JSON.parse(
    fs.readFileSync(path.join(appRoot, 'stats.json'), 'utf8'),
  );
  const entryAssets = stats.entrypoints.main.assets.filter(
    asset => !asset.endsWith('.map'),
  );

  const manifestFiles = entryAssets.filter(asset =>
    asset.startsWith('js/runtime'),
  );

  manifestScript = manifestFiles
    .map(manifestFile =>
      fs.readFileSync(path.join(appRoot, '_static', manifestFile)),
    )
    .join('\n');

  mainAssets = entryAssets.filter(asset => !manifestFiles.includes(asset));
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
