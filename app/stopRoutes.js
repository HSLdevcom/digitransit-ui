import React from 'react';
import { Route, IndexRoute } from 'react-router';
import Relay from 'react-relay/classic';

import Error404 from './component/404';
import { PREFIX_STOPS, PREFIX_TERMINALS } from './util/path';
import { getDefault, ComponentLoading404Renderer } from './util/routerUtils';

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
            isTerminal
              ? import(/* webpackChunkName: "stop" */ './component/TerminalPage').then(
                  getDefault,
                )
              : import(/* webpackChunkName: "stop" */ './component/StopPage').then(
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
        <Route path="kartta" fullscreenMap />
      </Route>
    </Route>
  );
}
