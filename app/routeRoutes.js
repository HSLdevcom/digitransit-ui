/* eslint-disable react/jsx-key */

import React from 'react';
import Route from 'found/Route';
import { graphql } from 'react-relay';

import Error404 from './component/404';
import {
  PREFIX_DISRUPTION,
  PREFIX_ROUTES,
  PREFIX_STOPS,
  PREFIX_TIMETABLE,
} from './util/path';
import {
  getDefault,
  getComponentOrNullRenderer,
  getComponentOrLoadingRenderer,
} from './util/routerUtils';
import { prepareServiceDay } from './util/dateParamUtils';
import prepareRouteScheduleParams from './util/routeScheduleParamUtils';

export default (
  <Route path={`/${PREFIX_ROUTES}`}>
    <Route Component={Error404} />
    <Route
      path=":routeId/:type?"
      getComponent={() =>
        import(
          /* webpackChunkName: "route" */ './component/PatternRedirector'
        ).then(getDefault)
      }
      query={graphql`
        query routeRoutes_PatternRedirector_Query(
          $routeId: String!
          $date: String!
        ) {
          route(id: $routeId) {
            ...PatternRedirector_route @arguments(date: $date)
          }
        }
      `}
      prepareVariables={prepareServiceDay}
      render={getComponentOrLoadingRenderer}
    />
    <Route path=":routeId">
      {{
        title: (
          <Route
            path="(.*)?"
            getComponent={() =>
              import(/* webpackChunkName: "route" */ './component/Title').then(
                getDefault,
              )
            }
            query={graphql`
              query routeRoutes_RouteTitle_Query($routeId: String!) {
                route(id: $routeId) {
                  ...RouteTitle_route
                }
              }
            `}
            render={getComponentOrNullRenderer}
          />
        ),
        meta: (
          <Route
            path="(.*)?"
            getComponent={() =>
              import(
                /* webpackChunkName: "route" */ './component/RoutePageMeta'
              ).then(getDefault)
            }
            query={graphql`
              query routeRoutes_RoutePageMeta_Query($routeId: String!) {
                route(id: $routeId) {
                  ...RoutePageMeta_route
                }
              }
            `}
            render={getComponentOrNullRenderer}
          />
        ),
        header: (
          <Route
            path="(.*)?"
            getComponent={() =>
              import(
                /* webpackChunkName: "route" */ './component/RoutePage'
              ).then(getDefault)
            }
            query={graphql`
              query routeRoutes_RoutePage_Query(
                $routeId: String!
                $date: String!
              ) {
                route(id: $routeId) {
                  ...RoutePage_route @arguments(date: $date)
                }
              }
            `}
            prepareVariables={prepareServiceDay}
            render={getComponentOrNullRenderer}
          />
        ),
        map: [
          <Route
            path={`${PREFIX_STOPS}/:patternId/:tripId`}
            getComponent={() =>
              import(
                /* webpackChunkName: "route" */ './component/map/RoutePageMap'
              ).then(getDefault)
            }
            query={graphql`
              query routeRoutes_RoutePageMap_withTrip_Query(
                $patternId: String!
                $tripId: String!
              ) {
                pattern(id: $patternId) {
                  ...RoutePageMap_pattern
                }
                trip(id: $tripId) {
                  ...RoutePageMap_trip
                }
              }
            `}
            render={getComponentOrNullRenderer}
          />,
          <Route
            path=":type/:patternId/(.*)?"
            getComponent={() =>
              import(
                /* webpackChunkName: "route" */ './component/map/RoutePageMap'
              ).then(getDefault)
            }
            query={graphql`
              query routeRoutes_RoutePageMap_Query($patternId: String!) {
                pattern(id: $patternId) {
                  ...RoutePageMap_pattern
                }
              }
            `}
            render={({ Component, props }) =>
              Component && props ? <Component {...props} trip={null} /> : null
            }
          />,
          <Route path="(.?)*" />,
        ],
        content: [
          <Route path={PREFIX_STOPS}>
            <Route
              path=":patternId"
              getComponent={() =>
                import(
                  /* webpackChunkName: "route" */ './component/PatternStopsContainer'
                ).then(getDefault)
              }
              query={graphql`
                query routeRoutes_PatternStopsContainer_Query(
                  $patternId: String!
                  $routeId: String!
                  $date: String!
                ) {
                  pattern(id: $patternId) {
                    ...PatternStopsContainer_pattern
                    @arguments(patternId: $patternId)
                  }
                  route(id: $routeId) {
                    ...PatternStopsContainer_route @arguments(date: $date)
                  }
                }
              `}
              prepareVariables={prepareServiceDay}
              render={getComponentOrLoadingRenderer}
            />
            <Route
              path=":patternId/:tripId"
              getComponent={() =>
                import(
                  /* webpackChunkName: "route" */ './component/TripStopsContainer'
                ).then(getDefault)
              }
              query={graphql`
                query routeRoutes_TripStopsContainer_Query(
                  $patternId: String!
                  $tripId: String!
                  $routeId: String!
                  $date: String!
                ) {
                  pattern(id: $patternId) {
                    ...TripStopsContainer_pattern
                  }
                  trip(id: $tripId) {
                    ...TripStopsContainer_trip
                  }
                  route(id: $routeId) {
                    ...TripStopsContainer_route @arguments(date: $date)
                  }
                }
              `}
              prepareVariables={prepareServiceDay}
              render={getComponentOrLoadingRenderer}
            />
          </Route>,
          <Route
            path={`${PREFIX_TIMETABLE}/:patternId`}
            getComponent={() =>
              import(
                /* webpackChunkName: "route" */ './component/RouteScheduleContainer'
              ).then(getDefault)
            }
            query={graphql`
              query routeRoutes_RouteScheduleContainer_Query(
                $patternId: String!
                $date: String!
                $wk1day1: String!
                $wk1day2: String!
                $wk1day3: String!
                $wk1day4: String!
                $wk1day5: String!
                $wk1day6: String!
                $wk1day7: String!
                $wk2day1: String!
                $wk2day2: String!
                $wk2day3: String!
                $wk2day4: String!
                $wk2day5: String!
                $wk2day6: String!
                $wk2day7: String!
                $wk3day1: String!
                $wk3day2: String!
                $wk3day3: String!
                $wk3day4: String!
                $wk3day5: String!
                $wk3day6: String!
                $wk3day7: String!
                $wk4day1: String!
                $wk4day2: String!
                $wk4day3: String!
                $wk4day4: String!
                $wk4day5: String!
                $wk4day6: String!
                $wk4day7: String!
                $wk5day1: String!
                $wk5day2: String!
                $wk5day3: String!
                $wk5day4: String!
                $wk5day5: String!
                $wk5day6: String!
                $wk5day7: String!
              ) {
                pattern(id: $patternId) {
                  ...RouteScheduleContainer_pattern
                  @arguments(serviceDay: $date)
                }
                firstDepartures: pattern(id: $patternId) {
                  ...RouteScheduleContainer_firstDepartures
                  @arguments(
                    wk1day1: $wk1day1
                    wk1day2: $wk1day2
                    wk1day3: $wk1day3
                    wk1day4: $wk1day4
                    wk1day5: $wk1day5
                    wk1day6: $wk1day6
                    wk1day7: $wk1day7
                    wk2day1: $wk2day1
                    wk2day2: $wk2day2
                    wk2day3: $wk2day3
                    wk2day4: $wk2day4
                    wk2day5: $wk2day5
                    wk2day6: $wk2day6
                    wk2day7: $wk2day7
                    wk3day1: $wk3day1
                    wk3day2: $wk3day2
                    wk3day3: $wk3day3
                    wk3day4: $wk3day4
                    wk3day5: $wk3day5
                    wk3day6: $wk3day6
                    wk3day7: $wk3day7
                    wk4day1: $wk4day1
                    wk4day2: $wk4day2
                    wk4day3: $wk4day3
                    wk4day4: $wk4day4
                    wk4day5: $wk4day5
                    wk4day6: $wk4day6
                    wk4day7: $wk4day7
                    wk5day1: $wk5day1
                    wk5day2: $wk5day2
                    wk5day3: $wk5day3
                    wk5day4: $wk5day4
                    wk5day5: $wk5day5
                    wk5day6: $wk5day6
                    wk5day7: $wk5day7
                  )
                }
              }
            `}
            prepareVariables={prepareRouteScheduleParams}
            render={getComponentOrLoadingRenderer}
          />,
          <Route
            path={`${PREFIX_DISRUPTION}/:patternId`}
            getComponent={() =>
              import(
                /* webpackChunkName: "route" */ './component/RouteAlertsContainer'
              ).then(getDefault)
            }
            query={graphql`
              query routeRoutes_RouteAlertsContainer_Query(
                $routeId: String!
                $date: String!
              ) {
                route(id: $routeId) {
                  ...RouteAlertsContainer_route @arguments(date: $date)
                }
              }
            `}
            prepareVariables={prepareServiceDay}
            render={getComponentOrLoadingRenderer}
          />,
        ],
      }}
    </Route>
  </Route>
);
