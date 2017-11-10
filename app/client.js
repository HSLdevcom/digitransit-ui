import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay/classic';
import { Router, match } from 'react-router';
import IsomorphicRelay from 'isomorphic-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import provideContext from 'fluxible-addons-react/provideContext';
import tapEventPlugin from 'react-tap-event-plugin';
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

import Raven from './util/Raven';
import configureMoment from './util/configure-moment';
import StoreListeningIntlProvider from './util/StoreListeningIntlProvider';
import MUITheme from './MuiTheme';
import appCreator from './app';
import translations from './translations';
import { openFeedbackModal } from './action/feedbackActions';
import { shouldDisplayPopup } from './util/Feedback';
import historyCreator from './history';
import { COMMIT_ID, BUILD_TIME } from './buildInfo';
import Piwik from './util/piwik';

const plugContext = f => () => ({
  plugComponentContext: f,
  plugActionContext: f,
  plugStoreContext: f,
});

window.debug = debug; // Allow _debug.enable('*') in browser console

// Material-ui uses touch tap events
tapEventPlugin();

// TODO: this is an ugly hack, but required due to cyclical processing in app
const config = window.state.context.plugins['extra-context-plugin'].config;
const app = appCreator(config);

const piwik = Piwik.getTracker(config.PIWIK_ADDRESS, config.PIWIK_ID);

if (!config.PIWIK_ADDRESS || !config.PIWIK_ID || config.PIWIK_ID === '') {
  piwik.trackEvent = () => {};
  piwik.setCustomVariable = () => {};
  piwik.trackPageView = () => {};
}

const addPiwik = c => {
  c.piwik = piwik; // eslint-disable-line no-param-reassign
};

const piwikPlugin = {
  name: 'PiwikPlugin',
  plugContext: plugContext(addPiwik),
};

const raven = Raven(config.SENTRY_DSN, piwik.getVisitorId());

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

    const history = historyCreator(config);

    function track() {
      // track "getting back to home"
      const newHref = this.props.router.createHref(this.state.location);

      if (this.href !== undefined && newHref === '/' && this.href !== newHref) {
        if (
          config.feedback.enable &&
          shouldDisplayPopup(
            context
              .getComponentContext()
              .getStore('TimeStore')
              .getCurrentTime()
              .valueOf(),
          )
        ) {
          context.executeAction(openFeedbackModal);
        }
      }

      this.href = newHref;
      piwik.setCustomUrl(this.props.router.createHref(this.state.location));
      piwik.trackPageView();
    }

    const ContextProvider = provideContext(StoreListeningIntlProvider, {
      piwik: PropTypes.object,
      raven: PropTypes.object,
      url: PropTypes.string,
      config: PropTypes.object,
      headers: PropTypes.object,
    });

    // init geolocation handling

    match(
      { routes: app.getComponent(), history },
      (error, redirectLocation, renderProps) => {
        IsomorphicRouter.prepareInitialRender(
          Relay.Store,
          renderProps,
        ).then(props => {
          ReactDOM.render(
            <ContextProvider
              translations={translations}
              context={context.getComponentContext()}
            >
              <MuiThemeProvider
                muiTheme={getMuiTheme(MUITheme(config), {
                  userAgent: navigator.userAgent,
                })}
              >
                <Router {...props} onUpdate={track} />
              </MuiThemeProvider>
            </ContextProvider>,
            document.getElementById('app'),
            () => {
              // Run only in production mode and when built in a docker container
              if (
                process.env.NODE_ENV === 'production' &&
                BUILD_TIME !== 'unset'
              ) {
                OfflinePlugin.install();
              }
            },
          );
        });
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

    piwik.enableLinkTracking();

    // Send perf data after React has compared real and shadow DOMs
    // and started positioning
    piwik.setCustomVariable(4, 'commit_id', COMMIT_ID, 'visit');
    piwik.setCustomVariable(5, 'build_time', BUILD_TIME, 'visit');
  });

// Guard againist Samsung et.al. which are not properly polyfilled by polyfill-service
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
