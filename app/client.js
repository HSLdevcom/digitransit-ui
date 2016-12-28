import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import useRelay from 'react-router-relay';
import { Router, applyRouterMiddleware } from 'react-router';
import IsomorphicRelay from 'isomorphic-relay';
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
} from 'react-relay-network-layer';
import OfflinePlugin from 'offline-plugin/runtime';

import Raven from './util/Raven';
import config from './config';
import StoreListeningIntlProvider from './util/StoreListeningIntlProvider';
import MUITheme from './MuiTheme';
import app from './app';
import translations from './translations';
import { openFeedbackModal } from './action/feedbackActions';
import { shouldDisplayPopup } from './util/Feedback';
import { initGeolocation } from './action/PositionActions';
import history from './history';
import { COMMIT_ID, BUILD_TIME } from './buildInfo';

const plugContext = f => () => ({
  plugComponentContext: f,
  plugActionContext: f,
  plugStoreContext: f,
});

const piwik = require('./util/piwik').getTracker(config.PIWIK_ADDRESS, config.PIWIK_ID);

if (!config.PIWIK_ADDRESS || config.PIWIK_ID == null) {
  piwik.trackEvent = () => {};
  piwik.setCustomVariable = () => {};
  piwik.trackPageView = () => {};
}

const addPiwik = context => (context.piwik = piwik); // eslint-disable-line no-param-reassign

const piwikPlugin = {
  name: 'PiwikPlugin',
  plugContext: plugContext(addPiwik),
};

const addRaven = context => (context.raven = Raven); // eslint-disable-line no-param-reassign

const ravenPlugin = {
  name: 'RavenPlugin',
  plugContext: plugContext(addRaven),
};

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  require(`../sass/themes/${config.CONFIG}/main.scss`);
}

window.debug = debug; // Allow _debug.enable('*') in browser console

Relay.injectNetworkLayer(
  new RelayNetworkLayer([
    urlMiddleware({
      url: `${config.URL.OTP}index/graphql`,
      batchUrl: `${config.URL.OTP}index/graphql/batch`,
    }),
    gqErrorsMiddleware(),
    retryMiddleware(),
  ], { disableBatchQuery: false }),
);

IsomorphicRelay.injectPreparedData(
  Relay.Store,
  JSON.parse(document.getElementById('relayData').textContent),
);

if (typeof window.Raven !== 'undefined' && window.Raven !== null) {
  window.Raven.setUserContext({ piwik: piwik.getVisitorId() });
}

// Material-ui uses touch tap events
tapEventPlugin();

// Add plugins
app.plug(piwikPlugin);
app.plug(ravenPlugin);

// Run application
const callback = () => app.rehydrate(window.state, (err, context) => {
  if (err) {
    throw err;
  }

  window.context = context;

  function track() {
    // track "getting back to home"
    const newHref = this.props.history.createHref(this.state.location);

    if (this.href !== undefined && newHref === '/' && this.href !== newHref) {
      if (shouldDisplayPopup(
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
    piwik.setCustomUrl(this.props.history.createHref(this.state.location));
    piwik.trackPageView();
  }

  const ContextProvider = provideContext(StoreListeningIntlProvider, {
    piwik: React.PropTypes.object,
    raven: React.PropTypes.object,
  });

  // init geolocation handling
  context.executeAction(initGeolocation).then(() => {
    ReactDOM.render(
      <ContextProvider translations={translations} context={context.getComponentContext()}>
        <MuiThemeProvider muiTheme={getMuiTheme(MUITheme, { userAgent: navigator.userAgent })}>
          <Router
            history={history}
            environment={Relay.Store}
            render={applyRouterMiddleware(useRelay)}
            onUpdate={track}
          >
            {app.getComponent()}
          </Router>
        </MuiThemeProvider>
      </ContextProvider>,
      document.getElementById('app'),
      () => {
        // Run only in production mode and when built in a docker container
        if (process.env.NODE_ENV === 'production' && BUILD_TIME !== 'unset') {
          OfflinePlugin.install();
        }
      },
    );
  });

  // Listen for Web App Install Banner events
  window.addEventListener('beforeinstallprompt', (e) => {
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
  const modules = [System.import('intl')];

  config.availableLanguages.forEach((language) => {
    modules.push(System.import(`intl/locale-data/jsonp/${language}`));
  });

  Promise.all(modules).then(callback);
}
