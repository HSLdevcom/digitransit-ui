/* eslint-disable no-param-reassign, no-console, strict, global-require, no-unused-vars */

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

let Raven;
const devhost = '';

if (process.env.NODE_ENV === 'production' && process.env.SENTRY_SECRET_DSN) {
  Raven = require('raven');
  Raven.config(process.env.SENTRY_SECRET_DSN, {
    captureUnhandledRejections: true,
  }).install();
} else {
  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
  });
}

process.on('uncaughtException', error => {
  // perhaps this is a little too careful but i want to make sure that things like out of memory errors
  // are still crashing the process as there is no point in trying to recover from these.
  if (error.name === 'RRNLRequestError') {
    console.log('Unhandled Error', error);
  } else {
    throw error;
  }
});

/* ********* Server ********* */
const express = require('express');
const expressStaticGzip = require('express-static-gzip');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const {
  Validator,
  ValidationError,
} = require('express-json-validator-middleware');

const validator = new Validator({ allErrors: true });

const request = require('request');
const logger = require('morgan');
const { postCarpoolOffer, bodySchema } = require('./carpool');
const { retryFetch } = require('../app/util/fetchUtils');
const config = require('../app/config').getConfiguration();

/* ********* Global ********* */
const port = config.PORT || 8080;
const app = express();

/* Setup functions */
function setUpOIDC() {
  /* ********* Setup OpenID Connect ********* */
  const callbackPath = '/oid_callback'; // connect callback path
  // Use Passport with OpenId Connect strategy to authenticate users
  const OIDCHost = process.env.OIDCHOST || 'https://hslid-dev.t5.fi';
  const FavouriteHost =
    process.env.FAVOURITE_HOST || 'https://dev-api.digitransit.fi/favourites';
  const LoginStrategy = require('./passport-openid-connect/Strategy').Strategy;
  const passport = require('passport');
  const session = require('express-session');

  const redis = require('redis');
  const RedisStore = require('connect-redis')(session);
  const RedisHost = process.env.REDIS_HOST || 'localhost';
  const RedisPort = process.env.REDIS_PORT || 6379;
  const RedisKey = process.env.REDIS_KEY;
  const RedisClient = RedisKey
    ? redis.createClient(RedisPort, RedisHost, {
        auth_pass: RedisKey,
        tls: { servername: RedisHost },
      })
    : redis.createClient(RedisPort, RedisHost);
  const oic = new LoginStrategy({
    issuerHost:
      process.env.OIDC_ISSUER || `${OIDCHost}/.well-known/openid-configuration`,
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    redirect_uri:
      process.env.OIDC_CLIENT_CALLBACK ||
      `http://localhost:${port}${callbackPath}`,
    scope: 'openid profile',
  });
  passport.use(oic);
  passport.serializeUser(LoginStrategy.serializeUser);
  passport.deserializeUser(LoginStrategy.deserializeUser);
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(require('helmet')());
  // Passport requires session to persist the authentication
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'reittiopas_secret',
      store: new RedisStore({
        host: RedisHost,
        port: RedisPort,
        client: RedisClient,
        ttl: 1000 * 60 * 60 * 24 * 365 * 10,
      }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      },
    }),
  );
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  // Initiates an authentication request
  // users will be redirected to hsl.id and once authenticated
  // they will be returned to the callback handler below
  app.get(
    '/login',
    passport.authenticate('passport-openid-connect', {
      successReturnToOrRedirect: '/',
      scope: 'profile',
    }),
  );
  // Callback handler that will redirect back to application after successfull authentication
  app.get(
    callbackPath,
    passport.authenticate('passport-openid-connect', {
      callback: true,
      successReturnToOrRedirect: `${devhost}/`,
      failureRedirect: '/',
    }),
  );
  app.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy(function() {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
  app.use('/api', function(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.sendStatus(401);
    }
  });
  /* GET the profile of the current authenticated user */
  app.get('/api/user', function(req, res, next) {
    request.get(
      `${OIDCHost}/openid/userinfo`,
      {
        auth: {
          bearer: req.user.token.access_token,
        },
      },
      function(err, response, body) {
        if (!err) {
          res.status(response.statusCode).send(body);
        } else {
          res.status(401).send('Unauthorized');
        }
      },
    );
  });

  app.use('/api/user/favourites', function(req, res, next) {
    request(
      {
        auth: {
          bearer: req.user.token.access_token,
        },
        method: req.method,
        url: `${FavouriteHost}/${req.user.data.sub}`,
        body: JSON.stringify(req.body),
      },
      function(err, response, body) {
        if (!err) {
          res.status(response.statusCode).send(body);
        } else {
          res.status(404).send(body);
        }
      },
    );
  });
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
      indexFromEmptyFile: false,
      maxAge: 14 * oneDay,
      setHeaders(res, reqPath) {
        if (
          reqPath.toLowerCase().includes('sw.js') ||
          reqPath.toLowerCase().includes('appcache') ||
          reqPath.toLowerCase().includes('.geojson')
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

function setUpRaven() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_SECRET_DSN) {
    app.use(Raven.requestHandler());
  }
}

function setUpErrorHandling() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_SECRET_DSN) {
    app.use(Raven.errorHandler());
  }

  app.use(function(err, req, res, next) {
    if (err instanceof ValidationError) {
      res.status(400).send(err.validationErrors);
      next();
    } else {
      console.error(err.stack);
      res.status(500).send('Internal server error.');
    }
  });
}

function setUpCarpoolOffer() {
  app.use(bodyParser.json());

  app.post(
    `${config.APP_PATH}/carpool-offers`,
    validator.validate({ body: bodySchema }),
    function(req, res) {
      postCarpoolOffer(req.body).then(json => {
        const jsonResponse = {
          id: json.tripID,
          url: `https://live.ride2go.com/#/trip/${json.tripID}/{lang}`,
        };
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(jsonResponse));
      });
    },
  );
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
  setUpOIDC();
}
setUpRaven();
setUpStaticFolders();
setUpMiddleware();
setUpCarpoolOffer();
setUpRoutes();
setUpErrorHandling();
Promise.all([setUpAvailableRouteTimetables(), setUpAvailableTickets()]).then(
  () => startServer(),
);

module.exports.app = app;
