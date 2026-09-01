/* eslint-disable no-param-reassign, no-console, strict, global-require, no-unused-vars, func-names */

'use strict';

/* ********* Polyfills (for node) ********* */
const path = require('path');
const fs = require('fs');
// No `ignore` override is needed here: this file's require chain no longer
// renders React components server-side (see app/server.js), so it never
// reaches into node_modules packages like react-leaflet/@digitransit-util.
require('@babel/register')();

const proxy = require('express-http-proxy');

const devhost = '';

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

/* ********* Server ********* */
const express = require('express');
const expressStaticGzip = require('express-static-gzip');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const { CosmosClient } = require('@azure/cosmos');
const {
  ASSET_URL_PLACEHOLDER,
} = require('../scripts/build/assetUrlPlaceholder');
const { getJson } = require('../app/util/xhrPromise');
const { retryFetch } = require('../app/util/fetchUtils');
const configTools = require('../app/config');
const { splitGtfsId } = require('../app/util/gtfs');
const { IS_DEV_BUILD } = require('../app/util/envUtils');

const config = configTools.getConfiguration();

const appRoot = `${process.cwd()}/`;
const configsDir = path.join(appRoot, 'app', 'configurations');
const configFiles = fs
  .readdirSync(configsDir)
  .filter(file => file.startsWith('config'));
let allZones;

/* ********* Global ********* */
const port = config.PORT || 8080;
const app = express();
const { indexPath, hostnames } = config;

/* Setup functions */
function setUpOpenId() {
  const setUpOIDC = require('./passport-openid-connect/openidConnect').default;
  if (process.env.DEBUGLOGGING) {
    app.use(logger('dev'));
  }
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
  setUpOIDC(app, port, indexPath, hostnames);
}

function setUpStaticFolders() {
  // Serve /sw.js with the ASSET_URL placeholder (baked into the precache
  // manifest at build time by workbox-webpack-plugin's InjectManifest -
  // see webpack.config.babel.js / app/util/serviceWorker.js) replaced by
  // this deployment's actual CDN base URL - or stripped out entirely when
  // ASSET_URL isn't set. Only production builds actually produce
  // _static/sw.js (InjectManifest is production-only), and app/client.js
  // only ever registers this service worker when !IS_DEV_BUILD, so this
  // route is skipped entirely in dev - mirrors app/server.js's own
  // IS_DEV_BUILD guard around its manifest.json/stats.json reads.
  if (!IS_DEV_BUILD) {
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
  if (IS_DEV_BUILD) {
    const hotloadPort = process.env.HOT_LOAD_PORT || 9000;
    // proxy for dev-bundle
    app.use('/proxy/', proxy(`http://localhost:${hotloadPort}/`));
  }
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
      IS_DEV_BUILD ? `${err.message}\n${err.stack}` : 'Internal server error',
    );
}

