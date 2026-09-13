import React from 'react';
import { Route, RedirectException } from 'found';
import { graphql } from 'react-relay';

import { DateTime } from 'luxon';
import Error404 from './component/404.jsx';
import Loading from './component/LoadingPage.jsx';
import {
  PREFIX_STOPS,
  PREFIX_TERMINALS,
  PREFIX_DISRUPTION,
  PREFIX_TIMETABLE,
} from './util/path.js';
import {
  getDefault,
  errorLoading,
  getComponentOrNullRenderer,
  getComponentOrLoadingRenderer,
} from './util/routerUtils.jsx';
import { prepareDatesForStops } from './util/dateParamUtils.js';
import { DATE_FORMAT } from './constants.js';

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
    pageAlerts: graphql`
      query stopRoutes_StopAlertsContainer_Query(
        $stopId: String!
        $startTime: Long!
      ) {
        stop(id: $stopId) {
          ...StopAlertsContainer_stop @arguments(startTime: $startTime)
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
    pageAlerts: graphql`
      query stopRoutes_TerminalAlertsContainer_Query(
        $terminalId: String!
        $startTime: Long!
      ) {
        station(id: $terminalId) {
          ...TerminalAlertsContainer_station @arguments(startTime: $startTime)
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
                  ? import(
                      /* webpackChunkName: "stop" */ './component/stop/TerminalTitle.jsx'
                    ).then(getDefault)
                  : import(
                      /* webpackChunkName: "stop" */ './component/stop/StopTitle.jsx'
                    ).then(getDefault);
              }}
              render={getComponentOrNullRenderer}
            />
          ),
          header: (
            <Route
              path="(.*)?"
              getComponent={() => {
                return isTerminal
                  ? import(
                      /* webpackChunkName: "stop" */ './component/stop/TerminalPageHeaderContainer.jsx'
                    ).then(getDefault)
                  : import(
                      /* webpackChunkName: "stop" */ './component/stop/StopPageHeaderContainer.js'
                    ).then(getDefault);
              }}
              query={queryMap.pageHeader}
              render={getComponentOrNullRenderer}
            />
          ),
          content: (
            <Route
              getComponent={() => {
                return isTerminal
                  ? import(
                      /* webpackChunkName: "stop" */ './component/stop/TerminalPageTabContainer.jsx'
                    ).then(getDefault)
                  : import(
                      /* webpackChunkName: "stop" */ './component/stop/StopPageTabContainer.jsx'
                    ).then(getDefault);
              }}
              query={queryMap.pageTab}
              render={getComponentOrNullRenderer}
            >
              <Route
                getComponent={() => {
                  return isTerminal
                    ? import(
                        /* webpackChunkName: "stop" */ './component/stop/TerminalPageContentContainer.jsx'
                      )
                        .then(getDefault)
                        .catch(errorLoading)
                    : import(
                        /* webpackChunkName: "stop" */ './component/stop/StopPageContentContainer.jsx'
                      )
                        .then(getDefault)
                        .catch(errorLoading);
                }}
                query={queryMap.pageContent}
                render={({ Component, props, error }) => {
                  if (Component && (props || error)) {
                    if (!error && !(props.stop || props.station)) {
                      throw new RedirectException(
                        `/${isTerminal ? PREFIX_TERMINALS : PREFIX_STOPS}`,
                      );
                    } else {
                      return <Component {...props} error={error} />;
                    }
                  }
                  return <Loading />;
                }}
              />
              <Route
                path={PREFIX_TIMETABLE}
                getComponent={() => {
                  return isTerminal
                    ? import(
                        /* webpackChunkName: "stop" */ './component/stop/TerminalTimetablePage.jsx'
                      )
                        .then(getDefault)
                        .catch(errorLoading)
                    : import(
                        /* webpackChunkName: "stop" */ './component/stop/StopTimetablePage.jsx'
                      )
                        .then(getDefault)
                        .catch(errorLoading);
                }}
                query={queryMap.pageTimetable}
                prepareVariables={(params, { location }) => {
                  const date = location?.query?.date;
                  return {
                    ...params,
                    date: date || DateTime.now().toFormat(DATE_FORMAT),
                  };
                }}
                render={getComponentOrLoadingRenderer}
              />
              <Route
                path={PREFIX_DISRUPTION}
                getComponent={() => {
                  return isTerminal
                    ? import(
                        /* webpackChunkName: "stop" */ './component/stop/TerminalAlertsContainer.jsx'
                      )
                        .then(getDefault)
                        .catch(errorLoading)
                    : import(
                        /* webpackChunkName: "stop" */ './component/stop/StopAlertsContainer.jsx'
                      )
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
                return isTerminal
                  ? import(
                      /* webpackChunkName: "stop" */ './component/stop/TerminalPageMapContainer.jsx'
                    ).then(getDefault)
                  : import(
                      /* webpackChunkName: "stop" */ './component/stop/StopPageMapContainer.jsx'
                    ).then(getDefault);
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
                  ? import(
                      /* webpackChunkName: "stop" */ './component/stop/TerminalPageMeta.jsx'
                    ).then(getDefault)
                  : import(
                      /* webpackChunkName: "stop" */ './component/stop/StopPageMeta.jsx'
                    ).then(getDefault);
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
