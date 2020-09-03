import React from 'react';
import Route from 'found/lib/Route';
import { graphql } from 'react-relay';

import Error404 from './component/404';
import {
  PREFIX_STOPS,
  PREFIX_TERMINALS,
  PREFIX_ROUTES,
  PREFIX_DISRUPTION,
  PREFIX_TIMETABLE,
} from './util/path';
import {
  getDefault,
  errorLoading,
  getComponentOrNullRenderer,
  getComponentOrLoadingRenderer,
} from './util/routerUtils';
import { prepareDatesForStops, prepareServiceDay } from './util/dateParamUtils';
import { isBrowser } from './util/browser';

const queries = {
  stop: {
    pageHeader: graphql`
      query stopRoutes_StopPageHeaderContainer_Query($stopId: String!) {
        stop(id: $stopId) {
          ...StopPageHeaderContainer_stop
        }
      }
    `,
    pageMap: graphql`
      query stopRoutes_StopPageMapContainer_Query($stopId: String!) {
        stop(id: $stopId) {
          ...StopPageMapContainer_stop
        }
      }
    `,
    pageMeta: graphql`
      query stopRoutes_StopPageMeta_Query($stopId: String!) {
        stop(id: $stopId) {
          ...StopPageMeta_stop
        }
      }
    `,
    pageTab: graphql`
      query stopRoutes_StopPageTab_Query($stopId: String!) {
        stop(id: $stopId) {
          ...StopPageTabContainer_stop
        }
      }
    `,
    pageContent: graphql`
      query stopRoutes_StopPageContent_Query($stopId: String!) {
        stop(id: $stopId) {
          ...StopPageContentContainer_stop
        }
      }
    `,
    pageTimetable: graphql`
      query stopRoutes_StopPageTimetable_Query(
        $stopId: String!
        $date: String!
      ) {
        stop(id: $stopId) {
          ...StopTimetablePage_stop @arguments(date: $date)
        }
      }
    `,
    pageRoutes: graphql`
      query stopRoutes_StopPageRoutes_Query($stopId: String!) {
        stop(id: $stopId) {
          ...StopRoutesAndPlatformsContainer_stop
        }
      }
    `,
    pageAlerts: graphql`
      query stopRoutes_StopAlertsContainer_Query(
        $stopId: String!
        $date: String!
        $startTime: Long!
      ) {
        stop(id: $stopId) {
          ...StopAlertsContainer_stop
            @arguments(date: $date, startTime: $startTime)
        }
      }
    `,
  },
  station: {
    pageHeader: graphql`
      query stopRoutes_TerminalPageHeaderContainer_Query($terminalId: String!) {
        station(id: $terminalId) {
          ...TerminalPageHeaderContainer_station
        }
      }
    `,
    pageMap: graphql`
      query stopRoutes_TerminalPageMapContainer_Query($terminalId: String!) {
        station(id: $terminalId) {
          ...TerminalPageMapContainer_station
        }
      }
    `,
    pageMeta: graphql`
      query stopRoutes_TerminalPageMeta_Query($terminalId: String!) {
        station(id: $terminalId) {
          ...TerminalPageMeta_station
        }
      }
    `,
    pageTab: graphql`
      query stopRoutes_TerminalPageTabContainer_Query($terminalId: String!) {
        station(id: $terminalId) {
          ...TerminalPageTabContainer_station
        }
      }
    `,
    pageContent: graphql`
      query stopRoutes_TerminalPageContent_Query($terminalId: String!) {
        station(id: $terminalId) {
          ...TerminalPageContentContainer_station
        }
      }
    `,
    pageTimetable: graphql`
      query stopRoutes_TerminalPageTimetable_Query(
        $terminalId: String!
        $date: String!
      ) {
        station(id: $terminalId) {
          ...TerminalTimetablePage_station @arguments(date: $date)
        }
      }
    `,
    pageRoutes: graphql`
      query stopRoutes_TerminalPageRoutes_Query($terminalId: String!) {
        station(id: $terminalId) {
          ...TerminalRoutesAndPlatformsContainer_station
        }
      }
    `,
    pageAlerts: graphql`
      query stopRoutes_TerminalAlertsContainer_Query(
        $terminalId: String!
        $date: String!
        $startTime: Long!
      ) {
        station(id: $terminalId) {
          ...TerminalAlertsContainer_station
            @arguments(date: $date, startTime: $startTime)
        }
      }
    `,
  },
};

