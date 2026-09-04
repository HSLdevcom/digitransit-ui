import React from 'react';
import ReactDOM from 'react-dom';
import BrowserProtocol from 'farce/BrowserProtocol';
import createFarceRouter from 'found/createFarceRouter';
import makeRouteConfig from 'found/makeRouteConfig';
import { Resolver } from 'found-relay';
import provideContext from 'fluxible-addons-react/provideContext';
import debug from 'debug';
import {
  RelayNetworkLayer,
  urlMiddleware,
  retryMiddleware,
  errorMiddleware,
  cacheMiddleware,
} from 'react-relay-network-modern';
import { Workbox } from 'workbox-window';
import { Helmet } from 'react-helmet';
import { Environment, RecordSource, Store } from 'relay-runtime';
import { RelayEnvironmentProvider } from 'react-relay';
import { setRelayEnvironment } from '@digitransit-search-util/digitransit-search-util-query-utils';
import { Settings } from 'luxon';
import { IntlProvider } from 'react-intl';
import { configShape } from './util/shapes';
import i18n from './i18n';
import { historyMiddlewares, render } from './routes';
import appCreator from './app';
import { BUILD_TIME } from './buildInfo';
import ErrorBoundary from './component/ErrorBoundary';
import oldParamParser from './util/oldParamParser';
import { IS_DEV_BUILD } from './util/envUtils';
import { ClientProvider as ClientBreakpointProvider } from './util/withBreakpoint';
import IntlBridge from './util/IntlBridge';
import meta from './meta';
import {
  initAnalyticsClientSide,
  addAnalyticsEvent,
  handleUserAnalytics,
} from './util/analyticsUtils';
import { getCountries } from './store/localStorage';
import { configureCountry } from './util/configureCountry';
import { getUser } from './util/apiUtils';
import {
  fetchFavourites,
  fetchFavouritesComplete,
} from './action/FavouriteActions';
import { ConfigProvider } from './configurations/ConfigContext';
import { FavouriteProvider } from './hooks/FavouriteContext';
import { TimeProvider } from './hooks/TimeContext';

window.debug = debug; // Allow _debug.enable('*') in browser console

const { config } = window;
const app = appCreator(config);
const context = app.createContext({ config });

const ContextProvider = provideContext(IntlProvider, {
  config: configShape,
});

const AppProviders = props => {
  const providers = [
    [ConfigProvider, { value: props.config }],
    [ClientBreakpointProvider],
    [
      ContextProvider,
      {
        locale: props.language,
        messages: props.messages,
        context: props.context,
        textComponent: 'span',
      },
    ],
    [IntlBridge],
    [RelayEnvironmentProvider, { environment: props.environment }],
    [FavouriteProvider, { context: props.context }],
    [TimeProvider],
  ];
  return providers.reduceRight(
    (children, [Provider, value]) => <Provider {...value}>{children}</Provider>,
    props.children,
  );
};

const getParams = query => {
  if (!query) {
    return {};
  }

  return query
    .substring(1)
    .split('&')
    .map(v => v.split('='))
    .reduce((params, [key, value]) => {
      const newParam = {};
      newParam[key] = decodeURIComponent(value);
      return { ...params, ...newParam };
    }, {});
};

