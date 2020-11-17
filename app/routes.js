/* eslint-disable react/jsx-key */
import React from 'react';
import { graphql } from 'react-relay';
import Route from 'found/Route';
import Redirect from 'found/Redirect';
import queryMiddleware from 'farce/queryMiddleware';
import createRender from 'found/createRender';

import Error404 from './component/404';
import TopLevel from './component/TopLevel';
import LocalStorageEmitter from './component/LocalStorageEmitter';

import {
  PREFIX_ITINERARY_SUMMARY,
  PREFIX_NEARYOU,
  PREFIX_BIKESTATIONS,
  LOCAL_STORAGE_EMITTER_PATH,
  createReturnPath,
} from './util/path';
import { preparePlanParams } from './util/planParamUtil';
import {
  errorLoading,
  getDefault,
  getComponentOrLoadingRenderer,
  getComponentOrNullRenderer,
} from './util/routerUtils';

import { planQuery } from './util/queryUtils';

import getStopRoutes from './stopRoutes';
import routeRoutes from './routeRoutes';
import { validateServiceTimeRange } from './util/timeUtils';
import { isBrowser } from './util/browser';

export const historyMiddlewares = [queryMiddleware];

export const render = createRender({});

export default config => {
  return (
    <Route Component={TopLevel}>
      {getStopRoutes()}
      {getStopRoutes(true) /* terminals */}
      {routeRoutes}
      <Route path={`/${PREFIX_BIKESTATIONS}/:id`}>
        {{
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/BikeRentalStationContent'
                ).then(getDefault)
              }
              query={graphql`
                query routes_BikeRentalStation_Query($id: String!) {
                  bikeRentalStation(id: $id) {
                    ...BikeRentalStationContent_bikeRentalStation
                  }
                }
              `}
              render={getComponentOrNullRenderer}
            />
          ),
          map: (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/BikeRentalStationPageMapContainer'
                ).then(getDefault)
              }
              query={graphql`
                query routes_BikeRentalStationMap_Query($id: String!) {
                  bikeRentalStation(id: $id) {
                    ...BikeRentalStationPageMapContainer_bikeRentalStation
                  }
                }
              `}
              render={getComponentOrNullRenderer}
            />
          ),
        }}
      </Route>
      <Route path={`/${PREFIX_NEARYOU}/:mode/:place/:origin?`}>
        {{
          title: (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/BackButton'
                ).then(getDefault)
              }
            />
          ),
          content: isBrowser ? (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(
                  /* webpackChunkName: "nearyou" */ './component/StopsNearYouPage'
                ).then(getDefault)
              }
              render={({ Component, props, error, match }) => {
                if (Component) {
                  return props ? (
                    <Component
                      {...props}
                      match={match}
                      error={error}
                      loadingPosition={false}
                    />
                  ) : (
                    <Component match={match} loadingPosition error={error} />
                  );
                }
                return undefined;
              }}
            >
              {{
                content: (
                  <Route
                    getComponent={() =>
                      import(
                        /* webpackChunkName: "nearyou" */ './component/StopsNearYouContainer.js'
                      ).then(getDefault)
                    }
                    render={getComponentOrLoadingRenderer}
                  />
                ),
                map: (
                  <Route
                    // disableMapOnMobile
                    getComponent={() =>
                      import(
                        /* webpackChunkName: "nearyou" */ './component/map/StopsNearYouMap.js'
                      ).then(getDefault)
                    }
                    render={getComponentOrNullRenderer}
                  />
                ),
              }}
            </Route>
          ) : (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(
                  /* webpackChunkName: "nearyou" */ './component/Loading'
                ).then(getDefault)
              }
            />
          ),
        }}
      </Route>
      <Route
        path={`/${PREFIX_ITINERARY_SUMMARY}/POS/:to`}
        getComponent={() =>
          import(
            /* webpackChunkName: "itinerary" */ './component/Geolocator'
          ).then(getDefault)
        }
        render={({ Component, props }) => {
          if (Component) {
            return (
              <Component
                {...props}
                createReturnPath={createReturnPath}
                path={PREFIX_ITINERARY_SUMMARY}
              />
            );
          }
          return undefined;
        }}
      />
      <Route
        path={`/${PREFIX_ITINERARY_SUMMARY}/:from/POS`}
        getComponent={() =>
          import(
            /* webpackChunkName: "itinerary" */ './component/Geolocator'
          ).then(getDefault)
        }
        render={({ Component, props }) => {
          if (Component) {
            return (
              <Component
                {...props}
                createReturnPath={createReturnPath}
                path={PREFIX_ITINERARY_SUMMARY}
              />
            );
          }
          return undefined;
        }}
      />
      <Route path={`/${PREFIX_ITINERARY_SUMMARY}/:from/:to`}>
        {{
          title: (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/SummaryTitle'
                ).then(getDefault)
              }
            />
          ),
          content: isBrowser ? (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/SummaryPage'
                ).then(getDefault)
              }
              query={planQuery}
              prepareVariables={preparePlanParams(config)}
              render={({ Component, props, error, match }) => {
                if (Component) {
                  return props ? (
                    <Component {...props} error={error} loading={false} />
                  ) : (
                    <Component
                      viewer={{ plan: {} }}
                      serviceTimeRange={validateServiceTimeRange()}
                      match={match}
                      loading
                      error={error}
                    />
                  );
                }
                return undefined;
              }}
            >
              {{
                content: [
                  <Route path="" />,
                  <Route path="/:hash/:secondHash?">
                    <Route
                      getComponent={() =>
                        import(
                          /* webpackChunkName: "itinerary" */ './component/ItineraryTab'
                        ).then(getDefault)
                      }
                      render={getComponentOrLoadingRenderer}
                    />
                  </Route>,
                ],
                map: [
                  <Route path="" />,
                  <Route
                    path="/:hash/(.*)?"
                    getComponent={() =>
                      import(
                        /* webpackChunkName: "itinerary" */ './component/ItineraryPageMap'
                      ).then(getDefault)
                    }
                    render={getComponentOrNullRenderer}
                  />,
                ],
              }}
            </Route>
          ) : (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/Loading'
                ).then(getDefault)
              }
            />
          ),
          meta: (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/SummaryPageMeta'
                ).then(getDefault)
              }
            />
          ),
        }}
      </Route>
      <Route
        path="/styleguide"
        getComponent={() =>
          import(
            /* webpackChunkName: "styleguide" */ './component/StyleGuidePage'
          )
            .then(getDefault)
            .catch(errorLoading)
        }
      />
      <Route
        path="/styleguide/component/:componentName"
        topBarOptions={{ hidden: true }}
        getComponent={() =>
          import(
            /* webpackChunkName: "styleguide" */ './component/StyleGuidePage'
          )
            .then(getDefault)
            .catch(errorLoading)
        }
      />
      <Route
        path="/tietoja-palvelusta"
        getComponent={() =>
          import(/* webpackChunkName: "about" */ './component/AboutPage').then(
            getDefault,
          )
        }
      />
      <Route
        path={LOCAL_STORAGE_EMITTER_PATH}
        Component={LocalStorageEmitter}
        topBarOptions={{ hidden: true }}
      />
      <Route path="/js/*" Component={Error404} />
      <Route path="/css/*" Component={Error404} />
      <Route path="/assets/*" Component={Error404} />
      <Route
        path={`${
          config.indexPath === '' ? '' : `/${config.indexPath}`
        }/POS/:to?`}
        topBarOptions={{ disableBackButton: true }}
      >
        {{
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/Geolocator'
                ).then(getDefault)
              }
              render={({ Component, props }) => {
                if (Component) {
                  return (
                    <Component
                      {...props}
                      createReturnPath={createReturnPath}
                      path={config.indexPath}
                    />
                  );
                }
                return undefined;
              }}
            />
          ),
        }}
      </Route>
      <Route
        path={`${
          config.indexPath === '' ? '' : `/${config.indexPath}`
        }/:from/POS`}
        topBarOptions={{ disableBackButton: true }}
      >
        {{
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/Geolocator'
                ).then(getDefault)
              }
              render={({ Component, props }) => {
                if (Component) {
                  return (
                    <Component
                      {...props}
                      createReturnPath={createReturnPath}
                      path={config.indexPath}
                    />
                  );
                }
                return undefined;
              }}
            />
          ),
        }}
      </Route>
      <Route
        path={`${
          config.indexPath === '' ? '' : `/${config.indexPath}`
        }/:from?/:to?`}
        topBarOptions={{ disableBackButton: true }}
      >
        {{
          title: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/Title'
                ).then(getDefault)
              }
            />
          ),
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/IndexPage'
                ).then(getDefault)
              }
            />
          ),
          meta: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/IndexPageMeta'
                ).then(getDefault)
              }
            />
          ),
          map: (
            <Route
              // TODO: Must be decided how we will handle selecting from map!
              disableMapOnMobile
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/map/IndexPageMap.js'
                ).then(getDefault)
              }
            />
          ),
        }}
      </Route>
      <Route path="/?mock" topBarOptions={{ disableBackButton: true }}>
        {{
          title: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/Title'
                ).then(getDefault)
              }
            >
              <Route path=":hash" />
            </Route>
          ),
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/IndexPage'
                ).then(getDefault)
              }
            />
          ),
        }}
      </Route>
      {config.indexPath !== '' && (
        <Route path="/">
          <Redirect to={`/${config.indexPath}`} />
        </Route>
      )}
      {/* For all the rest render 404 */}
      <Route path="*" Component={Error404} />
    </Route>
  );
};
