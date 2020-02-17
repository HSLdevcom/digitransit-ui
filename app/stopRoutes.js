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
      query routes_StopPageMap_Query($stopId: String!) {
        stop(id: $stopId) {
          ...StopPageMap_stop
        }
      }
    `,
    pageMeta: graphql`
      query routes_StopPageMeta_Query($stopId: String!) {
        stop(id: $stopId) {
          ...StopPageMeta_stop
        }
      }
    `,
    pageContent: graphql`
      query routes_StopPageTabContainer_Query($stopId: String!) {
        stop(id: $stopId) {
          ...StopPageTabContainer_stop
        }
      }
    `,
  },
  station: {
    pageHeader: graphql`
      query stopRoutes_StopPageHeaderContainer_Query($stationId: String!) {
        station(id: $stationId) {
          ...StopPageHeaderContainer_stop
        }
      }
    `,
    pageMap: graphql`
      query stopRoutes_StopPageMap_Query($stationId: String!) {
        station(id: $stationId) {
          ...StopPageMap_stop
        }
      }
    `,
    pageMeta: graphql`
      query stopRoutes_StopPageMeta_Query($stationId: String!) {
        station(id: $stationId) {
          ...StopPageMeta_stop
        }
      }
    `,
    pageContent: graphql`
      query routes_StopPageTabContainer_Query($stationId: String!) {
        station(id: $stationId) {
          ...StopPageTabContainer_stop
        }
      }
    `,
  },
};

export default function getStopRoutes(isTerminal = false) {
  const queryMap = isTerminal ? queries.station : queries.station.stop;
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
              query={queryMap.pageContent}
            >
              <Route
                path="kartta"
                fullscreenMap
                getComponent={() =>
                  import(/* webpackChunkName: "stop" */ './component/getStopPageContentPage')
                    .then(getDefault)
                    .catch(errorLoading)
                }
              />
              <Route
                path="aikataulu"
                getComponent={() =>
                  import(/* webpackChunkName: "stop" */ './component/TimetablePage')
                    .then(getDefault)
                    .catch(errorLoading)
                }
                prepareVariables={prepareServiceDay}
              >
                <Route path="kartta" fullscreenMap />
              </Route>
              <Route
                path="linjat"
                getComponent={() =>
                  import(/* webpackChunkName: "stop" */ './component/RoutesAndPlatformsForStops')
                    .then(getDefault)
                    .catch(errorLoading)
                }
              >
                <Route path="kartta" fullscreenMap />
              </Route>
              <Route
                path="hairiot"
                getComponent={() =>
                  import(/* webpackChunkName: "stop" */ './component/StopAlertsContainer')
                    .then(getDefault)
                    .catch(errorLoading)
                }
                prepareVariables={prepareDatesForStops}
              >
                <Route path="kartta" fullscreenMap />
              </Route>
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
