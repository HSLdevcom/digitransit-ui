/* eslint-disable react/jsx-key */
import React from 'react';
import { graphql } from 'react-relay';
import Route from 'found/lib/Route';
import queryMiddleware from 'farce/lib/queryMiddleware';
import createRender from 'found/lib/createRender';

import Error404 from './component/404';
import TopLevel from './component/TopLevel';

import { PREFIX_ITINERARY_SUMMARY, PREFIX_NEARYOU } from './util/path';
import { preparePlanParams, prepareStopsParams } from './util/planParamUtil';
import {
  errorLoading,
  getDefault,
  getComponentOrLoadingRenderer,
  getComponentOrNullRenderer,
} from './util/routerUtils';

import getStopRoutes from './stopRoutes';
import routeRoutes from './routeRoutes';

import SelectFromMapHeader from './component/SelectFromMapHeader';
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
      <Route path={`/${PREFIX_NEARYOU}/:mode/:place`}>
        {{
          title: (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(/* webpackChunkName: "itinerary" */ './component/BackButton').then(
                  getDefault,
                )
              }
            />
          ),
          content: isBrowser ? (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(/* webpackChunkName: "nearyou" */ './component/StopsNearYouPage').then(
                  getDefault,
                )
              }
              query={graphql`
                query routes_StopsNearYou_Query(
                  $lat: Float!
                  $lon: Float!
                  $filterByPlaceTypes: [FilterPlaceType]
                  $filterByModes: [Mode]
                  $maxResults: Int!
                  $maxDistance: Int!
                  $omitNonPickups: Boolean
                ) {
                  stopPatterns: nearest(
                    lat: $lat
                    lon: $lon
                    filterByPlaceTypes: $filterByPlaceTypes
                    filterByModes: $filterByModes
                    maxResults: $maxResults
                    maxDistance: $maxDistance
                  ) {
                    ...StopsNearYouPage_stopPatterns
                      @arguments(omitNonPickups: $omitNonPickups)
                  }
                }
              `}
              prepareVariables={prepareStopsParams(config)}
              render={getComponentOrNullRenderer}
            />
          ) : (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(/* webpackChunkName: "itinerary" */ './component/Loading').then(
                  getDefault,
                )
              }
            />
          ),
          map: (
            <Route
              // disableMapOnMobile
              getComponent={() =>
                import(/* webpackChunkName: "itinerary" */ './component/map/StopsNearYouMap.js').then(
                  getDefault,
                )
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
                import(/* webpackChunkName: "itinerary" */ './component/SummaryTitle').then(
                  getDefault,
                )
              }
            />
          ),
          content: isBrowser ? (
            <Route
              getComponent={() =>
                import(/* webpackChunkName: "itinerary" */ './component/SummaryPage').then(
                  getDefault,
                )
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
                  $carParkCarLegWeight: Float
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
                  $shortEnoughForWalking: Boolean!
                  $shortEnoughForBiking: Boolean!
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
                    bikeBoardCost: $bikeBoardCost
                    optimize: $optimize
                    triangle: $triangle
                    carParkCarLegWeight: $carParkCarLegWeight
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
                    numItineraries: $numItineraries
                    transportModes: [{ mode: WALK }]
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
                    bikeBoardCost: $bikeBoardCost
                    optimize: $optimize
                    triangle: $triangle
                    carParkCarLegWeight: $carParkCarLegWeight
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
                  ) @include(if: $shortEnoughForWalking) {
                    ...SummaryPage_walkPlan
                  }

                  bikePlan: plan(
                    fromPlace: $fromPlace
                    toPlace: $toPlace
                    intermediatePlaces: $intermediatePlaces
                    numItineraries: $numItineraries
                    transportModes: [{ mode: BICYCLE }]
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
                    bikeBoardCost: $bikeBoardCost
                    optimize: $optimize
                    triangle: $triangle
                    carParkCarLegWeight: $carParkCarLegWeight
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
                  ) @include(if: $shortEnoughForBiking) {
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
                    bikeBoardCost: $bikeBoardCost
                    optimize: $optimize
                    triangle: $triangle
                    carParkCarLegWeight: $carParkCarLegWeight
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
                    bikeBoardCost: $bikeBoardCost
                    optimize: $optimize
                    triangle: $triangle
                    carParkCarLegWeight: $carParkCarLegWeight
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
                        import(/* webpackChunkName: "itinerary" */ './component/PrintableItinerary').then(
                          getDefault,
                        )
                      }
                      printPage
                      render={getComponentOrLoadingRenderer}
                    />
                    <Route
                      getComponent={() =>
                        import(/* webpackChunkName: "itinerary" */ './component/ItineraryTab').then(
                          getDefault,
                        )
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
                      import(/* webpackChunkName: "itinerary" */ './component/ItineraryPageMap').then(
                        getDefault,
                      )
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
                import(/* webpackChunkName: "itinerary" */ './component/Loading').then(
                  getDefault,
                )
              }
            />
          ),
          meta: (
            <Route
              path="(.*)?"
              getComponent={() =>
                import(/* webpackChunkName: "itinerary" */ './component/SummaryPageMeta').then(
                  getDefault,
                )
              }
            />
          ),
        }}
      </Route>
      <Route
        path="/styleguide"
        getComponent={() =>
          import(/* webpackChunkName: "styleguide" */ './component/StyleGuidePage')
            .then(getDefault)
            .catch(errorLoading)
        }
      />
      <Route
        path="/styleguide/component/:componentName"
        topBarOptions={{ hidden: true }}
        getComponent={() =>
          import(/* webpackChunkName: "styleguide" */ './component/StyleGuidePage')
            .then(getDefault)
            .catch(errorLoading)
        }
      />
      <Route
        path="/suosikki/uusi"
        getComponent={() =>
          import(/* webpackChunkName: "add-favourite" */ './component/AddFavouritePage')
            .then(getDefault)
            .catch(errorLoading)
        }
      />
      <Route
        path="/suosikki/muokkaa/sijainti/:id"
        getComponent={() =>
          import(/* webpackChunkName: "add-favourite" */ './component/AddFavouritePage')
            .then(getDefault)
            .catch(errorLoading)
        }
      />
      <Route
        path="/suosikki/muokkaa/pysakki/:id"
        getComponent={() =>
          import(/* webpackChunkName: "add-favourite" */ './component/AddFavouritePage')
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
      <Route path="/js/*" Component={Error404} />
      <Route path="/css/*" Component={Error404} />
      <Route path="/assets/*" Component={Error404} />
      <Route path="/:from?/SelectFromMap" topBarOptions={{ hidden: true }}>
        {{
          selectFromMapHeader: (
            <Route
              getComponent={() =>
                import(/* webpackChunkName: "itinerary" */ './component/SelectFromMapHeader.js').then(
                  getDefault,
                )
              }
              render={() => <SelectFromMapHeader isDestination />}
            />
          ),
          map: (
            <Route
              getComponent={() =>
                import(/* webpackChunkName: "itinerary" */ './component/map/SelectFromMapPageMap.js').then(
                  getDefault,
                )
              }
            />
          ),
        }}
      </Route>
      <Route path="/SelectFromMap/:to?" topBarOptions={{ hidden: true }}>
        {{
          selectFromMapHeader: (
            <Route
              getComponent={() =>
                import(/* webpackChunkName: "itinerary" */ './component/SelectFromMapHeader.js').then(
                  getDefault,
                )
              }
              render={() => <SelectFromMapHeader isDestination={false} />}
            />
          ),
          map: (
            <Route
              // disableMapOnMobile
              getComponent={() =>
                import(/* webpackChunkName: "itinerary" */ './component/map/SelectFromMapPageMap.js').then(
                  getDefault,
                )
              }
            />
          ),
        }}
      </Route>
      <Route path="/:from?/:to?" topBarOptions={{ disableBackButton: true }}>
        {{
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
                import(/* webpackChunkName: "itinerary" */ './component/IndexPage').then(
                  getDefault,
                )
              }
            />
          ),
          meta: (
            <Route
              getComponent={() =>
                import(/* webpackChunkName: "itinerary" */ './component/IndexPageMeta').then(
                  getDefault,
                )
              }
            />
          ),
          map: (
            <Route
              // TODO: Must be decided how we will handle selecting from map!
              disableMapOnMobile
              getComponent={() =>
                import(/* webpackChunkName: "itinerary" */ './component/map/IndexPageMap.js').then(
                  getDefault,
                )
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
                import(/* webpackChunkName: "itinerary" */ './component/Title').then(
                  getDefault,
                )
              }
            >
              <Route path=":hash" />
            </Route>
          ),
          content: (
            <Route
              getComponent={() =>
                import(/* webpackChunkName: "itinerary" */ './component/IndexPage').then(
                  getDefault,
                )
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
