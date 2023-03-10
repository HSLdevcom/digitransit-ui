/* eslint-disable react/jsx-key */
import React from 'react';
import { graphql } from 'react-relay';
import Route from 'found/Route';
import Redirect from 'found/Redirect';
import queryMiddleware from 'farce/queryMiddleware';
import createRender from 'found/createRender';

import Error404 from './component/404';
import TopLevel from './component/TopLevel';

import {
  PREFIX_ITINERARY_SUMMARY,
  PREFIX_NEARYOU,
  PREFIX_BIKESTATIONS,
  PREFIX_ROADWORKS,
  PREFIX_CHARGING_STATIONS,
  PREFIX_BIKEPARK,
  PREFIX_CARPARK,
  PREFIX_ROAD_WEATHER,
  PREFIX_DATAHUB_POI,
  PREFIX_GEOJSON,
  createReturnPath,
  TAB_NEARBY,
  TAB_FAVOURITES,
  EMBEDDED_SEARCH_PATH,
} from './util/path';
import {
  getDefault,
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
        disableMapOnMobile={false}
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
      <Route path={`/${PREFIX_GEOJSON}`}>
        {{
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "parking lots" */ './component/map/sidebar/GeojsonContent'
                ).then(getDefault)
              }
            />
          ),
          map: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "map" */ './component/map/SidebarMap.js'
                ).then(getDefault)
              }
            />
          ),
        }}
      </Route>
      <Route path={`/${PREFIX_ROAD_WEATHER}`}>
        {{
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "road weather" */ './component/map/sidebar/WeatherStationContent'
                ).then(getDefault)
              }
            />
          ),
          map: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "map" */ './component/map/SidebarMap.js'
                ).then(getDefault)
              }
            />
          ),
        }}
      </Route>
      <Route path={`/${PREFIX_DATAHUB_POI}`}>
        {{
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "road weather" */ './component/map/sidebar/bbnavi/DatahubTileContent'
                ).then(getDefault)
              }
            />
          ),
          map: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "map" */ './component/map/SidebarMap.js'
                ).then(getDefault)
              }
            />
          ),
        }}
      </Route>
      <Route path={`/${PREFIX_CHARGING_STATIONS}`}>
        {{
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "charging stations" */ './component/map/sidebar/ChargingStationContent'
                ).then(getDefault)
              }
            />
          ),
          map: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "map" */ './component/map/SidebarMap.js'
                ).then(getDefault)
              }
            />
          ),
        }}
      </Route>
      <Route path={`/${PREFIX_ROADWORKS}`}>
        {{
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "roadworks" */ './component/map/sidebar/RoadworksContent'
                ).then(getDefault)
              }
            />
          ),
          map: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "map" */ './component/map/SidebarMap.js'
                ).then(getDefault)
              }
            />
          ),
        }}
      </Route>
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
      <Route path={`/${PREFIX_BIKEPARK}/:id`}>
        {{
          content: (
            <Route
              getComponent={() =>
                import(
                  /* webpackChunkName: "bike park" */ './component/map/sidebar/BikeParkContent'
                ).then(getDefault)
              }
            />
          ),
          map: (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(
                  /* webpackChunkName: "bikepark" */ './component/VehicleParkingMapContainer'
                ).then(getDefault)
              }
              query={graphql`
                query routes_BikeParkMap_Query($id: String!) {
                  vehicleParking(id: $id) {
                    ...VehicleParkingMapContainer_vehicleParking
                  }
                }
              `}
              render={getComponentOrNullRenderer}
            />
          ),
        }}
      </Route>
      <Route path={`/${PREFIX_CARPARK}`}>
        <Route Component={Error404} />
        <Route path=":id">
          {{
            content: (
              <Route
                getComponent={() =>
                  import(
                    /* webpackChunkName: "parking lots" */ './component/map/sidebar/DynamicParkingLotsContent'
                  ).then(getDefault)
                }
                query={graphql`
                  query routes_DynamicParkingLot_Query($id: String!) {
                    vehicleParking(id: $id) {
                      ...DynamicParkingLotsContent_vehicleParking
                    }
                  }
                `}
              />
            ),
            map: (
              <Route
                path="(.*)?"
                getComponent={() =>
                  import(
                    /* webpackChunkName: "carpark" */ './component/VehicleParkingMapContainer'
                  ).then(getDefault)
                }
                query={graphql`
                  query routes_CarParkMap_Query($id: String!) {
                    vehicleParking(id: $id) {
                      ...VehicleParkingMapContainer_vehicleParking
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
        path="/dieser-dienst"
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
