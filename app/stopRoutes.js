import React from 'react';
import { Route, IndexRoute } from 'react-router';
import Relay from 'react-relay/classic';

import Error404 from './component/404';
import { PREFIX_STOPS, PREFIX_TERMINALS } from './util/path';
import {
  getDefault,
  loadRoute,
  errorLoading,
  ComponentLoading404Renderer,
  RelayRenderer,
} from './util/routerUtils';

const stopQueries = {
  stop: () => Relay.QL`
    query  {
      stop(id: $stopId)
    }
  `,
};

const terminalQueries = {
  stop: () => Relay.QL`
    query  {
      station(id: $terminalId)
    }
  `,
};

function getStopPageContentPage(location, cb) {
  return import(/* webpackChunkName: "stop" */ './component/StopPageContentContainer')
    .then(loadRoute(cb))
    .catch(errorLoading);
}

function getTimetablePage(location, cb) {
  return import(/* webpackChunkName: "stop" */ './component/TimetablePage')
    .then(loadRoute(cb))
    .catch(errorLoading);
}

function getRoutesAndPlatformsForStops(location, cb) {
  return import(/* webpackChunkName: "stop" */ './component/RoutesAndPlatformsForStops')
    .then(loadRoute(cb))
    .catch(errorLoading);
}

function getDisruptions(location, cb) {
  return import(/* webpackChunkName: "stop" */ './component/StopAlertsContainer')
    .then(loadRoute(cb))
    .catch(errorLoading);
}

export default function getStopRoutes(isTerminal = false) {
  return (
    <Route path={`/${isTerminal ? PREFIX_TERMINALS : PREFIX_STOPS}`}>
      <IndexRoute component={Error404} />
      {/* TODO: Should return list of all routes */}
      <Route
        path={isTerminal ? ':terminalId' : ':stopId'}
        getComponents={(location, cb) => {
          Promise.all([
            isTerminal
              ? import(/* webpackChunkName: "stop" */
                './component/TerminalTitle').then(getDefault)
              : import(/* webpackChunkName: "stop" */ './component/StopTitle').then(
                  getDefault,
                ),
            import(/* webpackChunkName: "stop" */ './component/StopPageHeaderContainer').then(
              getDefault,
            ),
            import(/* webpackChunkName: "stop" */ './component/StopPageTabContainer').then(
              getDefault,
            ),
            import(/* webpackChunkName: "stop" */ './component/StopPageMap').then(
              getDefault,
            ),
            import(/* webpackChunkName: "stop" */ './component/StopPageMeta').then(
              getDefault,
            ),
          ]).then(([title, header, content, map, meta]) =>
            cb(null, { title, header, content, map, meta }),
          );
        }}
        queries={{
          header: isTerminal ? terminalQueries : stopQueries,
          map: isTerminal ? terminalQueries : stopQueries,
          meta: isTerminal ? terminalQueries : stopQueries,
        }}
        render={ComponentLoading404Renderer}
      >
        <IndexRoute
          getComponent={getStopPageContentPage}
          queries={isTerminal ? terminalQueries : stopQueries}
          render={RelayRenderer}
        />
        <Route
          path="kartta"
          fullscreenMap
          getComponent={getStopPageContentPage}
          queries={isTerminal ? terminalQueries : stopQueries}
          render={RelayRenderer}
        />
        <Route
          path="aikataulu"
          getComponent={getTimetablePage}
          queries={isTerminal ? terminalQueries : stopQueries}
          render={RelayRenderer}
        >
          <Route path="kartta" fullscreenMap />
        </Route>
        <Route
          path="linjat"
          getComponent={getRoutesAndPlatformsForStops}
          queries={isTerminal ? terminalQueries : stopQueries}
          render={RelayRenderer}
        >
          <Route path="kartta" fullscreenMap />
        </Route>
        {!isTerminal && (
          <Route
            path="hairiot"
            getComponent={getDisruptions}
            queries={stopQueries}
            render={RelayRenderer}
          >
            <Route path="kartta" fullscreenMap />
          </Route>
        )}
      </Route>
    </Route>
  );
}
