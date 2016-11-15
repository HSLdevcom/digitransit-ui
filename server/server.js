/* eslint-disable no-param-reassign, no-console, strict, global-require */

'use strict';

/* ********* Polyfills (for node) **********/
const path = require('path');

require('babel-core/register')({
  presets: ['modern-node', 'stage-2', 'react'], // eslint-disable-line prefer-template
  plugins: [
    'transform-es2015-destructuring',
    'transform-es2015-parameters',
    'transform-class-properties',
    'transform-es2015-modules-commonjs',
    path.join(process.cwd(), 'build/babelRelayPlugin'),
  ],
  ignore: [
    /node_modules/,
    'app/util/piwik.js',
  ],
});

global.fetch = require('node-fetch');

global.self = { fetch: global.fetch };

const config = require('../app/config').default;

let raven;

if (process.env.NODE_ENV === 'production') {
  raven = require('raven');
}

/* ********* Server **********/
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

/* ********* Global **********/
const port = config.PORT || 8080;
const app = express();

/* Setup functions */
function setUpStaticFolders() {
  const staticFolder = path.join(process.cwd(), '_static');
  // Sert cache for 1 week
  app.use(config.APP_PATH, express.static(staticFolder, { maxAge: 604800000 }));
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
  if (process.env.NODE_ENV === 'production') {
    app.use(raven.middleware.express.requestHandler(process.env.SENTRY_SECRET_DSN));
  }
}

function setupErrorHandling() {
  if (process.env.NODE_ENV === 'production') {
    app.use(raven.middleware.express.errorHandler(process.env.SENTRY_SECRET_DSN));
  }

  app.use(onError);
}

function setUpRoutes() {
  app.use(require('../app/server').default);
}

function startServer() {
  const server = app.listen(port, () =>
    console.log('Digitransit-ui available on port %d', server.address().port)
  );
}

/* ********* Init **********/
setupRaven();
setUpStaticFolders();
setUpMiddleware();
setUpRoutes();
setupErrorHandling();
startServer();
module.exports.app = app;
