import path from 'path';
import fs from 'fs';
import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from 'morgan';
import helmet from 'helmet';
import { ASSET_URL_PLACEHOLDER } from '../scripts/build/assetUrlPlaceholder.js';
import { getConfiguration } from './configs/config.js';
import setUpOIDC from './passport-openid-connect/openidConnect.js';
import legacyUrlMiddleware from './middleware/legacyUrlMiddleware.js';
import shell from './middleware/shell.js';
import mountDevProxy from './middleware/devProxy.js';
import { LEGACY_LOCALE_PATH_SEGMENTS } from '../utils/shared/constants.js';

// Builds the configured Express app, with no `.listen()` call - kept
// separate from server.js's process bootstrap (boot-time data fetches,
// `.listen()`, graceful shutdown) so the app itself is directly testable
// with supertest.
export default function createApp() {
  const config = getConfiguration();
  const { indexPath, hostnames } = config;
  const port = config.PORT || 8080;

  const app = express();
  let redisClient;

  function setUpOpenId() {
    if (process.env.DEBUGLOGGING) {
      app.use(logger('dev'));
    }
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(
      helmet({
        contentSecurityPolicy: false,
        referrerPolicy: false,
        expectCt: false,
      }),
    );
    redisClient = setUpOIDC(app, port, indexPath, hostnames);
  }

  function setUpStaticFolders() {
    // Serve /sw.js with the ASSET_URL placeholder (baked into the precache
    // manifest at build time by workbox-webpack-plugin's InjectManifest -
    // see webpack.config.js / utils/client/serviceWorker.js) replaced by
    // this deployment's actual CDN base URL - or stripped out entirely when
    // ASSET_URL isn't set. Only production builds actually produce
    // _static/sw.js (InjectManifest is production-only), and app/client.js
    // only ever registers this service worker when
    // `process.env.NODE_ENV !== 'development'`, so this route is skipped
    // entirely in dev - mirrors server/middleware/shell.js's own
    // `process.env.NODE_ENV !== 'development'` guard around its asset
    // manifest reads.
    if (process.env.NODE_ENV !== 'development') {
      const swText = fs.readFileSync(
        path.join(process.cwd(), '_static', 'sw.js'),
        { encoding: 'utf8' },
      );
      const swTextInjected = swText.replace(
        new RegExp(ASSET_URL_PLACEHOLDER, 'g'),
        process.env.ASSET_URL || '',
      );

      app.get('/sw.js', (req, res) => {
        res.setHeader('Cache-Control', 'public, max-age=0');
        res.setHeader('Content-type', 'application/javascript; charset=UTF-8');
        res.send(swTextInjected);
      });
    }

    const staticFolder = path.join(process.cwd(), '_static');
    // Sert cache for 1 week
    const oneDay = 86400000;
    app.use(
      '',
      expressStaticGzip(staticFolder, {
        enableBrotli: true,
        index: false,
        maxAge: 14 * oneDay,
        setHeaders(res, reqPath) {
          if (
            reqPath.toLowerCase().includes('sw.js') ||
            reqPath.toLowerCase().includes('appcache')
          ) {
            res.setHeader('Cache-Control', 'public, max-age=0');
          }
          // Always set cors header
          res.header('Access-Control-Allow-Origin', '*');
        },
      }),
    );
  }

  function setUpMiddleware() {
    app.use(cookieParser());
    app.use(bodyParser.raw());
    mountDevProxy(app);
  }

  function onError(err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');

    return res
      .status(500)
      .type('text/plain')
      .send(
        process.env.NODE_ENV === 'development'
          ? `${err.message}\n${err.stack}`
          : 'Internal server error',
      );
  }

  function setUpRoutes() {
    app.use(
      ['/', ...LEGACY_LOCALE_PATH_SEGMENTS.map(segment => `/${segment}/`)],
      legacyUrlMiddleware,
    );
    app.use(shell);

    // Make sure req has the correct hostname extracted from the proxy info
    app.enable('trust proxy');
  }

  if (process.env.OIDC_CLIENT_ID) {
    setUpOpenId();
  }
  setUpStaticFolders();
  setUpMiddleware();
  setUpRoutes();
  app.use(onError);

  return { app, port, redisClient };
}
