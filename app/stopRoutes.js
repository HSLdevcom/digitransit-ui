import React from 'react';
import Route from 'found/lib/Route';
import { graphql } from 'react-relay';

import Error404 from './component/404';
import { PREFIX_STOPS, PREFIX_TERMINALS } from './util/path';
import { getDefault, errorLoading } from './util/routerUtils';
import { prepareDatesForStops, prepareServiceDay } from './util/dateParamUtils';

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
      query stopRoutes_StopPageMap_Query($stopId: String!) {
        stop(id: $stopId) {
          ...StopPageMap_stop
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
          ...TimetablePage_stop @arguments(date: $date)
        }
      }
    `,
    pageRoutes: graphql`
      query stopRoutes_StopPageRoutes_Query($stopId: String!) {
        stop(id: $stopId) {
          ...RoutesAndPlatformsForStops_stop
        }
      }
    `,
    pageAlerts: graphql`
      query stopRoutes_StopPageAlerts_Query(
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
      query stopRoutes_StopPageHeaderContainer_station_Query(
        $stationId: String!
      ) {
        station(id: $stationId) {
          ...StopPageHeaderContainer_stop
        }
      }
    `,
    pageMap: graphql`
      query stopRoutes_StopPageMap_station_Query($stationId: String!) {
        station(id: $stationId) {
          ...StopPageMap_stop
        }
      }
    `,
    pageMeta: graphql`
      query stopRoutes_StopPageMeta_station_Query($stationId: String!) {
        station(id: $stationId) {
          ...StopPageMeta_stop
        }
      }
    `,
    pageTab: graphql`
      query stopRoutes_StopPageTabContainer_station_Query($stationId: String!) {
        station(id: $stationId) {
          ...StopPageTabContainer_stop
        }
      }
    `,
    pageContent: graphql`
      query stopRoutes_StopPageContentContainer_station_Query(
        $stationId: String!
      ) {
        station(id: $stationId) {
          ...StopPageContentContainer_stop
        }
      }
    `,
    pageTimetable: graphql`
      query stopRoutes_StopPageTimetable_station_Query(
        $stationId: String!
        $date: String!
      ) {
        station(id: $stationId) {
          ...TimetablePage_stop @arguments(date: $date)
        }
      }
    `,
    pageRoutes: graphql`
      query stopRoutes_StopPageRoutes_station_Query($stationId: String!) {
        station(id: $stationId) {
          ...RoutesAndPlatformsForStops_stop
        }
      }
    `,
    pageAlerts: graphql`
      query stopRoutes_StopPageAlerts_station_Query(
        $stationId: String!
        $date: String!
        $startTime: Long!
      ) {
        station(id: $stationId) {
          ...StopAlertsContainer_stop
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
              getComponent={() =>
                import(/* webpackChunkName: "stop" */ './component/StopTitle').then(
                  getDefault,
                )
              }
            />
          ),
          header: (
            <Route
              getComponent={() =>
                import(/* webpackChunkName: "stop" */ './component/StopPageHeaderContainer').then(
                  getDefault,
                )
              }
              query={queryMap.pageHeader}
            />
          ),
          content: (
            <Route
              getComponent={() =>
                import(/* webpackChunkName: "stop" */ './component/StopPageTabContainer').then(
                  getDefault,
                )
              }
              query={queryMap.pageTab}
            >
              <Route
                path="/"
                getComponent={() =>
                  import(/* webpackChunkName: "stop" */ './component/StopPageContentContainer')
                    .then(getDefault)
                    .catch(errorLoading)
                }
                query={queryMap.pageContent}
              />
              <Route
                path="aikataulu"
                getComponent={() =>
                  import(/* webpackChunkName: "stop" */ './component/TimetablePage')
                    .then(getDefault)
                    .catch(errorLoading)
                }
                query={queryMap.pageTimetable}
                prepareVariables={prepareServiceDay}
              />
              <Route
                path="linjat"
                getComponent={() =>
                  import(/* webpackChunkName: "stop" */ './component/RoutesAndPlatformsForStops')
                    .then(getDefault)
                    .catch(errorLoading)
                }
                query={queryMap.pageRoutes}
              />
              <Route
                path="hairiot"
                getComponent={() =>
                  import(/* webpackChunkName: "stop" */ './component/StopAlertsContainer')
                    .then(getDefault)
                    .catch(errorLoading)
                }
                query={queryMap.pageAlerts}
                prepareVariables={prepareDatesForStops}
              />
            </Route>
          ),
          map: (
            <Route
              getComponent={() =>
                import(/* webpackChunkName: "stop" */ './component/StopPageMap').then(
                  getDefault,
                )
              }
              query={queryMap.pageMap}
            />
          ),
          meta: (
            <Route
              getComponent={() =>
                import(/* webpackChunkName: "stop" */ './component/StopPageMeta').then(
                  getDefault,
                )
              }
              query={queryMap.pageMeta}
            />
          ),
        }}
      </Route>
    </Route>
  );
}