export default function getStopRoutes(isTerminal = false) {
  const queryMap = isTerminal ? queries.station : queries.stop;
  return (
    <Route path={`/${isTerminal ? PREFIX_TERMINALS : PREFIX_STOPS}`}>
      <Route Component={Error404} />
      {/* TODO: Should return list of all routes */}
      <Route path={isTerminal ? ':terminalId' : ':stopId'}>
        {{
          title: (
            <Route
              path="(.*)?"
              getComponent={() => {
                return isTerminal
                  ? import(/* webpackChunkName: "stop" */ './component/TerminalTitle').then(
                      getDefault,
                    )
                  : import(/* webpackChunkName: "stop" */ './component/StopTitle').then(
                      getDefault,
                    );
              }}
              render={getComponentOrNullRenderer}
            />
          ),
          header: (
            <Route
              path="(.*)?"
              getComponent={() => {
                return isTerminal
                  ? import(/* webpackChunkName: "stop" */ './component/TerminalPageHeaderContainer').then(
                      getDefault,
                    )
                  : import(/* webpackChunkName: "stop" */ './component/StopPageHeaderContainer').then(
                      getDefault,
                    );
              }}
              query={queryMap.pageHeader}
              render={getComponentOrNullRenderer}
            />
          ),
          content: (
            <Route
              getComponent={() => {
                return isTerminal
                  ? import(/* webpackChunkName: "stop" */ './component/TerminalPageTabContainer').then(
                      getDefault,
                    )
                  : import(/* webpackChunkName: "stop" */ './component/StopPageTabContainer').then(
                      getDefault,
                    );
              }}
              query={queryMap.pageTab}
              render={getComponentOrNullRenderer}
            >
              <Route
                getComponent={() => {
                  return isTerminal
                    ? import(/* webpackChunkName: "stop" */ './component/TerminalPageContentContainer')
                        .then(getDefault)
                        .catch(errorLoading)
                    : import(/* webpackChunkName: "stop" */ './component/StopPageContentContainer')
                        .then(getDefault)
                        .catch(errorLoading);
                }}
                query={queryMap.pageContent}
                render={getComponentOrLoadingRenderer}
              />
              <Route
                path={PREFIX_TIMETABLE}
                getComponent={() => {
                  return isTerminal
                    ? import(/* webpackChunkName: "stop" */ './component/TerminalTimetablePage')
                        .then(getDefault)
                        .catch(errorLoading)
                    : import(/* webpackChunkName: "stop" */ './component/StopTimetablePage')
                        .then(getDefault)
                        .catch(errorLoading);
                }}
                query={queryMap.pageTimetable}
                prepareVariables={prepareServiceDay}
                render={getComponentOrLoadingRenderer}
              />
              <Route
                path={PREFIX_ROUTES}
                getComponent={() => {
                  return isTerminal
                    ? import(/* webpackChunkName: "stop" */ './component/TerminalRoutesAndPlatformsContainer')
                        .then(getDefault)
                        .catch(errorLoading)
                    : import(/* webpackChunkName: "stop" */ './component/StopRoutesAndPlatformsContainer')
                        .then(getDefault)
                        .catch(errorLoading);
                }}
                query={queryMap.pageRoutes}
                render={getComponentOrLoadingRenderer}
              />
              <Route
                path={PREFIX_DISRUPTION}
                getComponent={() => {
                  return isTerminal
                    ? import(/* webpackChunkName: "stop" */ './component/TerminalAlertsContainer')
                        .then(getDefault)
                        .catch(errorLoading)
                    : import(/* webpackChunkName: "stop" */ './component/StopAlertsContainer')
                        .then(getDefault)
                        .catch(errorLoading);
                }}
                query={queryMap.pageAlerts}
                prepareVariables={prepareDatesForStops}
                render={getComponentOrLoadingRenderer}
              />
            </Route>
          ),
          map: (
            <Route
              path="(.*)?"
              getComponent={() => {
                // eslint-disable-next-line no-nested-ternary
                return isBrowser
                  ? isTerminal
                    ? import(/* webpackChunkName: "stop" */ './component/TerminalPageMapContainer').then(
                        getDefault,
                      )
                    : import(/* webpackChunkName: "stop" */ './component/StopPageMapContainer').then(
                        getDefault,
                      )
                  : import(/* webpackChunkName: "stop" */ './component/Loading').then(
                      getDefault,
                    );
              }}
              query={queryMap.pageMap}
              render={getComponentOrNullRenderer}
            />
          ),
          meta: (
            <Route
              path="(.*)?"
              getComponent={() => {
                return isTerminal
                  ? import(/* webpackChunkName: "stop" */ './component/TerminalPageMeta').then(
                      getDefault,
                    )
                  : import(/* webpackChunkName: "stop" */ './component/StopPageMeta').then(
                      getDefault,
                    );
              }}
              query={queryMap.pageMeta}
              render={getComponentOrNullRenderer}
            />
          ),
        }}
      </Route>
    </Route>
  );
}
