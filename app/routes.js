/* eslint-disable react/jsx-key */
import React from 'react';
import { graphql } from 'react-relay';
import Route from 'found/Route';
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
} from './util/path';
import { preparePlanParams } from './util/planParamUtil';
import {
  errorLoading,
  getDefault,
  getComponentOrLoadingRenderer,
  getComponentOrNullRenderer,
} from './util/routerUtils';

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
              query={graphql`
                query routes_SummaryPage_Query(
                  $fromPlace: String!
                  $toPlace: String!
                  $intermediatePlaces: [InputCoordinates!]
                  $numItineraries: Int!
                  $modes: [TransportMode!]
                  $date: String!
                  $time: String!
                  $walkReluctance: Float
                  $walkBoardCost: Int
                  $minTransferTime: Int
                  $walkSpeed: Float
                  $maxWalkDistance: Float
                  $wheelchair: Boolean
                  $ticketTypes: [String]
                  $disableRemainingWeightHeuristic: Boolean
                  $arriveBy: Boolean
                  $transferPenalty: Int
                  $ignoreRealtimeUpdates: Boolean
                  $maxPreTransitTime: Int
                  $walkOnStreetReluctance: Float
                  $waitReluctance: Float
                  $bikeSpeed: Float
                  $bikeSwitchTime: Int
                  $bikeSwitchCost: Int
                  $bikeBoardCost: Int
                  $optimize: OptimizeType
                  $triangle: InputTriangle
                  $maxTransfers: Int
                  $waitAtBeginningFactor: Float
                  $heuristicStepsPerMainStep: Int
                  $compactLegsByReversedSearch: Boolean
                  $itineraryFiltering: Float
                  $modeWeight: InputModeWeight
                  $preferred: InputPreferred
                  $unpreferred: InputUnpreferred
                  $allowedBikeRentalNetworks: [String]
                  $locale: String
                  $shouldMakeWalkQuery: Boolean!
                  $shouldMakeBikeQuery: Boolean!
                  $showBikeAndPublicItineraries: Boolean!
                  $showBikeAndParkItineraries: Boolean!
                ) {
                  plan: plan(
                    fromPlace: $fromPlace
                    toPlace: $toPlace
                    intermediatePlaces: $intermediatePlaces
                    numItineraries: $numItineraries
                    transportModes: $modes
                    date: $date
                    time: $time
                    walkReluctance: $walkReluctance
                    walkBoardCost: $walkBoardCost
                    minTransferTime: $minTransferTime
                    walkSpeed: $walkSpeed
                    maxWalkDistance: $maxWalkDistance
                    wheelchair: $wheelchair
                    allowedTicketTypes: $ticketTypes
                    disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic
                    arriveBy: $arriveBy
                    transferPenalty: $transferPenalty
                    ignoreRealtimeUpdates: $ignoreRealtimeUpdates
                    maxPreTransitTime: $maxPreTransitTime
                    walkOnStreetReluctance: $walkOnStreetReluctance
                    waitReluctance: $waitReluctance
                    bikeSpeed: $bikeSpeed
                    bikeSwitchTime: $bikeSwitchTime
                    bikeSwitchCost: $bikeSwitchCost
                    optimize: $optimize
                    triangle: $triangle
                    maxTransfers: $maxTransfers
                    waitAtBeginningFactor: $waitAtBeginningFactor
                    heuristicStepsPerMainStep: $heuristicStepsPerMainStep
                    compactLegsByReversedSearch: $compactLegsByReversedSearch
                    itineraryFiltering: $itineraryFiltering
                    modeWeight: $modeWeight
                    preferred: $preferred
                    unpreferred: $unpreferred
                    allowedBikeRentalNetworks: $allowedBikeRentalNetworks
                    locale: $locale
                  ) {
                    ...SummaryPage_plan
                  }

                  walkPlan: plan(
                    fromPlace: $fromPlace
                    toPlace: $toPlace
                    intermediatePlaces: $intermediatePlaces
                    transportModes: [{ mode: WALK }]
                    date: $date
                    time: $time
                    walkSpeed: $walkSpeed
                    wheelchair: $wheelchair
                    arriveBy: $arriveBy
                    walkOnStreetReluctance: $walkOnStreetReluctance
                    heuristicStepsPerMainStep: $heuristicStepsPerMainStep
                    compactLegsByReversedSearch: $compactLegsByReversedSearch
                    locale: $locale
                  ) @include(if: $shouldMakeWalkQuery) {
                    ...SummaryPage_walkPlan
                  }

                  bikePlan: plan(
                    fromPlace: $fromPlace
                    toPlace: $toPlace
                    intermediatePlaces: $intermediatePlaces
                    transportModes: [{ mode: BICYCLE }]
                    date: $date
                    time: $time
                    walkSpeed: $walkSpeed
                    arriveBy: $arriveBy
                    walkOnStreetReluctance: $walkOnStreetReluctance
                    bikeSpeed: $bikeSpeed
                    optimize: $optimize
                    triangle: $triangle
                    heuristicStepsPerMainStep: $heuristicStepsPerMainStep
                    compactLegsByReversedSearch: $compactLegsByReversedSearch
                    locale: $locale
                  ) @include(if: $shouldMakeBikeQuery) {
                    ...SummaryPage_bikePlan
                  }

                  bikeAndPublicPlan: plan(
                    fromPlace: $fromPlace
                    toPlace: $toPlace
                    intermediatePlaces: $intermediatePlaces
                    numItineraries: 6
                    transportModes: [
                      { mode: BICYCLE }
                      { mode: SUBWAY }
                      { mode: RAIL }
                    ]
                    date: $date
                    time: $time
                    walkReluctance: $walkReluctance
                    walkBoardCost: $walkBoardCost
                    minTransferTime: $minTransferTime
                    walkSpeed: $walkSpeed
                    maxWalkDistance: $maxWalkDistance
                    allowedTicketTypes: $ticketTypes
                    disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic
                    arriveBy: $arriveBy
                    transferPenalty: $transferPenalty
                    ignoreRealtimeUpdates: $ignoreRealtimeUpdates
                    maxPreTransitTime: $maxPreTransitTime
                    walkOnStreetReluctance: $walkOnStreetReluctance
                    waitReluctance: $waitReluctance
                    bikeSpeed: $bikeSpeed
                    bikeBoardCost: $bikeBoardCost
                    optimize: $optimize
                    triangle: $triangle
                    maxTransfers: $maxTransfers
                    waitAtBeginningFactor: $waitAtBeginningFactor
                    heuristicStepsPerMainStep: $heuristicStepsPerMainStep
                    compactLegsByReversedSearch: $compactLegsByReversedSearch
                    itineraryFiltering: $itineraryFiltering
                    modeWeight: $modeWeight
                    preferred: $preferred
                    unpreferred: $unpreferred
                    locale: $locale
                  ) @include(if: $showBikeAndPublicItineraries) {
                    ...SummaryPage_bikeAndPublicPlan
                  }

                  bikeParkPlan: plan(
                    fromPlace: $fromPlace
                    toPlace: $toPlace
                    intermediatePlaces: $intermediatePlaces
                    numItineraries: 6
                    transportModes: [
                      { mode: BICYCLE, qualifier: PARK }
                      { mode: WALK }
                      { mode: BUS }
                      { mode: TRAM }
                      { mode: SUBWAY }
                      { mode: RAIL }
                    ]
                    date: $date
                    time: $time
                    walkReluctance: $walkReluctance
                    walkBoardCost: $walkBoardCost
                    minTransferTime: $minTransferTime
                    walkSpeed: $walkSpeed
                    maxWalkDistance: $maxWalkDistance
                    allowedTicketTypes: $ticketTypes
                    disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic
                    arriveBy: $arriveBy
                    transferPenalty: $transferPenalty
                    ignoreRealtimeUpdates: $ignoreRealtimeUpdates
                    maxPreTransitTime: $maxPreTransitTime
                    walkOnStreetReluctance: $walkOnStreetReluctance
                    waitReluctance: $waitReluctance
                    bikeSpeed: $bikeSpeed
                    bikeSwitchTime: $bikeSwitchTime
                    bikeSwitchCost: $bikeSwitchCost
                    bikeBoardCost: $bikeBoardCost
                    optimize: $optimize
                    triangle: $triangle
                    maxTransfers: $maxTransfers
                    waitAtBeginningFactor: $waitAtBeginningFactor
                    heuristicStepsPerMainStep: $heuristicStepsPerMainStep
                    compactLegsByReversedSearch: $compactLegsByReversedSearch
                    itineraryFiltering: $itineraryFiltering
                    modeWeight: $modeWeight
                    preferred: $preferred
                    unpreferred: $unpreferred
                    locale: $locale
                  ) @include(if: $showBikeAndParkItineraries) {
                    ...SummaryPage_bikeParkPlan
                  }

                  serviceTimeRange {
                    ...SummaryPage_serviceTimeRange
                  }
                }
              `}
              prepareVariables={preparePlanParams(config)}
              render={({ Component, props, error, match }) => {
                if (Component) {
                  return props ? (
                    <Component {...props} error={error} loading={false} />
                  ) : (
                    <Component
                      plan={{}}
                      walkPlan={{}}
                      bikePlan={{}}
                      bikeAndPublicPlan={{}}
                      bikeParkPlan={{}}
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
                      path="/tulosta"
                      getComponent={() =>
                        import(
                          /* webpackChunkName: "itinerary" */ './component/PrintableItinerary'
                        ).then(getDefault)
                      }
                      printPage
                      render={getComponentOrLoadingRenderer}
                    />
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
      {!config.URL.API_URL.includes('/api.') && (
        <Route
          path="/admin"
          getComponent={() =>
            import(/* webpackChunkName: "admin" */ './component/AdminPage')
              .then(getDefault)
              .catch(errorLoading)
          }
        />
      )}
      <Route
        path={LOCAL_STORAGE_EMITTER_PATH}
        Component={LocalStorageEmitter}
        topBarOptions={{ hidden: true }}
      />
      <Route path="/js/*" Component={Error404} />
      <Route path="/css/*" Component={Error404} />
      <Route path="/assets/*" Component={Error404} />
      <Route path="/:from?/:to?" topBarOptions={{ disableBackButton: true }}>
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
      {/* For all the rest render 404 */}
      <Route path="*" Component={Error404} />
    </Route>
  );
};
