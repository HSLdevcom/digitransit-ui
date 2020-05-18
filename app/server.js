import PropTypes from 'prop-types';
// React
import React from 'react';
import ReactDOM from 'react-dom/server';

// Routing and state handling
import match from 'react-router/lib/match';
import Helmet from 'react-helmet';
import createHistory from 'react-router/lib/createMemoryHistory';
import RelayQueryCaching from 'react-relay/lib/RelayQueryCaching';
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
import PolyfillLibrary from 'polyfill-library';
import fs from 'fs';
import path from 'path';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import LRU from 'lru-cache';

// Application
import appCreator from './app';
import translations from './translations';
import MUITheme from './MuiTheme';
import configureMoment from './util/configure-moment';
import { BreakpointProvider, getServerBreakpoint } from './util/withBreakpoint';
import meta from './meta';

// configuration
import { getConfiguration } from './config';
import { getAnalyticsInitCode } from './util/analyticsUtils';

// Look up paths for various asset files
const appRoot = `${process.cwd()}/`;

// cached assets
const polyfillls = LRU(200);
const polyfillLibrary = new PolyfillLibrary();

// Disable relay query cache in order tonot leak memory, see facebook/relay#754
RelayQueryCaching.disable();

let assets;
let mainAssets;
let manifest;

if (process.env.NODE_ENV !== 'development') {
  // eslint-disable-next-line global-require, import/no-unresolved
  assets = require('../manifest.json');
  // eslint-disable-next-line global-require, import/no-unresolved
  mainAssets = require('../stats.json').entrypoints.main.assets.filter(
    asset => !asset.endsWith('.map'),
  );

  const manifestFiles = mainAssets.filter(asset =>
    asset.startsWith('js/runtime'),
  );

  manifest = manifestFiles
    .map(manifestFile =>
      fs.readFileSync(path.join(appRoot, '_static', manifestFile)),
    )
    .join('\n');

  mainAssets = mainAssets.filter(asset => !manifestFiles.includes(asset));
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

  const normalizedUA = polyfillLibrary.normalizeUserAgent(userAgent);
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

  polyfill = polyfillLibrary
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

function getContent(context, renderProps, locale, userAgent, req) {
  const breakpoint = getServerBreakpoint(userAgent);
  const { config } = context.getComponentContext();
  const content = ReactDOM.renderToString(
    <BreakpointProvider value={breakpoint}>
      <ContextProvider
        locale={locale}
        messages={translations[locale]}
        context={context.getComponentContext()}
      >
        <MuiThemeProvider
          muiTheme={getMuiTheme(MUITheme(config), { userAgent })}
        >
          <React.Fragment>
            <Helmet
              {...meta(
                context.getStore('PreferencesStore').getLanguage(),
                req.hostname,
                `https://${req.hostname}${req.originalUrl}`,
                config,
              )}
            />
            {IsomorphicRouter.render(renderProps)}
          </React.Fragment>
        </MuiThemeProvider>
      </ContextProvider>
    </BreakpointProvider>,
  );
  return `<div id="app" data-initial-breakpoint="${breakpoint}">${content}</div>\n`;
}

const isRobotRequest = agent =>
  agent &&
  (agent.indexOf('facebook') !== -1 || agent.indexOf('Twitterbot') !== -1);

const RELAY_FETCH_TIMEOUT = process.env.RELAY_FETCH_TIMEOUT || 1000;

function getNetworkLayer(config, agent) {
  return new RelayNetworkLayer([
    next => req => next(req).catch(() => ({ payload: { data: null } })),
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
}

function getLocale(req, res, config) {
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

  return locale;
}

function validateParams(params) {
  const idFields = ['stopId', 'routeId', 'terminalId', 'patternId', 'tripId'];
  return idFields.every(f => !params[f] || params[f].indexOf(':') !== -1);
}

export default function(req, res, next) {
  const config = getConfiguration(req);
  const locale = getLocale(req, res, config);
  const application = appCreator(config);
  const context = application.createContext({
    headers: req.headers,
    config,
  });

  context
    .getComponentContext()
    .getStore('MessageStore')
    .addConfigMessages(config);

  const language = context
    .getComponentContext()
    .getStore('PreferencesStore')
    .getLanguage();

  configureMoment(language, config);

  // required by material-ui
  const agent = req.headers['user-agent'];
  global.navigator = { userAgent: agent };

  const matchOptions = {
    routes: context.getComponent(),
    location: createHistory({ basename: config.APP_PATH }).createLocation(
      req.url,
    ),
  };

  match(matchOptions, async (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      return res.redirect(
        301,
        redirectLocation.pathname + redirectLocation.search,
      );
    }
    if (error) {
      return next(error);
    }
    if (!renderProps) {
      return res.status(404).send('Not found');
    }

    if (renderProps.params) {
      if (!validateParams(renderProps.params)) {
        return res.redirect(301, '/');
      }
    }

    if (
      renderProps.components.filter(
        component => component && component.displayName === 'Error404',
      ).length > 0
    ) {
      res.status(404);
    }

    const spriteName = config.sprites;

    const ASSET_URL = process.env.ASSET_URL || config.APP_PATH;

    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.write('<!doctype html>\n');
    res.write(`<html lang="${locale}">\n`);
    res.write('<head>\n');

    // Write preload hints before doing anything else
    if (process.env.NODE_ENV !== 'development') {
      res.write(getAnalyticsInitCode(config.GTMid));

      const preloads = [
        { as: 'style', href: config.URL.FONT },
        {
          as: 'style',
          href: `${ASSET_URL}/${assets[`${config.CONFIG}_theme.css`]}`,
          crossorigin: true,
        },
        ...mainAssets.map(asset => ({
          as: asset.endsWith('.css') ? 'style' : 'script',
          href: `${ASSET_URL}/${asset}`,
          crossorigin: true,
        })),
      ];

      preloads.forEach(({ as, href, crossorigin }) =>
        res.write(
          `<link rel="preload" as="${as}" ${
            crossorigin ? 'crossorigin' : ''
          } href="${href}">\n`,
        ),
      );

      const preconnects = [
        config.URL.API_URL,
        config.URL.MAP_URL,
        config.staticMessagesUrl,
      ];

      preconnects.forEach(href =>
        res.write(`<link rel="preconnect" crossorigin href="${href}">\n`),
      );

      res.write(
        `<link rel="stylesheet" type="text/css" crossorigin href="${ASSET_URL}/${
          assets[`${config.CONFIG}_theme.css`]
        }"/>\n`,
      );
      mainAssets
        .filter(asset => asset.endsWith('.css'))
        .forEach(asset =>
          res.write(
            `<link rel="stylesheet" type="text/css" crossorigin href="${ASSET_URL}/${asset}"/>\n`,
          ),
        );
    }

    res.write(
      `<link rel="stylesheet" type="text/css" href="${config.URL.FONT}"/>\n`,
    );

    const networkLayer = getNetworkLayer(config, agent);

    // Do not block for either async function, but wait them both after each other
    const polyfillPromise = getPolyfills(agent, config).then(polyfills =>
      res.write(`<script>\n${polyfills}\n</script>\n`),
    );

    const contentPromise = IsomorphicRouter.prepareData(
      renderProps,
      networkLayer,
    )
      .then(relayData => {
        const content =
          relayData != null
            ? getContent(
                context,
                relayData.props,
                locale,
                req.headers['user-agent'],
                req,
              )
            : undefined;

        const head = Helmet.rewind();

        if (head) {
          res.write(head.title.toString());
          res.write(head.meta.toString());
          res.write(head.link.toString());
        }
        return [content, relayData];
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
        // the first element in the array is not an error message but it conveys the absence of information.
        // it is required to continue the server-side rendering correctly.
        return ['', undefined];
      });

    const [[content, relayData]] = await Promise.all([
      contentPromise,
      polyfillPromise,
    ]);

    res.write('</head>\n');
    res.write('<body>\n');

    if (process.env.NODE_ENV !== 'development') {
      res.write('<script>\n');
      res.write(`fetch('${ASSET_URL}/${assets[spriteName]}')
        .then(function(response) {return response.text();}).then(function(blob) {
          var div = document.createElement('div');
          div.innerHTML = blob;
          document.body.insertBefore(div, document.body.childNodes[0]);
        });`);
      res.write('</script>\n');
    } else {
      res.write('<div>\n');
      res.write(fs.readFileSync(`${appRoot}_static/${spriteName}`).toString());
      res.write('</div>\n');
    }

    res.write(content || '<div id="app" />');

    res.write(
      `<script>\nwindow.state=${serialize(
        application.dehydrate(context),
      )};\n</script>\n`,
    );

    res.write('<script type="application/json" id="relayData">\n');
    res.write(relayData != null ? JSON.stringify(relayData.data) : '[]');
    res.write('\n</script>\n');

    if (process.env.NODE_ENV === 'development') {
      res.write('<script async src="/proxy/js/main.js"></script>\n');
    } else {
      res.write('<script>');
      res.write(
        manifest.replace(/\/\/# sourceMappingURL=/g, `$&${ASSET_URL}/js/`),
      );
      res.write('\n</script>\n');
      res.write(`<script>window.ASSET_URL="${ASSET_URL}/"</script>\n`);
      mainAssets
        .filter(asset => !asset.endsWith('.css'))
        .forEach(asset =>
          res.write(
            `<script src="${ASSET_URL}/${asset}" crossorigin defer></script>\n`,
          ),
        );
    }
    res.write('</body>\n');
    res.write('</html>\n');
    return res.end();
  });
}
