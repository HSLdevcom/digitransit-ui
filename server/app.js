import path from 'path';
import fs from 'fs';
import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from 'morgan';
import helmet from 'helmet';
import proxy from 'express-http-proxy';
import { ASSET_URL_PLACEHOLDER } from '../scripts/build/assetUrlPlaceholder.js';
import { getConfiguration } from './configs/config.js';
import setUpOIDC from './passport-openid-connect/openidConnect.js';
import legacyUrlMiddleware from './middleware/legacyUrlMiddleware.js';
import shell from './middleware/shell.js';
import { LEGACY_LOCALE_PATHS } from '../utils/shared/constants.js';

function setUpOpenId(app) {
  const config = getConfiguration();
  const { PORT, indexPath, hostnames } = config;

  if (process.env.DEBUGLOGGING) {
    app.use(logger('dev'));
  }
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(
    helmet({
      contentSecurityPolicy: false,
      referrerPolicy: false,
      expectCt: false,
    }),
  );
  return setUpOIDC(app, PORT, indexPath, hostnames);
}

function isAssetRequest(req) {
  // Path starts with /js/, /css/ or /assets/
  return /^\/(js|css|assets)\//.test(req.path);
}

// expressStaticGzip below calls next() when the requested file doesn't
// exist. For asset-shaped paths specifically, that means the asset is
// genuinely missing - respond with 404 instead of letting the request fall
// through to server/middleware/shell.js, which would otherwise render an
// HTML page for what was clearly meant to be a JS/CSS/asset request.
function handleMissingAssetRequests(req, res, next) {
  if (!isAssetRequest(req)) {
    return next();
  }
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');
  return res.status(404).type('text/plain').send('Static asset not found');
}

function setUpStaticFolders(app) {
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
  app.use(handleMissingAssetRequests);
}

function setUpMiddleware(app) {
  app.use(cookieParser());
  app.use(bodyParser.raw());

  if (process.env.NODE_ENV === 'development') {
    const hotloadPort = process.env.HOT_LOAD_PORT || 9000;
    app.use('/proxy/', proxy(`http://[::1]:${hotloadPort}/`));
  }
}

function setUpRoutes(app) {
  app.use(['/', ...LEGACY_LOCALE_PATHS], legacyUrlMiddleware);
  app.use(shell);

  // Make sure req has the correct hostname extracted from the proxy info
  app.enable('trust proxy');
}

export function onError(err, req, res, next) {
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

// Builds the configured Express app, with no `.listen()` call - kept
// separate from server.js's process bootstrap (boot-time data fetches,
// `.listen()`, graceful shutdown) so the app itself is directly testable
// with supertest.
export default function createApp() {
  const app = express();

  const redisClient = process.env.OIDC_CLIENT_ID ? setUpOpenId(app) : undefined;
  setUpStaticFolders(app);
  setUpMiddleware(app);
  setUpRoutes(app);
  app.use(onError);

  return { app, redisClient };
}