async function init() {
  // Get additional feedIds and searchParams from localstorage
  if (config.mainMenu.countrySelection) {
    configureCountry(config, getCountries());
  }

  // For Google Tag Manager
  initAnalyticsClientSide(config);

  window.context = context;

  // Query parameter is used instead of header because browsers send
  // OPTIONS queries where you can't define headers
  const queryParameters = config.hasAPISubscriptionQueryParameter
    ? `?${config.API_SUBSCRIPTION_QUERY_PARAMETER_NAME}=${config.API_SUBSCRIPTION_TOKEN}`
    : '';

  const { language } = config;
  const translations = await import(`./translations/${language}`);
  i18n.changeLanguage(language);

  const network = new RelayNetworkLayer([
    cacheMiddleware({
      size: 200,
      ttl: 60 * 60 * 1000,
    }),
    urlMiddleware({
      url: () => Promise.resolve(`${config.URL.OTP}gtfs/v1${queryParameters}`),
    }),
    errorMiddleware(),
    retryMiddleware({
      fetchTimeout: config.OTPTimeout + 1000,
    }),
    next => async req => {
      // eslint-disable-next-line no-param-reassign
      req.fetchOpts.headers.OTPTimeout = config.OTPTimeout;
      req.fetchOpts.headers['Accept-Language'] = language;
      return next(req);
    },
  ]);

  const environment = new Environment({
    network,
    store: new Store(new RecordSource()),
  });

  setRelayEnvironment(environment);

  const resolver = new Resolver(environment);

  const routeConfig = makeRouteConfig(app.getComponent());

  const historyProtocol = new BrowserProtocol();

  const Router = await createFarceRouter({
    historyProtocol,
    historyMiddlewares,
    routeConfig,
    resolver,
    render,
  });

  context
    .getComponentContext()
    .getStore('MessageStore')
    .addConfigMessages(config);

  // configure luxon timezone and locale
  Settings.defaultLocale = language;
  if (config.timeZone) {
    Settings.defaultZone = config.timeZone;
  }

  const path = window.location.pathname;

  if (config.redirectReittiopasParams) {
    const query = getParams(window.location.search);

    if (query.from || query.to || query.from_in || query.to_in) {
      oldParamParser(query, config).then(redirectUrl =>
        window.location.replace(redirectUrl),
      );
    } else if (['/fi/', '/en/', '/sv/', '/ru/', '/slangi/'].includes(path)) {
      window.location.replace('/');
    }
  }
  // send tracking call for initial page load.
  // tracking page changes is done in TopLevel component
  addAnalyticsEvent({
    event: 'Pageview',
    url: path,
  });

  // fetch Userdata and favourites
  if (config.allowLogin) {
    getUser()
      .then(user => {
        config.user = user || {};
        handleUserAnalytics(config);
        context.executeAction(fetchFavourites);
      })
      .catch(() => {
        config.user = { notLogged: true };
        context.executeAction(fetchFavouritesComplete);
      });
  }

  const content = (
    <AppProviders
      config={config}
      language={language}
      messages={translations.default[language]}
      context={context.getComponentContext()}
      environment={environment}
    >
      <ErrorBoundary>
        <React.Fragment>
          <Helmet
            {...meta(
              language,
              window.location.host,
              window.location.href,
              config,
            )}
          />
          <Router resolver={resolver} />
        </React.Fragment>
      </ErrorBoundary>
    </AppProviders>
  );

  const rootNode = document.getElementById('app');
  ReactDOM.render(content, rootNode, () => {
    if (!IS_DEV_BUILD && BUILD_TIME !== 'unset') {
      // The service worker itself calls `skipWaiting()`/`clients.claim()`
      // (see app/util/serviceWorker.js) so new versions take over as soon
      // as they finish installing - mirrors the previous
      // `OfflinePlugin.install({ onUpdateReady: () =>
      // OfflinePlugin.applyUpdate() })` behaviour, just with the
      // "apply immediately" decision made service-worker-side instead of
      // here.
      new Workbox('/sw.js').register();
    }
  });

  // Listen for Web App Install Banner events
  window.addEventListener('beforeinstallprompt', e => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'installprompt',
      action: 'fired',
      name: 'fired',
    });
    // e.userChoice will return a Promise. (Only in chrome, not IE)
    if (e.userChoice) {
      e.userChoice.then(choiceResult =>
        addAnalyticsEvent({
          event: 'sendMatomoEvent',
          category: 'installprompt',
          action: 'result',
          name: choiceResult.outcome,
        }),
      );
    }
  });
}

init();
