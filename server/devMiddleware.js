/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
// Development only: compiles the client bundle inside the server process and
// serves it from memory. server.js imports this lazily, since production
// installs omit devDependencies.
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackConfig from '../webpack.config.js';
import { readEntryAssets } from './html/assetManifest.js';

/** An entrypoint's files by type, without hot updates (only the HMR client loads those). */
function filesOf(compilation, entrypoint) {
  const files = entrypoint
    .getFiles()
    .filter(file => !compilation.getAsset(file)?.info.hotModuleReplacement);
  return {
    js: files.filter(file => file.endsWith('.js')),
    css: files.filter(file => file.endsWith('.css')),
  };
}

/**
 * Puts the current build's files on `res.locals.assets`, as
 * createManifestMiddleware() in server/html/assetManifest.js does in production.
 */
function setAssets(req, res, next) {
  const { compilation } = res.locals.webpack.devMiddleware.stats;
  const entrypoints = {};
  compilation.entrypoints.forEach((entrypoint, name) => {
    entrypoints[name] = { assets: filesOf(compilation, entrypoint) };
  });
  // Development has no runtime chunk (see `runtimeChunk` in webpack.config.js).
  res.locals.assets = readEntryAssets({ entrypoints }, () => '');
  next();
}

/**
 * Creates the middleware serving the bundle and hot updates. Requests wait for
 * a valid build, then get its files on `res.locals.assets`. Its `close(callback)`
 * ends the hot-update streams, stops watching and writes webpack's cache.
 */
export default function createDevMiddleware() {
  const compiler = webpack(webpackConfig);
  const middleware = webpackDevMiddleware(compiler, {
    serverSideRender: true,
    hot: {
      client: {
        // Applies updates in place (CSS) and reloads the page when it can't.
        apply: 'hmr',
        // CSS "conflicting order" warnings (see `ignoreOrder` in
        // webpack.config.js) stay in the terminal instead of covering the page.
        overlay: { errors: true, warnings: false },
      },
    },
  });

  const devMiddleware = (req, res, next) =>
    middleware(req, res, err => (err ? next(err) : setAssets(req, res, next)));
  // The middleware only stops watching; compiler.close() also persists the
  // filesystem cache.
  devMiddleware.close = callback =>
    middleware.close(err =>
      compiler.close(closeErr => callback(err ?? closeErr)),
    );
  return devMiddleware;
}
