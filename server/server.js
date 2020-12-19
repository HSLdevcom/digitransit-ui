/* eslint-disable no-param-reassign, no-console, strict, global-require, no-unused-vars, func-names */

'use strict';

/* ********* Polyfills (for node) ********* */
const path = require('path');
const fs = require('fs');
require('@babel/register')({
  // This will override `node_modules` ignoring - you can alternatively pass
  // an array of strings to be explicitly matched or a regex / glob
  ignore: [
    /node_modules\/(?!react-leaflet|@babel\/runtime\/helpers\/esm|@digitransit-util)/,
  ],
});

global.fetch = require('node-fetch');
const proxy = require('express-http-proxy');

global.self = { fetch: global.fetch };

let Sentry;
const devhost = '';

if (process.env.NODE_ENV === 'production' && process.env.SENTRY_SECRET_DSN) {
  Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_SECRET_DSN,
  });
} else {
  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
  });
}

/* ********* Server ********* */
const express = require('express');
const expressStaticGzip = require('express-static-gzip');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const request = require('request');
const logger = require('morgan');
const { retryFetch } = require('../app/util/fetchUtils');
const config = require('../app/config').getConfiguration();

/* ********* Global ********* */
const port = config.PORT || 8080;
const app = express();
const { indexPath } = config;

/* Setup functions */
function setUpOpenId() {
  const setUpOIDC = require('./passport-openid-connect/openidConnect').default;
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(
    require('helmet')({
      contentSecurityPolicy: false,
      referrerPolicy: false,
      expectCt: false,
    }),
  );
  setUpOIDC(app, port, indexPath);
}

function setUpStaticFolders() {
  // First set up a specific path for sw.js
  if (process.env.ASSET_URL) {
    const swText = fs.readFileSync(
      path.join(process.cwd(), '_static', 'sw.js'),
      { encoding: 'utf8' },
    );
    const injectionPoint = swText.indexOf(';') + 2;
    const swPreText = swText.substring(0, injectionPoint);
    const swPostText = swText.substring(injectionPoint);
    const swInjectionText = fs
      .readFileSync(path.join(process.cwd(), 'server', 'swInjection.js'), {
        encoding: 'utf8',
      })
      .replace(/ASSET_URL/g, process.env.ASSET_URL);
    const swTextInjected = swPreText + swInjectionText + swPostText;

    app.get(`${config.APP_PATH}/sw.js`, (req, res) => {
      res.setHeader('Cache-Control', 'public, max-age=0');
      res.setHeader('Content-type', 'application/javascript; charset=UTF-8');
      res.send(swTextInjected);
    });
  }

  const staticFolder = path.join(process.cwd(), '_static');
  // Sert cache for 1 week
  const oneDay = 86400000;
  app.use(
    config.APP_PATH,
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
  if (process.env.NODE_ENV === 'development') {
    const hotloadPort = process.env.HOT_LOAD_PORT || 9000;
    // proxy for dev-bundle
    app.use('/proxy/', proxy(`http://localhost:${hotloadPort}/`));
  }
}

function onError(err, req, res) {
  res.statusCode = 500;
  res.end(err.message + err.stack);
}

function setUpSentry() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_SECRET_DSN) {
    app.use(Sentry.Handlers.requestHandler());
  }
}

function setUpErrorHandling() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_SECRET_DSN) {
    app.use(Sentry.Handlers.errorHandler());
  }

  app.use(onError);
}

function setUpRoutes() {
  app.use(
    ['/', '/fi/', '/en/', '/sv/', '/ru/', '/slangi/'],
    require('./reittiopasParameterMiddleware').default,
  );
  app.use(require('../app/server').default);

  // Make sure req has the correct hostname extracted from the proxy info
  app.enable('trust proxy');
}

function setUpAvailableRouteTimetables() {
  return new Promise(resolve => {
    // Stores available route pdf names to config.availableRouteTimetables.HSL
    // All routes don't have available pdf and some have their timetable inside other route
    // so there is a mapping between route's gtfsId (without HSL: part) and similar gtfsId of
    // route that contains timetables
    if (config.timetables.HSL) {
      // try to fetch available route timetables every four seconds with 4 retries
      retryFetch(`${config.URL.ROUTE_TIMETABLES.HSL}routes.json`, {}, 4, 4000)
        .then(res => res.json())
        .then(
          result => {
            config.timetables.HSL.setAvailableRouteTimetables(result);
            console.log('availableRouteTimetables.HSL loaded');
            resolve();
          },
          err => {
            console.log(err);
            // If after 5 tries no timetable data is found, start server anyway
            resolve();
            console.log('availableRouteTimetables.HSL loader failed');
            // Continue attempts to fetch available routes in the background for one day once every minute
            retryFetch(
              `${config.URL.ROUTE_TIMETABLES.HSL}routes.json`,
              {},
              1440,
              60000,
            )
              .then(res => res.json())
              .then(
                result => {
                  config.timetables.HSL.setAvailableRouteTimetables(result);
                  console.log(
                    'availableRouteTimetables.HSL loaded after retry',
                  );
                },
                error => {
                  console.log(error);
                },
              );
          },
        );
    } else {
      resolve();
    }
  });
}

function processTicketTypeResult(result) {
  const resultData = result.data;
  if (resultData && Array.isArray(resultData.ticketTypes)) {
    config.availableTickets = {};
    resultData.ticketTypes.forEach(ticket => {
      const ticketFeed = ticket.fareId.split(':')[0];
      if (config.availableTickets[ticketFeed] === undefined) {
        config.availableTickets[ticketFeed] = {};
      }
      config.availableTickets[ticketFeed][ticket.fareId] = {
        price: ticket.price,
        zones: ticket.zones,
      };
    });
    console.log('availableTickets loaded');
  } else {
    console.log('could not load availableTickets, result was invalid');
  }
}

function setUpAvailableTickets() {
  return new Promise(resolve => {
    const options = {
      method: 'POST',
      body: '{ ticketTypes { price fareId zones } }',
      headers: { 'Content-Type': 'application/graphql' },
    };
    // try to fetch available ticketTypes every four seconds with 4 retries
    retryFetch(`${config.URL.OTP}index/graphql`, options, 4, 4000)
      .then(res => res.json())
      .then(
        result => {
          processTicketTypeResult(result);
          resolve();
        },
        err => {
          console.log(err);
          if (process.env.BASE_CONFIG) {
            // Patching of availableTickets into cached configs would not work with BASE_CONFIG
            // if availableTickets are fetched after launch
            console.log('failed to load availableTickets at launch, exiting');
            process.exit(1);
          } else {
            // If after 5 tries no available ticketTypes are found, start server anyway
            resolve();
            console.log('failed to load availableTickets at launch, retrying');
            // Continue attempts to fetch available ticketTypes in the background for one day once every minute
            retryFetch(`${config.URL.OTP}index/graphql`, options, 1440, 60000)
              .then(res => res.json())
              .then(
                result => {
                  processTicketTypeResult(result);
                },
                error => {
                  console.log(error);
                },
              );
          }
        },
      );
  });
}

function startServer() {
  const server = app.listen(port, () =>
    console.log('Digitransit-ui available on port %d', server.address().port),
  );
}

/* ********* Init ********* */
if (process.env.OIDC_CLIENT_ID) {
  setUpOpenId();
}
setUpSentry();
setUpStaticFolders();
setUpMiddleware();
setUpRoutes();
setUpErrorHandling();
Promise.all([
  setUpAvailableRouteTimetables(),
  setUpAvailableTickets(),
]).then(() => startServer());

module.exports.app = app;
