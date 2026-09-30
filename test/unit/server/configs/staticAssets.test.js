import fs from 'fs';
import path from 'path';
import { getNamedConfiguration } from '../../../../server/configs/config';

const configsDir = path.join(process.cwd(), 'server', 'configs');
const staticDir = path.join(process.cwd(), 'static');
const assetsDir = path.join(staticDir, 'assets');

// Sprite sheets are webpack entries (see scripts/build/contextHelper.js) rather
// than per-config static assets, so they're outside this audit.
const NON_CONFIG_ASSETS = /^svg-sprite\..*\.svg$/;
// Hidden OS-generated files (e.g. macOS regenerates .DS_Store just by
// browsing a folder in Finder) are never real config assets.
const HIDDEN_FILE = /^\./;

const configNames = fs
  .readdirSync(configsDir)
  .filter(file => /^config\.\w+\.js$/.test(file))
  .map(file => file.replace('config.', '').replace('.js', ''));

function localAssetPaths(config) {
  const urls = [config.socialMedia.image.url];
  config.geoJson?.layers?.forEach(layer => {
    if (typeof layer.url === 'string' && layer.url.startsWith('/assets/')) {
      urls.push(layer.url);
    }
  });
  // socialMedia.image.url is relative (joined with a host in
  // utils/shared/metaUtils.js), geoJson layer urls are absolute.
  return urls.map(url => url.replace(/^\//, ''));
}

const assetsByConfig = configNames.map(configName => [
  configName,
  localAssetPaths(getNamedConfiguration(configName)),
]);

describe('static asset references', () => {
  it.each(assetsByConfig)('%s references existing files', (_, assetPaths) => {
    assetPaths.forEach(assetPath => {
      expect(
        fs.existsSync(path.join(staticDir, assetPath)),
        `static/${assetPath} does not exist`,
      ).toBe(true);
    });
  });

  it('has no unreferenced files under static/assets', () => {
    const referenced = new Set(
      assetsByConfig.flatMap(([, assetPaths]) => assetPaths),
    );
    const files = fs
      .readdirSync(assetsDir, { recursive: true, withFileTypes: true })
      .filter(entry => entry.isFile())
      .map(entry =>
        path
          .relative(staticDir, path.join(entry.parentPath, entry.name))
          .split(path.sep)
          .join('/'),
      )
      .filter(
        file =>
          !NON_CONFIG_ASSETS.test(path.basename(file)) &&
          !HIDDEN_FILE.test(path.basename(file)),
      );

    expect(files.filter(file => !referenced.has(file))).toEqual([]);
  });
});
