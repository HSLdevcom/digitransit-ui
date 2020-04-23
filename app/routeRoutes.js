import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import Relay from 'react-relay/classic';

import Error404 from './component/404';
import {
  PREFIX_DISRUPTION,
  PREFIX_ROUTES,
  PREFIX_STOPS,
  PREFIX_TIMETABLE,
} from './util/path';
import { getDefault, ComponentLoading404Renderer } from './util/routerUtils';

const RouteQueries = {
  route: () => Relay.QL`
    query {
      route(id: $routeId)
    }
  `,
};

const PatternQueries = {
  pattern: () => Relay.QL`
    query {
      pattern(id: $patternId)
    }
  `,
};

const TripQueries = {
  trip: () => Relay.QL`
    query {
      trip(id: $tripId)
    }
  `,
  pattern: () => Relay.QL`
    query {
      pattern(id: $patternId)
    }
  `,
};

const componentPatternQueries = {
  title: RouteQueries,
  header: RouteQueries,
  map: PatternQueries,
  content: PatternQueries,
  meta: RouteQueries,
};

const componentTripQueries = {
  title: RouteQueries,
  header: RouteQueries,
  map: TripQueries,
  content: TripQueries,
  meta: RouteQueries,
};

const componentRouteQueries = {
  title: RouteQueries,
  header: RouteQueries,
  map: PatternQueries,
  content: RouteQueries,
  meta: RouteQueries,
};

function getComponents(getContentComponent) {
  return function getPageComponents(location, cb) {
    return Promise.all([
      import(/* webpackChunkName: "route" */ './component/RouteTitle').then(
        getDefault,
      ),
      import(/* webpackChunkName: "route" */ './component/RoutePage').then(
        getDefault,
      ),
      import(/* webpackChunkName: "route" */ './component/RouteMapContainer').then(
        getDefault,
      ),
      getContentComponent(),
      import(/* webpackChunkName: "route" */ './component/RoutePageMeta').then(
        getDefault,
      ),
    ]).then(([title, header, map, content, meta]) =>
      cb(null, { title, header, map, content, meta }),
    );
  };
}

export default (
  <Route path={`/${PREFIX_ROUTES}`}>
    <IndexRoute component={Error404} />
    {/* TODO: Should return list of all routes */}
    <Route path=":routeId">
      <IndexRedirect to={PREFIX_STOPS} />
      <Route path={PREFIX_STOPS}>
        <IndexRedirect to=":routeId%3A0%3A01" />
        {/* Redirect to first pattern of route */}
        <Route path=":patternId">
          <IndexRoute
            getComponents={getComponents(() =>
              import(/* webpackChunkName: "route" */ './component/PatternStopsContainer').then(
                getDefault,
              ),
            )}
            queries={componentPatternQueries}
            render={ComponentLoading404Renderer}
          />
          <Route
            path="kartta"
            getComponents={getComponents(() =>
              import(/* webpackChunkName: "route" */ './component/PatternStopsContainer').then(
                getDefault,
              ),
            )}
            queries={componentPatternQueries}
            render={ComponentLoading404Renderer}
            fullscreenMap
          />
          <Route
            path=":tripId"
            getComponents={getComponents(() =>
              import(/* webpackChunkName: "route" */ './component/TripStopsContainer').then(
                getDefault,
              ),
            )}
            queries={componentTripQueries}
            render={ComponentLoading404Renderer}
          >
            <Route path="kartta" fullscreenMap />
          </Route>
        </Route>
      </Route>
      <Route path={PREFIX_TIMETABLE}>
        <IndexRedirect to=":routeId%3A0%3A01" />
        <Route
          path=":patternId"
          disableMapOnMobile
          getComponents={getComponents(() =>
            import(/* webpackChunkName: "route" */ './component/RouteScheduleContainer').then(
              getDefault,
            ),
          )}
          queries={componentPatternQueries}
          render={ComponentLoading404Renderer}
        />
      </Route>
      <Route path={PREFIX_DISRUPTION}>
        <IndexRedirect to=":routeId%3A0%3A01" />
        <Route
          path=":patternId"
          disableMapOnMobile
          getComponents={getComponents(() =>
            import(/* webpackChunkName: "route" */ './component/RouteAlertsContainer').then(
              getDefault,
            ),
          )}
          queries={componentRouteQueries}
          render={ComponentLoading404Renderer}
        />
      </Route>
    </Route>
  </Route>
);
