// Reads webpack's build-time asset manifest (manifest.json), so
// server/middleware/shell.js can stay pure templating. In development,
// server/devMiddleware.js provides the same shape from the current build.
import fs from 'fs';
import path from 'path';

const appRoot = `${process.cwd()}/`;

/**
 * Splits the main entry's files into the runtime chunk, which the shell
 * inlines, and the files it links.
 */
export function readEntryAssets(manifest, readRuntime) {
  // `entrypoints.main.assets` groups the entry's files by extension, each
  // list in load order.
  const { js = [], css = [] } = manifest.entrypoints.main.assets;

  const manifestFiles = js.filter(asset => asset.startsWith('js/runtime'));

  return {
    manifest,
    manifestScript: manifestFiles.map(readRuntime).join('\n'),
    mainAssets: [...css, ...js.filter(asset => !manifestFiles.includes(asset))],
  };
}

/**
 * Creates the production middleware that puts the build's files on
 * `res.locals.assets`. Reads manifest.json right away, so a deployment
 * without a build fails at boot.
 */
export function createManifestMiddleware() {
  const assets = readEntryAssets(
    JSON.parse(fs.readFileSync(path.join(appRoot, 'manifest.json'), 'utf8')),
    manifestFile =>
      fs.readFileSync(path.join(appRoot, '_static', manifestFile)),
  );
  return (req, res, next) => {
    res.locals.assets = assets;
    next();
  };
}
