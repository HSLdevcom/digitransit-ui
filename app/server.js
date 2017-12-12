import PropTypes from 'prop-types';
// React
import React from 'react';
import ReactDOM from 'react-dom/server';

// Routing and state handling
import match from 'react-router/lib/match';
import Helmet from 'react-helmet';
import createHistory from 'react-router/lib/createMemoryHistory';
import Relay from 'react-relay/classic';
import IsomorphicRouter from 'isomorphic-relay-router';
import {
  RelayNetworkLayer,
  urlMiddleware,
  gqErrorsMiddleware,
  retryMiddleware,
  batchMiddleware,
} from 'react-relay-network-layer/lib';
import provideContext from 'fluxible-addons-react/provideContext';

// Libraries
import serialize from 'serialize-javascript';
import { IntlProvider } from 'react-intl';
import polyfillService from 'polyfill-service';
import fs from 'fs';
import path from 'path';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import LRU from 'lru-cache';

// Application
import appCreator from './app';
import translations from './translations';
import MUITheme from './MuiTheme';

// configuration
import { getConfiguration } from './config';

// Look up paths for various asset files
const appRoot = `${process.cwd()}/`;

// cached assets
const polyfillls = LRU(200);

// Disable relay query cache in order tonot leak memory, see facebook/relay#754
Relay.disableQueryCaching();

let assets;
let manifest;

if (process.env.NODE_ENV !== 'development') {
  assets = require('../manifest.json'); // eslint-disable-line global-require, import/no-unresolved

  const manifestFile = assets['manifest.js'];
  manifest = fs.readFileSync(path.join(appRoot, '_static', manifestFile));
}

