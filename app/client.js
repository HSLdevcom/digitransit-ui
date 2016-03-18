import './util/raven';

import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import { RelayRouter } from 'react-router-relay';
import { createHistory } from 'history';
import { useRouterHistory } from 'react-router';
import FluxibleComponent from 'fluxible-addons-react/FluxibleComponent';
import tapEventPlugin from 'react-tap-event-plugin';

import config from './config';
import StoreListeningIntlProvider from './util/store-listening-intl-provider';
import app from './app';
import translations from './translations';
import { startLocationWatch } from './action/position-actions';
import { openFeedbackModal } from './action/feedback-action';
import PiwikProvider from './component/util/piwik-provider';
import Feedback from './util/feedback';

const piwik = require('./util/piwik').getTracker(config.PIWIK_ADDRESS, config.PIWIK_ID);
const dehydratedState = window.state;

if (process.env.NODE_ENV === 'development') {
  require(`../sass/themes/${ config.CONFIG }/main.scss`);
}

import debug from 'debug';
window._debug = debug; // Allow _debug.enable('*') in browser console

Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer(config.URL.OTP + 'index/graphql')
);

if (typeof window.Raven !== 'undefined' && window.Raven !== null) {
  window.Raven.setUserContext({piwik: piwik.getVisitorId()});
}

// Material-ui uses touch tap events
tapEventPlugin();

const history = useRouterHistory(createHistory)({
  basename: config.APP_PATH,
});

function track() {
  // track "getting back to home"
  const newHref = this.props.history.createHref(this.state.location);

  if (this.href !== undefined && newHref === '/' && this.href !== newHref) {
    if (Feedback.shouldDisplayPopup(context.getComponentContext().getStore('TimeStore').getCurrentTime().valueOf())) {
      context.executeAction(openFeedbackModal);
    }
  }

  this.href = newHref;
  piwik.setCustomUrl(this.props.history.createHref(this.state.location));
  piwik.trackPageView();
}

// Run application
app.rehydrate(dehydratedState, (err, context) => {
  if (err) {
    throw err;
  }

  window.context = context;

  ReactDOM.render(
    <FluxibleComponent context={context.getComponentContext()}>
      <PiwikProvider piwik={piwik}>
        <StoreListeningIntlProvider translations={translations}>
          <RelayRouter history={history} children={app.getComponent()} onUpdate={track} />
        </StoreListeningIntlProvider>
      </PiwikProvider>
    </FluxibleComponent>
    , document.getElementById('app')
  );

  if (window !== null) {
    // start positioning
    piwik.enableLinkTracking();
    context.executeAction(startLocationWatch);
  }
});
