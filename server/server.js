/* eslint-disable no-param-reassign, no-console, strict, global-require */

'use strict';

/* ********* Polyfills (for node) **********/
const path = require('path');

require('babel-core/register')({
  presets: [['env', { targets: { node: 'current' } }], 'stage-2', 'react'],
  plugins: [
    'transform-system-import-commonjs',
    path.join(process.cwd(), 'build/babelRelayPlugin'),
  ],
  ignore: [
    /node_modules/,
    'app/util/piwik.js',
  ],
});

global.fetch = require('node-fetch');

global.self = { fetch: global.fetch };

const config = require('../app/config').getConfiguration();

let Raven;

if (process.env.NODE_ENV === 'production' && process.env.SENTRY_SECRET_DSN) {
  Raven = require('raven');
  Raven.config(process.env.SENTRY_SECRET_DSN, { captureUnhandledRejections: true }).install();
}

/* ********* Server **********/
const express = require('express');
const expressStaticGzip = require('express-static-gzip');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

/* ********* Global **********/
const port = config.PORT || 8080;
const app = express();

/* Setup functions */
function setUpStaticFolders() {
  const staticFolder = path.join(process.cwd(), '_static');
  // Sert cache for 1 week
  const oneDay = 86400000;
  app.use(config.APP_PATH, expressStaticGzip(staticFolder, {
    enableBrotli: true,
    indexFromEmptyFile: false,
    maxAge: 30 * oneDay,
    setHeaders(res, reqPath) {
      if (
        reqPath === path.join(process.cwd(), '_static', 'sw.js') ||
        reqPath.startsWith(path.join(process.cwd(), '_static', 'appcache'))
      ) {
        res.setHeader('Cache-Control', 'public, max-age=0');
      }
    },
  }));
}

function setUpMiddleware() {
  app.use(cookieParser());
  app.use(bodyParser.raw());
}

function onError(err, req, res) {
  res.statusCode = 500;
  res.end(err.message + err.stack);
}

function setupRaven() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_SECRET_DSN) {
    app.use(Raven.requestHandler());
  }
}

function setupErrorHandling() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_SECRET_DSN) {
    app.use(Raven.errorHandler());
  }

  app.use(onError);
}

function setUpRoutes() {
  app.use(['/', '/fi/', '/en/', '/sv/', '/ru/', '/slangi/'], require('./reittiopasParameterMiddleware').default);
  app.use('/search/', (req, res) => res.redirect(`http://classic.reittiopas.fi/search${req.url}`));
  app.use(require('../app/server').default);
}

function startServer() {
  const server = app.listen(port, () => console.log('Digitransit-ui available on port %d', server.address().port));
}

/* ********* Init **********/
setupRaven();
setUpStaticFolders();
setUpMiddleware();
setUpRoutes();
setupErrorHandling();
startServer();
module.exports.app = app;
