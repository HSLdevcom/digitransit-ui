import React from 'react';
import { Route, IndexRoute } from 'react-router';
import Relay from 'react-relay/classic';

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
  const queries = isTerminal ? terminalQueries : stopQueries;
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
          header: queries,
          content: queries,
          map: queries,
          meta: queries,
        }}
        render={ComponentLoading404Renderer}
      >
        <IndexRoute
          getComponent={getStopPageContentPage}
          queries={queries}
          render={RelayRenderer}
        />
        <Route
          path="kartta"
          fullscreenMap
          getComponent={getStopPageContentPage}
          queries={queries}
          render={RelayRenderer}
        />
        <Route
          path={PREFIX_TIMETABLE}
          getComponent={getTimetablePage}
          queries={queries}
          render={RelayRenderer}
        >
          <Route path="kartta" fullscreenMap />
        </Route>
        <Route
          path={PREFIX_ROUTES}
          getComponent={getRoutesAndPlatformsForStops}
          queries={queries}
          render={RelayRenderer}
        >
          <Route path="kartta" fullscreenMap />
        </Route>
        <Route
          path={PREFIX_DISRUPTION}
          getComponent={getDisruptions}
          queries={queries}
          render={RelayRenderer}
        >
          <Route path="kartta" fullscreenMap />
        </Route>
      </Route>
    </Route>
  );
}
