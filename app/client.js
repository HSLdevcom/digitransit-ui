import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay/classic';
import { Router, match } from 'react-router';
import IsomorphicRelay from 'isomorphic-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import provideContext from 'fluxible-addons-react/provideContext';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import debug from 'debug';
import {
  RelayNetworkLayer,
  urlMiddleware,
  gqErrorsMiddleware,
  retryMiddleware,
  batchMiddleware,
} from 'react-relay-network-layer/lib';
import OfflinePlugin from 'offline-plugin/runtime';
import Helmet from 'react-helmet';

import Raven from './util/Raven';
import configureMoment from './util/configure-moment';
import StoreListeningIntlProvider from './util/StoreListeningIntlProvider';
import MUITheme from './MuiTheme';
import appCreator from './app';
import translations from './translations';
import historyCreator from './history';
import { BUILD_TIME } from './buildInfo';
import createPiwik from './util/piwik';
import ErrorBoundary from './component/ErrorBoundary';
import oldParamParser from './util/oldParamParser';
import { ClientProvider as ClientBreakpointProvider } from './util/withBreakpoint';
import meta from './meta';
import { isIOSApp } from './util/browser';

const plugContext = f => () => ({
  plugComponentContext: f,
  plugActionContext: f,
  plugStoreContext: f,
});

window.debug = debug; // Allow _debug.enable('*') in browser console

// TODO: this is an ugly hack, but required due to cyclical processing in app
const { config } = window.state.context.plugins['extra-context-plugin'];
const app = appCreator(config);

const raven = Raven(config.SENTRY_DSN);
const piwik = createPiwik(config, raven);

const addPiwik = c => {
  c.piwik = piwik; // eslint-disable-line no-param-reassign
};

const piwikPlugin = {
  name: 'PiwikPlugin',
  plugContext: plugContext(addPiwik),
};

const addRaven = c => {
  c.raven = raven; // eslint-disable-line no-param-reassign
};

const ravenPlugin = {
  name: 'RavenPlugin',
  plugContext: plugContext(addRaven),
};

// Add plugins
app.plug(ravenPlugin);
app.plug(piwikPlugin);

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

// Run application
const callback = () =>
  app.rehydrate(window.state, (err, context) => {
    if (err) {
      throw err;
    }

    window.context = context;

    if (process.env.NODE_ENV === 'development') {
      try {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require(`../sass/themes/${config.CONFIG}/main.scss`);
      } catch (error) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require('../sass/themes/default/main.scss');
      }
    }

    Relay.injectNetworkLayer(
      new RelayNetworkLayer([
        urlMiddleware({
          url: `${config.URL.OTP}index/graphql`,
        }),
        batchMiddleware({
          batchUrl: `${config.URL.OTP}index/graphql/batch`,
        }),
        gqErrorsMiddleware(),
        retryMiddleware({
          fetchTimeout: config.OTPTimeout + 1000,
        }),
        next => req => {
          // eslint-disable-next-line no-param-reassign
          req.headers.OTPTimeout = config.OTPTimeout;
          req.headers.id = piwik.getVisitorId();
          return next(req);
        },
      ]),
    );

    IsomorphicRelay.injectPreparedData(
      Relay.Store,
      JSON.parse(document.getElementById('relayData').textContent),
    );

    context
      .getComponentContext()
      .getStore('MessageStore')
      .addConfigMessages(config);

    const language = context
      .getComponentContext()
      .getStore('PreferencesStore')
      .getLanguage();

    configureMoment(language, config);

    let hasSwUpdate = false;
    const history = historyCreator(config);

    if (config.redirectReittiopasParams) {
      const path = window.location.pathname;
      const query = getParams(window.location.search);

      if (query.from || query.to || query.from_in || query.to_in) {
        oldParamParser(query, config).then(redirectUrl =>
          window.location.replace(redirectUrl),
        );
      } else if (['/fi/', '/en/', '/sv/', '/ru/', '/slangi/'].includes(path)) {
        window.location.replace('/');
      }
    }

    function track() {
      this.href = this.props.router.createHref(this.state.location);
      piwik.setCustomUrl(this.href);
      piwik.trackPageView();
      if (hasSwUpdate && !this.state.location.state) {
        window.location = this.href;
      }
    }

    const ContextProvider = provideContext(StoreListeningIntlProvider, {
      piwik: PropTypes.object,
      raven: PropTypes.object,
      config: PropTypes.object,
      headers: PropTypes.object,
    });

    match(
      { routes: app.getComponent(), history },
      (error, redirectLocation, renderProps) => {
        if (redirectLocation) {
          window.location.replace(
            redirectLocation.pathname + redirectLocation.search,
          );
        } else {
          IsomorphicRouter.prepareInitialRender(Relay.Store, renderProps).then(
            props => {
              const root = document.getElementById('app');
              const { initialBreakpoint } = root.dataset;

              // KLUDGE: SSR and CSR mismatch breaks the UI in iOS PWA mode
              // see: https://github.com/facebook/react/issues/11336
              if (isIOSApp) {
                root.innerHTML = '';
              }

              const content = (
                <ClientBreakpointProvider
                  serverGuessedBreakpoint={initialBreakpoint}
                >
                  <ContextProvider
                    translations={translations}
                    context={context.getComponentContext()}
                  >
                    <ErrorBoundary>
                      <MuiThemeProvider
                        muiTheme={getMuiTheme(MUITheme(config), {
                          userAgent: navigator.userAgent,
                        })}
                      >
                        <React.Fragment>
                          <Helmet
                            {...meta(
                              context
                                .getStore('PreferencesStore')
                                .getLanguage(),
                              window.location.host,
                              window.location.href,
                              config,
                            )}
                          />
                          <Router {...props} onUpdate={track} />
                        </React.Fragment>
                      </MuiThemeProvider>
                    </ErrorBoundary>
                  </ContextProvider>
                </ClientBreakpointProvider>
              );

              ReactDOM.hydrate(content, root, () => {
                // Run only in production mode and when built in a docker container
                if (
                  process.env.NODE_ENV === 'production' &&
                  BUILD_TIME !== 'unset'
                ) {
                  OfflinePlugin.install({
                    onUpdateReady: () => OfflinePlugin.applyUpdate(),
                    onUpdated: () => {
                      hasSwUpdate = true;
                    },
                  });
                }
              });
            },
          );
        }
      },
    );

    // Listen for Web App Install Banner events
    window.addEventListener('beforeinstallprompt', e => {
      piwik.trackEvent('installprompt', 'fired');

      // e.userChoice will return a Promise. (Only in chrome, not IE)
      if (e.userChoice) {
        e.userChoice.then(choiceResult =>
          piwik.trackEvent('installprompt', 'result', choiceResult.outcome),
        );
      }
    });
  });

// Guard againist Samsung et.al. which are not properly polyfilled by polyfill-library
if (typeof window.Intl !== 'undefined') {
  callback();
} else {
  const modules = [
    import(/* webpackChunkName: "intl",  webpackMode: "lazy" */ 'intl'),
  ];

  config.availableLanguages.forEach(language => {
    modules.push(
      import(/* webpackChunkName: "intl",  webpackMode: "lazy-once" */ `intl/locale-data/jsonp/${language}`),
    );
  });

  Promise.all(modules).then(callback);
}
