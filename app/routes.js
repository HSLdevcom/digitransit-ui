import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { Route } from 'react-router';

import IndexPage from './component/IndexPage';
import IndexPageMeta from './component/IndexPageMeta';
import Error404 from './component/404';
import TopLevel from './component/TopLevel';
import Title from './component/Title';

import scrollTop from './util/scroll';
import { PREFIX_ITINERARY_SUMMARY } from './util/path';
import { preparePlanParams } from './util/planParamUtil';
import { validateServiceTimeRange } from './util/timeUtils';
import { errorLoading, getDefault, loadRoute } from './util/routerUtils';

import getStopRoutes from './stopRoutes';
import routeRoutes from './routeRoutes';

const planQueries = {
  plan: (Component, variables) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('plan', variables)}
      }
    }`,
  serviceTimeRange: () => Relay.QL`query { serviceTimeRange }`,
};

export default config => {
  const SummaryPageWrapper = ({ props, routerProps, element }) =>
    props
      ? React.cloneElement(element, props)
      : React.cloneElement(element, {
          ...routerProps,
          ...preparePlanParams(config)(routerProps.params, routerProps),
          plan: { plan: {} },
          serviceTimeRange: validateServiceTimeRange(), // use default range
          loading: true,
        });

  SummaryPageWrapper.propTypes = {
    props: PropTypes.object.isRequired,
    routerProps: PropTypes.object.isRequired,
  };
  return (
    <Route component={TopLevel}>
      <Route
        path="/styleguide"
        getComponent={(location, cb) => {
          import(/* webpackChunkName: "styleguide" */ './component/StyleGuidePage')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }}
      />
      <Route
        path="/styleguide/component/:componentName"
        topBarOptions={{ hidden: true }}
        getComponent={(location, cb) => {
          import(/* webpackChunkName: "styleguide" */ './component/StyleGuidePage')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }}
      />
      <Route
        path="/suosikki/uusi"
        getComponent={(location, cb) => {
          import(/* webpackChunkName: "add-favourite" */ './component/AddFavouritePage')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }}
      />
      {getStopRoutes()}
      {getStopRoutes(true) /* terminals */}
      {routeRoutes}
      <Route
        path={`/${PREFIX_ITINERARY_SUMMARY}/:from/:to`}
        getComponents={(location, cb) => {
          Promise.all([
            import(/* webpackChunkName: "itinerary" */ './component/SummaryTitle').then(
              getDefault,
            ),
            import(/* webpackChunkName: "itinerary" */ './component/SummaryPage').then(
              getDefault,
            ),
            import(/* webpackChunkName: "itinerary" */ './component/SummaryPageMeta').then(
              getDefault,
            ),
          ]).then(([title, content, meta]) =>
            cb(null, { title, content, meta }),
          );
        }}
        queries={{ content: planQueries }}
        prepareParams={preparePlanParams(config)}
        render={{ content: SummaryPageWrapper }}
      >
        <Route
          path=":hash/tulosta"
          getComponents={(location, cb) => {
            import(/* webpackChunkName: "itinerary" */ './component/PrintableItinerary')
              .then(content => cb(null, { content: content.default }))
              .catch(errorLoading);
          }}
          printPage
        >
          <Route path="kartta" fullscreenMap />
        </Route>
        <Route
          path=":hash"
          getComponents={(location, cb) => {
            Promise.all([
              import(/* webpackChunkName: "itinerary" */ './component/ItineraryTab').then(
                getDefault,
              ),
              import(/* webpackChunkName: "itinerary" */ './component/ItineraryPageMap').then(
                getDefault,
              ),
            ]).then(([content, map]) => cb(null, { content, map }));
          }}
        >
          <Route path="kartta" fullscreenMap />
        </Route>
      </Route>
      <Route
        path="/suosikki/muokkaa/sijainti/:id"
        getComponent={(location, cb) => {
          import(/* webpackChunkName: "add-favourite" */ './component/AddFavouritePage')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }}
      />
      <Route
        path="/suosikki/muokkaa/pysakki/:id"
        getComponent={(location, cb) => {
          import(/* webpackChunkName: "add-favourite" */ './component/AddFavouritePage')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }}
      />
      <Route
        path="/tietoja-palvelusta"
        getComponents={(location, cb) => {
          Promise.all([
            Promise.resolve(Title),
            import(/* webpackChunkName: "about" */ './component/AboutPage').then(
              getDefault,
            ),
          ]).then(([title, content]) => cb(null, { title, content }));
        }}
      />
      {!config.URL.API_URL.includes('/api.') && (
        <Route
          path="/admin"
          getComponent={(location, cb) => {
            import(/* webpackChunkName: "admin" */ './component/AdminPage')
              .then(loadRoute(cb))
              .catch(errorLoading);
          }}
        />
      )}
      <Route path="/js/*" component={Error404} />
      <Route path="/css/*" component={Error404} />
      <Route path="/assets/*" component={Error404} />
      <Route
        path="/(:from)(/:to)(/:tab)"
        topBarOptions={{ disableBackButton: true }}
        components={{
          title: Title,
          content: IndexPage,
          meta: IndexPageMeta,
        }}
        onEnter={scrollTop}
      />
      <Route
        path="/?mock"
        topBarOptions={{ disableBackButton: true }}
        components={{
          title: Title,
          content: IndexPage,
        }}
      />
      {/* For all the rest render 404 */}
      <Route path="*" component={Error404} />
    </Route>
  );
};
