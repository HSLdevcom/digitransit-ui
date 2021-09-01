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
import {
  prepareRouteScheduleParamsWithFiveWeeks,
  prepareRouteScheduleParamsWithTenWeeks,
} from './util/routeScheduleParamUtils';

export default function routeRoutes(config) {
  const showTenWeeks = config.showTenWeeksOnRouteSchedule || false;
  return (
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
                import(
                  /* webpackChunkName: "route" */ './component/Title'
                ).then(getDefault)
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
              render={({ Component, props, error, match }) => {
                if (Component && (props || error)) {
                  return <Component {...props} match={match} error={error} />;
                }
                return null;
              }}
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
              render={({ Component, props, error, match }) => {
                if (Component && (props || error)) {
                  return <Component {...props} match={match} error={error} />;
                }
                return null;
              }}
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
              render={({ Component, props, error, match }) => {
                if (Component && (props || error)) {
                  return (
                    <Component
                      {...props}
                      match={match}
                      error={error}
                      trip={null}
                    />
                  );
                }
                return null;
              }}
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
                  $showTenWeeks: Boolean!
                  $routeId: String!
                  $patternId: String!
                  $serviceDate: String!
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
                  $wk6day1: String
                  $wk6day2: String
                  $wk6day3: String
                  $wk6day4: String
                  $wk6day5: String
                  $wk6day6: String
                  $wk6day7: String
                  $wk7day1: String
                  $wk7day2: String
                  $wk7day3: String
                  $wk7day4: String
                  $wk7day5: String
                  $wk7day6: String
                  $wk7day7: String
                  $wk8day1: String
                  $wk8day2: String
                  $wk8day3: String
                  $wk8day4: String
                  $wk8day5: String
                  $wk8day6: String
                  $wk8day7: String
                  $wk9day1: String
                  $wk9day2: String
                  $wk9day3: String
                  $wk9day4: String
                  $wk9day5: String
                  $wk9day6: String
                  $wk9day7: String
                  $wk10day1: String
                  $wk10day2: String
                  $wk10day3: String
                  $wk10day4: String
                  $wk10day5: String
                  $wk10day6: String
                  $wk10day7: String
                ) {
                  pattern(id: $patternId) {
                    ...RouteScheduleContainer_pattern
                  }
                  route(id: $routeId) {
                    ...RouteScheduleContainer_route
                    @arguments(date: $date, serviceDate: $serviceDate)
                  }
                  firstDepartures: pattern(id: $patternId) {
                    ...RouteScheduleContainer_firstDepartures
                    @arguments(
                      showTenWeeks: $showTenWeeks
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
                      wk6day1: $wk6day1
                      wk6day2: $wk6day2
                      wk6day3: $wk6day3
                      wk6day4: $wk6day4
                      wk6day5: $wk6day5
                      wk6day6: $wk6day6
                      wk6day7: $wk6day7
                      wk7day1: $wk7day1
                      wk7day2: $wk7day2
                      wk7day3: $wk7day3
                      wk7day4: $wk7day4
                      wk7day5: $wk7day5
                      wk7day6: $wk7day6
                      wk7day7: $wk7day7
                      wk8day1: $wk8day1
                      wk8day2: $wk8day2
                      wk8day3: $wk8day3
                      wk8day4: $wk8day4
                      wk8day5: $wk8day5
                      wk8day6: $wk8day6
                      wk8day7: $wk8day7
                      wk9day1: $wk9day1
                      wk9day2: $wk9day2
                      wk9day3: $wk9day3
                      wk9day4: $wk9day4
                      wk9day5: $wk9day5
                      wk9day6: $wk9day6
                      wk9day7: $wk9day7
                      wk10day1: $wk10day1
                      wk10day2: $wk10day2
                      wk10day3: $wk10day3
                      wk10day4: $wk10day4
                      wk10day5: $wk10day5
                      wk10day6: $wk10day6
                      wk10day7: $wk10day7
                    )
                  }
                }
              `}
              prepareVariables={
                showTenWeeks
                  ? prepareRouteScheduleParamsWithTenWeeks
                  : prepareRouteScheduleParamsWithFiveWeeks
              }
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
}