function setUpErrorHandling() {
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

function processTicketTypeResult(result) {
  const resultData = result.data;
  if (config.availableTickets) {
    if (resultData && Array.isArray(resultData.ticketTypes)) {
      resultData.ticketTypes.forEach(ticket => {
        const { feedId: ticketFeed } = splitGtfsId(ticket.fareId);
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
  } else {
    console.log(
      'availableTickets not loaded, missing availableTickets object from config-file',
    );
  }
}

function setUpAvailableTickets() {
  return new Promise(resolve => {
    const options = {
      method: 'POST',
      body: '{ ticketTypes { price fareId zones } }',
      headers: { 'Content-Type': 'application/graphql' },
    };
    const queryParameters = config.hasAPISubscriptionQueryParameter
      ? `?${config.API_SUBSCRIPTION_QUERY_PARAMETER_NAME}=${config.API_SUBSCRIPTION_TOKEN}`
      : '';
    // try to fetch available ticketTypes every four seconds with 4 retries
    retryFetch(`${config.URL.OTP}gtfs/v1${queryParameters}`, 4, 4000, options)
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
            retryFetch(
              `${config.URL.OTP}gtfs/v1${queryParameters}`,
              1440,
              60000,
              options,
            )
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

function getZoneUrl(json) {
  const zoneLayer =
    !json?.noZoneSharing &&
    json?.layers.find(
      layer => layer.name.fi === 'Vyöhykkeet' || layer.name.en === 'Zones',
    );
  if (zoneLayer && !allZones) {
    // use a geoJson source to initialize combined zone data
    allZones = zoneLayer;
  }
  return zoneLayer?.url;
}

async function fetchGeoJsonConfig(url) {
  try {
    const response = await getJson(url);
    return response.geoJson || response.geojson;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function collectGeoJsonZones() {
  if (!process.env.ASSEMBLE_GEOJSON) {
    return Promise.resolve();
  }
  return new Promise(mainResolve => {
    const promises = [];
    configFiles.forEach(file => {
      // eslint-disable-next-line import/no-dynamic-require
      const conf = require(`${configsDir}/${file}`);
      const { geoJson } = conf.default;
      if (geoJson) {
        if (geoJson.layerConfigUrl) {
          promises.push(
            new Promise(resolve => {
              fetchGeoJsonConfig(geoJson.layerConfigUrl).then(data => {
                resolve(getZoneUrl(data));
              });
            }),
          );
        } else {
          promises.push(
            new Promise(resolve => {
              resolve(getZoneUrl(geoJson));
            }),
          );
        }
      }
    });

    Promise.all(promises).then(urls => {
      if (allZones) {
        // valid zone data was found
        allZones.url = urls.filter(url => !!url); // drop invalid
        console.log(`Assembled ${allZones.url.length} geoJson zones`);
        configTools.setAssembledZones(allZones);
      }
      mainResolve();
    });
  });
}

function startServer() {
  const server = app.listen(port, () =>
    console.log('Digitransit-ui available on port %d', server.address().port),
  );
}

async function fetchCitybikeSeasons() {
  const client = new CosmosClient(process.env.CITYBIKE_DB_CONN_STRING);
  const database = client.database(process.env.CITYBIKE_DATABASE);
  const container = database.container('schedules');
  const query = {
    query: 'SELECT * FROM c',
  };

  const { resources } = await container.items.query(query).fetchAll();
  console.log('citybike season configurations fetched from the database');
  return resources;
}

function buildCitybikeConfig(seasonDef, configName) {
  const inSeason = seasonDef.inSeason.split('-');
  return {
    configName: seasonDef.configName,
    networkName: seasonDef.networkName,
    enabled: seasonDef.enabled,
    season: {
      preSeasonStart: seasonDef.preSeason,
      start: inSeason[0],
      end: inSeason[1],
    },
  };
}

function handleCitybikeSeasonConfigurations(schedules, configName) {
  const seasonDefinitions = schedules.filter(
    seasonDef => seasonDef.configName === configName,
  );
  const configurations = [];
  seasonDefinitions.forEach(def =>
    configurations.push(buildCitybikeConfig(def, configName)),
  );
  return configurations;
}
function fetchCitybikeConfigurations() {
  if (!process.env.CITYBIKE_DB_CONN_STRING || !process.env.CITYBIKE_DATABASE) {
    return Promise.resolve();
  }

  return new Promise(mainResolve => {
    const promises = [];

    fetchCitybikeSeasons()
      .then(r => {
        const schedules = [];
        r.forEach(seasonDef => schedules.push(...seasonDef.schedules));
        configFiles.forEach(file => {
          // eslint-disable-next-line import/no-dynamic-require
          const conf = require(`${configsDir}/${file}`);
          const configName = conf.default.CONFIG;
          const { vehicleRental } = conf.default;
          if (vehicleRental && Object.keys(vehicleRental).length > 0) {
            promises.push(
              new Promise(resolve => {
                resolve(
                  handleCitybikeSeasonConfigurations(schedules, configName),
                );
              }),
            );
          }
        });
        Promise.all(promises).then(definitions => {
          // filter empty objects and duplicates
          const seasonDefinitions = definitions
            .filter(seasonDef => Object.keys(seasonDef).length > 0)
            .flat()
            .filter(
              (v, i, a) =>
                a.findIndex(v2 => v2.networkName === v.networkName) === i,
            );
          console.log(
            `fetched: ${seasonDefinitions.length} citybike season configuration`,
          );
          console.log(seasonDefinitions);
          configTools.setAvailableCitybikeConfigurations(seasonDefinitions);
          mainResolve();
        });
      })
      .catch(err => {
        console.log('error fetching citybike season configurations', err);
        mainResolve();
      });
  });
}
/* ********* Init ********* */

if (process.env.OIDC_CLIENT_ID) {
  setUpOpenId();
}
setUpStaticFolders();
setUpMiddleware();
setUpRoutes();
setUpErrorHandling();
Promise.all([
  setUpAvailableTickets(),
  collectGeoJsonZones(),
  fetchCitybikeConfigurations(),
]).then(startServer);

module.exports.app = app;
