/* eslint-disable react/jsx-key */
import React from 'react';
import { graphql } from 'react-relay';
import Route from 'found/Route';
import Redirect from 'found/Redirect';
import queryMiddleware from 'farce/queryMiddleware';
import createRender from 'found/createRender';

import Error404 from './component/404';
import TopLevel from './component/TopLevel';

import { prepareWeekDays } from './util/dateParamUtils';

import {
  PREFIX_ITINERARY_SUMMARY,
  PREFIX_NEARYOU,
  PREFIX_BIKESTATIONS,
  PREFIX_BIKEPARK,
  PREFIX_CARPARK,
  createReturnPath,
  TAB_NEARBY,
  TAB_FAVOURITES,
  EMBEDDED_SEARCH_PATH,
  EMBEDDED_ROUTE_SEARCH_PATH,
} from './util/path';
import {
  getDefault,
  errorLoading,
  getComponentOrLoadingRenderer,
  getComponentOrNullRenderer,
} from './util/routerUtils';

import getStopRoutes from './stopRoutes';
import routeRoutes from './routeRoutes';

export const historyMiddlewares = [queryMiddleware];

export const render = createRender({});

export default config => {
  const indexPageComponents = {
    title: (
      <Route
        getComponent={() =>
          import(/* webpackChunkName: "itinerary" */ './component/Title').then(
            getDefault,
          )
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
        disableMapOnMobile
        getComponent={() =>
          import(
            /* webpackChunkName: "itinerary" */ './component/map/IndexPageMap.js'
          ).then(getDefault)
        }
      />
    ),
  };
  return (
    <Route Component={TopLevel}>
      {getStopRoutes()}
      {getStopRoutes(true) /* terminals */}
      {routeRoutes(config)}
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
              render={({ Component, props, error, match, retry }) => {
                if (Component && (props || error)) {
                  return <Component {...props} match={match} error={error} />;
                }
                return getComponentOrLoadingRenderer({
                  Component,
                  props,
                  error,
                  retry,
                });
              }}
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
      <Route path={`/${PREFIX_BIKEPARK}`}>
        <Route Component={Error404} />
        <Route path=":id">
          {{
            content: (
              <Route
                getComponent={() =>
                  import(
                    /* webpackChunkName: "bikepark" */ './component/BikeParkContent'
                  )
                    .then(getDefault)
                    .catch(errorLoading)
                }
                prepareVariables={prepareWeekDays}
                query={graphql`
                  query routes_BikePark_Query(
                    $id: String!
                    $dates: [String!]!
                  ) {
                    bikePark(id: $id) {
                      ...BikeParkContent_bikePark @arguments(dates: $dates)
                    }
                  }
                `}
                render={({ Component, props, error, match, retry }) => {
                  if (Component && (props || error)) {
                    return <Component {...props} match={match} error={error} />;
                  }
                  return getComponentOrLoadingRenderer({
                    Component,
                    props,
                    error,
                    retry,
                  });
                }}
              />
            ),
            map: (
              <Route
                path="(.*)?"
                getComponent={() =>
                  import(
                    /* webpackChunkName: "bikepark" */ './component/BikeParkMapContainer'
                  ).then(getDefault)
                }
                query={graphql`
                  query routes_BikeParkMap_Query($id: String!) {
                    bikePark(id: $id) {
                      ...BikeParkMapContainer_bikePark
                    }
                  }
                `}
                render={getComponentOrNullRenderer}
              />
            ),
          }}
        </Route>
      </Route>
      <Route path={`/${PREFIX_CARPARK}`}>
        <Route Component={Error404} />
        <Route path=":id">
          {{
            content: (
              <Route
                getComponent={() =>
                  import(
                    /* webpackChunkName: "carpark" */ './component/CarParkContent'
                  )
                    .then(getDefault)
                    .catch(errorLoading)
                }
                query={graphql`
                  query routes_CarPark_Query($id: String!, $dates: [String!]!) {
                    carPark(id: $id) {
                      ...CarParkContent_carPark @arguments(dates: $dates)
                    }
                  }
                `}
                prepareVariables={prepareWeekDays}
                render={({ Component, props, error, match, retry }) => {
                  if (Component && (props || error)) {
                    return <Component {...props} match={match} error={error} />;
                  }
                  return getComponentOrLoadingRenderer({
                    Component,
                    props,
                    error,
                    retry,
                  });
                }}
              />
            ),
            map: (
              <Route
                path="(.*)?"
                getComponent={() =>
                  import(
                    /* webpackChunkName: "carpark" */ './component/CarParkMapContainer'
                  ).then(getDefault)
                }
                query={graphql`
                  query routes_CarParkMap_Query($id: String!) {
                    carPark(id: $id) {
                      ...CarParkMapContainer_carPark
                    }
                  }
                `}
                render={getComponentOrNullRenderer}
              />
            ),
          }}
        </Route>
      </Route>
      <Route path={`/${PREFIX_NEARYOU}/:mode/:place/:origin?`}>
        {{
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "nearyou" */ './component/StopsNearYouPage'
                ).then(getDefault)
              }
              render={({ Component, props, error, match }) => {
                if (Component) {
                  return props ? (
                    <Component {...props} match={match} error={error} />
                  ) : (
                    <Component match={match} error={error} />
                  );
                }
                return undefined;
              }}
            />
          ),
          meta: (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/StopsNearYouPageMeta'
                ).then(getDefault)
              }
            />
          ),
        }}
      </Route>

      <Redirect
        from={`/${PREFIX_ITINERARY_SUMMARY}/:from`}
        to={`${config.indexPath === '' ? '' : `/${config.indexPath}`}/:from`}
      />
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
        path={`/${PREFIX_ITINERARY_SUMMARY}/POS/:to/:hash`}
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
      <Route
        path={`/${PREFIX_ITINERARY_SUMMARY}/:from/POS/:hash`}
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
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "itinerary" */ './component/SummaryPageContainer'
                ).then(getDefault)
              }
              render={({ Component, props, match }) => {
                if (Component) {
                  return <Component {...props} match={match} />;
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
              }}
            </Route>
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
        path="/tietoja-palvelusta"
        getComponent={() =>
          import(/* webpackChunkName: "about" */ './component/AboutPage').then(
            getDefault,
          )
        }
      />
      <Route
        path={config.URL.EMBEDDED_SEARCH_GENERATION}
        getComponent={() =>
          import(
            /* webpackChunkName: "embedded-search-generator" */ './component/EmbeddedSearchGenerator'
          ).then(getDefault)
        }
      />
      <Route
        path={EMBEDDED_SEARCH_PATH}
        getComponent={() =>
          import(
            /* webpackChunkName: "embedded-search" */ './component/EmbeddedSearchContainer'
          ).then(getDefault)
        }
        topBarOptions={{ hidden: true }}
      />
      <Route
        path={EMBEDDED_ROUTE_SEARCH_PATH}
        getComponent={() =>
          import(
            /* webpackChunkName: "embedded-route-search" */ './component/EmbeddedRouteSearchContainer'
          ).then(getDefault)
        }
        topBarOptions={{ hidden: true }}
      />
      <Route path="/js/*" Component={Error404} />
      <Route path="/css/*" Component={Error404} />
      <Route path="/assets/*" Component={Error404} />
      <Redirect
        from={`/:from/:to/${TAB_NEARBY}`}
        to={`${
          config.indexPath === '' ? '' : `/${config.indexPath}`
        }/:from/:to`}
      />
      <Redirect
        from={`/:from/:to/${TAB_FAVOURITES}`}
        to={`${
          config.indexPath === '' ? '' : `/${config.indexPath}`
        }/:from/:to`}
      />
      <Route
        path={`${
          config.indexPath === '' ? '' : `/${config.indexPath}`
        }/POS/:to?`}
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
      <Route path={config.indexPath === '' ? '/' : `/${config.indexPath}`}>
        {indexPageComponents}
      </Route>
      <Route
        path={`${config.indexPath === '' ? '' : `/${config.indexPath}`}/:from`}
      >
        {indexPageComponents}
      </Route>
      <Route
        path={`${
          config.indexPath === '' ? '' : `/${config.indexPath}`
        }/:from/-`}
      >
        {indexPageComponents}
      </Route>
      <Route
        path={`${config.indexPath === '' ? '' : `/${config.indexPath}`}/-/:to`}
      >
        {indexPageComponents}
      </Route>
      <Redirect
        from="/:from/:to"
        to={`/${PREFIX_ITINERARY_SUMMARY}/:from/:to`}
      />
      {config.indexPath !== '' && (
        <Redirect
          from={`/${config.indexPath}/:from/:to`}
          to={`/${PREFIX_ITINERARY_SUMMARY}/:from/:to`}
        />
      )}
      <Route path="/?mock">
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
        <Redirect from="/" to={`/${config.indexPath}`} />
      )}
      {/* For all the rest render 404 */}
      <Route path="*" Component={Error404} />
    </Route>
  );
};