function getPolyfills(userAgent, config) {
  // Do not trust Samsung, LG
  // see https://digitransit.atlassian.net/browse/DT-360
  // https://digitransit.atlassian.net/browse/DT-445
  // Also https://github.com/Financial-Times/polyfill-service/issues/727
  if (
    !userAgent ||
    /(IEMobile|LG-|GT-|SM-|SamsungBrowser|Google Page Speed Insights)/.test(
      userAgent,
    )
  ) {
    userAgent = ''; // eslint-disable-line no-param-reassign
  }

  const normalizedUA = polyfillService.normalizeUserAgent(userAgent);
  let polyfill = polyfillls.get(normalizedUA);

  if (polyfill) {
    return polyfill;
  }

  const features = {
    'caniuse:console-basic': { flags: ['gated'] },
    default: { flags: ['gated'] },
    es5: { flags: ['gated'] },
    es6: { flags: ['gated'] },
    es7: { flags: ['gated'] },
    es2017: { flags: ['gated'] },
    fetch: { flags: ['gated'] },
    Intl: { flags: ['gated'] },
    'Object.assign': { flags: ['gated'] },
    matchMedia: { flags: ['gated'] },
  };

  config.availableLanguages.forEach(language => {
    features[`Intl.~locale.${language}`] = {
      flags: ['gated'],
    };
  });

  polyfill = polyfillService
    .getPolyfillString({
      uaString: userAgent,
      features,
      minify: process.env.NODE_ENV !== 'development',
      unknown: 'polyfill',
    })
    .then(polyfills =>
      // no sourcemaps for inlined js
      polyfills.replace(/^\/\/# sourceMappingURL=.*$/gm, ''),
    );

  polyfillls.set(normalizedUA, polyfill);
  return polyfill;
}

const ContextProvider = provideContext(IntlProvider, {
  config: PropTypes.object,
  url: PropTypes.string,
  headers: PropTypes.object,
});

function getContent(context, renderProps, locale, userAgent) {
  // TODO: This should be moved to a place to coexist with similar content from client.js
  return ReactDOM.renderToString(
    <ContextProvider
      locale={locale}
      messages={translations[locale]}
      context={context.getComponentContext()}
    >
      <MuiThemeProvider
        muiTheme={getMuiTheme(MUITheme(context.getComponentContext().config), {
          userAgent,
        })}
      >
        {IsomorphicRouter.render(renderProps)}
      </MuiThemeProvider>
    </ContextProvider>,
  );
}

const isRobotRequest = agent =>
  agent &&
  (agent.indexOf('facebook') !== -1 || agent.indexOf('Twitterbot') !== -1);

export default function(req, res, next) {
  const config = getConfiguration(req);

  // TODO: Move this to PreferencesStore
  // 1. use locale from cookie (user selected) 2. browser preferred 3. default
  let locale =
    req.cookies.lang || req.acceptsLanguages(config.availableLanguages);

  if (config.availableLanguages.indexOf(locale) === -1) {
    locale = config.defaultLanguage;
  }

  if (req.cookies.lang === undefined || req.cookies.lang !== locale) {
    res.cookie('lang', locale);
  }

  const application = appCreator(config);
  const context = application.createContext({
    url: req.url,
    headers: req.headers,
    config,
  });

  context
    .getComponentContext()
    .getStore('MessageStore')
    .addConfigMessages(config);

  // required by material-ui
  const agent = req.headers['user-agent'];
  global.navigator = { userAgent: agent };

  const location = createHistory({ basename: config.APP_PATH }).createLocation(
    req.url,
  );

  match(
    {
      routes: context.getComponent(),
      location,
    },
    (error, redirectLocation, renderProps) => {
      if (redirectLocation) {
        res.redirect(301, redirectLocation.pathname + redirectLocation.search);
      } else if (error) {
        next(error);
      } else if (!renderProps) {
        res.status(404).send('Not found');
      } else {
        if (
          renderProps.components.filter(
            component => component && component.displayName === 'Error404',
          ).length > 0
        ) {
          res.status(404);
        }

        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.write('<!doctype html>\n');
        res.write(`<html lang="${locale}">\n`);
        res.write('<head>\n');
        res.write(
          `<link rel="stylesheet" type="text/css" href="${
            config.URL.FONT
          }"/>\n`,
        );

        if (process.env.NODE_ENV !== 'development') {
          const mainHref = `${config.APP_PATH}/${assets['main.css']}`;
          const themeHref = `${config.APP_PATH}/${
            assets[`${config.CONFIG}_theme.css`]
          }`;

          res.write(
            `<link rel="stylesheet" type="text/css" href="${mainHref}"/>\n`,
          );
          res.write(
            `<link rel="stylesheet" type="text/css" href="${themeHref}"/>\n`,
          );

          res.write(
            `<link rel="preload" as="script" href="${config.APP_PATH}/${
              assets['common.js']
            }">\n`,
          );
          res.write(
            `<link rel="preload" as="script" href="${config.APP_PATH}/${
              assets['main.js']
            }">\n`,
          );

          res.write(
            `<link rel="preconnect" crossorigin href="${
              config.URL.API_URL
            }">\n`,
          );
          res.write(
            `<link rel="preconnect" crossorigin href="${
              config.URL.MAP_URL
            }">\n`,
          );
          res.write(
            `<link rel="preconnect" crossorigin as="font" href="https://dev.hsl.fi/">\n`,
          );
        }

        const RELAY_FETCH_TIMEOUT = process.env.RELAY_FETCH_TIMEOUT || 1000;

        const networkLayer = new RelayNetworkLayer([
          nex => r => nex(r).catch(() => ({ payload: { data: null } })),
          retryMiddleware({
            fetchTimeout: isRobotRequest(agent) ? 10000 : RELAY_FETCH_TIMEOUT,
            retryDelays: [],
          }),
          urlMiddleware({
            url: `${config.URL.OTP}index/graphql`,
          }),
          batchMiddleware({
            batchUrl: `${config.URL.OTP}index/graphql/batch`,
          }),
          gqErrorsMiddleware(),
        ]);

        Promise.all([
          getPolyfills(agent, config),
          // Isomorphic rendering is ok to fail due timeout
          IsomorphicRouter.prepareData(renderProps, networkLayer),
        ])
          .then(([polyfills, relayData]) => {
            // eslint-disable-next-line no-unused-vars
            const content =
              relayData != null
                ? getContent(
                    context,
                    relayData.props,
                    locale,
                    req.headers['user-agent'],
                  )
                : undefined;
            const head = Helmet.rewind();
            if (head) {
              res.write(head.title.toString());
              res.write(head.meta.toString());
              res.write(head.link.toString());
            }
            res.write('</head>\n');
            res.write('<body>\n');

            res.write(`<script>\n${polyfills}\n</script>\n`);
            const spriteName = config.sprites;

            if (process.env.NODE_ENV !== 'development') {
              res.write('<script>\n');
              res.write(`fetch('${config.APP_PATH}/${assets[spriteName]}')
                  .then(function(response) {return response.text();}).then(function(blob) {
                    var div = document.createElement('div');
                    div.innerHTML = blob;
                    document.body.insertBefore(div, document.body.childNodes[0]);
                  });`);
              res.write('</script>\n');
            } else {
              res.write('<div>\n');
              res.write(
                fs.readFileSync(`${appRoot}_static/${spriteName}`).toString(),
              );
              res.write('</div>\n');
            }

            res.write(`<div id="app">${content}</div>\n`);

            res.write(
              `<script>\nwindow.state=${serialize(
                application.dehydrate(context),
              )};\n</script>\n`,
            );

            res.write('<script type="application/json" id="relayData">\n');
            res.write(JSON.stringify(relayData != null ? relayData.data : []));
            res.write('\n</script>\n');

            if (process.env.NODE_ENV === 'development') {
              res.write('<script async src="/proxy/js/bundle.js"></script>\n');
            } else {
              res.write('<script>');
              res.write(manifest);
              res.write('\n</script>\n');
              res.write(
                `<script src="${config.APP_PATH}/${
                  assets['common.js']
                }"></script>\n`,
              );
              res.write(
                `<script src="${config.APP_PATH}/${
                  assets['main.js']
                }"></script>\n`,
              );
            }
            res.write(
              '<noscript>This page requires JavaScript to run.</noscript>\n',
            );
            res.write('</body>\n');
            res.write('</html>\n');
            res.end();
          })
          .catch(err => {
            if (err) {
              next(err);
            }
          });
      }
    },
  );
}
