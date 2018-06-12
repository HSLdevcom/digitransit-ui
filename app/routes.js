import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import IndexPage from './component/IndexPage';
import Error404 from './component/404';
import NetworkError from './component/NetworkError';
import Loading from './component/LoadingPage';
import TopLevel from './component/TopLevel';
import Title from './component/Title';
import scrollTop from './util/scroll';
import {
  PREFIX_ROUTES,
  PREFIX_STOPS,
  PREFIX_ITINERARY_SUMMARY,
} from './util/path';
import { preparePlanParams } from './util/planParamUtil';
import { validateServiceTimeRange } from './util/timeUtils';

const ComponentLoading404Renderer = {
  /* eslint-disable react/prop-types */
  header: ({ error, props, element, retry }) => {
    if (error) {
      if (
        error.message === 'Failed to fetch' || // Chrome
        error.message === 'Network request failed' // Safari && FF && IE
      ) {
        return <NetworkError retry={retry} />;
      }
      return <Error404 />;
    } else if (props) {
      return React.cloneElement(element, props);
    }
    return <Loading />;
  },
  map: ({ error, props, element }) => {
    if (error) {
      return null;
    } else if (props) {
      return React.cloneElement(element, props);
    }
    return undefined;
  },
  title: ({ props, element }) =>
    React.cloneElement(element, { route: null, ...props }),
  content: ({ props, element }) =>
    props ? React.cloneElement(element, props) : <div className="flex-grow" />,
  /* eslint-enable react/prop-types */
};

const StopQueries = {
  stop: () => Relay.QL`
    query  {
      stop(id: $stopId)
    }
  `,
};

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

const terminalQueries = {
  stop: () => Relay.QL`
    query  {
      station(id: $terminalId)
    }
  `,
};

const planQueries = {
  plan: (Component, variables) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('plan', variables)}
      }
    }`,
  serviceTimeRange: () => Relay.QL`query { serviceTimeRange }`,
};

function errorLoading(err) {
  console.error('Dynamic page loading failed', err);
}

function loadRoute(cb) {
  return module => cb(null, module.default);
}

function getDefault(module) {
  return module.default;
}

export default config => {
  const SummaryPageWrapper = ({ props, routerProps, element }) =>
    props
      ? React.cloneElement(element, props)
      : React.cloneElement(element, {
          ...routerProps,
          ...preparePlanParams(config)(routerProps.params, routerProps),
          plan: { plan: {} },
          serviceTimeRange: validateServiceTimeRange(), // use default range
          loading: true,
        });

  SummaryPageWrapper.propTypes = {
    props: PropTypes.object.isRequired,
    routerProps: PropTypes.object.isRequired,
  };
  return (
    <Route component={TopLevel}>
      <Route
        path="/styleguide"
        getComponent={(location, cb) => {
          import(/* webpackChunkName: "styleguide" */ './component/StyleGuidePage')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }}
      />
      <Route
        path="/styleguide/component/:componentName"
        topBarOptions={{ hidden: true }}
        getComponent={(location, cb) => {
          import(/* webpackChunkName: "styleguide" */ './component/StyleGuidePage')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }}
      />
      <Route
        path="/suosikki/uusi"
        getComponent={(location, cb) => {
          import(/* webpackChunkName: "add-favourite" */ './component/AddFavouritePage')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }}
      />
      <Route path={`/${PREFIX_STOPS}`}>
        <IndexRoute component={Error404} />{' '}
        {/* TODO: Should return list of all routes */}
        <Route
          path=":stopId"
          getComponents={(location, cb) => {
            Promise.all([
              import(/* webpackChunkName: "stop" */ './component/StopTitle').then(
                getDefault,
              ),
              import(/* webpackChunkName: "stop" */ './component/StopPageHeaderContainer').then(
                getDefault,
              ),
              import(/* webpackChunkName: "stop" */ './component/StopPage').then(
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
            header: StopQueries,
            map: StopQueries,
            meta: StopQueries,
          }}
          render={ComponentLoading404Renderer}
        >
          <Route path="kartta" fullscreenMap />
        </Route>
      </Route>
      <Route path="/terminaalit">
        <IndexRoute component={Error404} />{' '}
        {/* TODO: Should return list of all terminals */}
        <Route
          path=":terminalId"
          getComponents={(location, cb) => {
            Promise.all([
              import(/* webpackChunkName: "stop" */ './component/TerminalTitle').then(
                getDefault,
              ),
              import(/* webpackChunkName: "stop" */ './component/StopPageHeaderContainer').then(
                getDefault,
              ),
              import(/* webpackChunkName: "stop" */ './component/TerminalPage').then(
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
            header: terminalQueries,
            map: terminalQueries,
            meta: terminalQueries,
          }}
          render={ComponentLoading404Renderer}
        >
          <Route path="kartta" fullscreenMap />
        </Route>
      </Route>
      <Route path={`/${PREFIX_ROUTES}`}>
        <IndexRoute component={Error404} />{' '}
        {/* TODO: Should return list of all routes */}
        <Route path=":routeId">
          <IndexRedirect to="pysakit" />
          <Route path="pysakit">
            <IndexRedirect to=":routeId%3A0%3A01" />{' '}
            {/* Redirect to first pattern of route */}
            <Route path=":patternId">
              <IndexRoute
                getComponents={(location, cb) => {
                  Promise.all([
                    import(/* webpackChunkName: "route" */ './component/RouteTitle').then(
                      getDefault,
                    ),
                    import(/* webpackChunkName: "route" */ './component/RoutePage').then(
                      getDefault,
                    ),
                    import(/* webpackChunkName: "route" */ './component/RouteMapContainer').then(
                      getDefault,
                    ),
                    import(/* webpackChunkName: "route" */ './component/PatternStopsContainer').then(
                      getDefault,
                    ),
                    import(/* webpackChunkName: "route" */ './component/RoutePageMeta').then(
                      getDefault,
                    ),
                  ]).then(([title, header, map, content, meta]) =>
                    cb(null, { title, header, map, content, meta }),
                  );
                }}
                queries={{
                  title: RouteQueries,
                  header: RouteQueries,
                  map: PatternQueries,
                  content: PatternQueries,
                  meta: RouteQueries,
                }}
                render={ComponentLoading404Renderer}
              />
              <Route
                path="kartta"
                getComponents={(location, cb) => {
                  Promise.all([
                    import(/* webpackChunkName: "route" */ './component/RouteTitle').then(
                      getDefault,
                    ),
                    import(/* webpackChunkName: "route" */ './component/RoutePage').then(
                      getDefault,
                    ),
                    import(/* webpackChunkName: "route" */ './component/RouteMapContainer').then(
                      getDefault,
                    ),
                    import(/* webpackChunkName: "route" */ './component/PatternStopsContainer').then(
                      getDefault,
                    ),
                    import(/* webpackChunkName: "route" */ './component/RoutePageMeta').then(
                      getDefault,
                    ),
                  ]).then(([title, header, map, content, meta]) =>
                    cb(null, { title, header, map, content, meta }),
                  );
                }}
                queries={{
                  title: RouteQueries,
                  header: RouteQueries,
                  map: PatternQueries,
                  content: PatternQueries,
                  meta: RouteQueries,
                }}
                render={ComponentLoading404Renderer}
                fullscreenMap
              />
              <Route
                path=":tripId"
                getComponents={(location, cb) => {
                  Promise.all([
                    import(/* webpackChunkName: "route" */ './component/RouteTitle').then(
                      getDefault,
                    ),
                    import(/* webpackChunkName: "route" */ './component/RoutePage').then(
                      getDefault,
                    ),
                    import(/* webpackChunkName: "route" */ './component/RouteMapContainer').then(
                      getDefault,
                    ),
                    import(/* webpackChunkName: "route" */ './component/TripStopsContainer').then(
                      getDefault,
                    ),
                    import(/* webpackChunkName: "route" */ './component/RoutePageMeta').then(
                      getDefault,
                    ),
                  ]).then(([title, header, map, content, meta]) =>
                    cb(null, { title, header, map, content, meta }),
                  );
                }}
                queries={{
                  title: RouteQueries,
                  header: RouteQueries,
                  map: TripQueries,
                  content: TripQueries,
                  meta: RouteQueries,
                }}
                render={ComponentLoading404Renderer}
              >
                <Route path="kartta" fullscreenMap />
              </Route>
            </Route>
          </Route>
          <Route path="aikataulu">
            <IndexRedirect to=":routeId%3A0%3A01" />
            <Route
              path=":patternId"
              disableMapOnMobile
              getComponents={(location, cb) => {
                Promise.all([
                  import(/* webpackChunkName: "route" */ './component/RouteTitle').then(
                    getDefault,
                  ),
                  import(/* webpackChunkName: "route" */ './component/RoutePage').then(
                    getDefault,
                  ),
                  import(/* webpackChunkName: "route" */ './component/RouteMapContainer').then(
                    getDefault,
                  ),
                  import(/* webpackChunkName: "route" */ './component/RouteScheduleContainer').then(
                    getDefault,
                  ),
                  import(/* webpackChunkName: "route" */ './component/RoutePageMeta').then(
                    getDefault,
                  ),
                ]).then(([title, header, map, content, meta]) =>
                  cb(null, { title, header, map, content, meta }),
                );
              }}
              queries={{
                title: RouteQueries,
                header: RouteQueries,
                map: PatternQueries,
                content: PatternQueries,
                meta: RouteQueries,
              }}
              render={ComponentLoading404Renderer}
            />
          </Route>
          <Route
            path="hairiot"
            getComponents={(location, cb) => {
              Promise.all([
                import(/* webpackChunkName: "route" */ './component/RouteTitle').then(
                  getDefault,
                ),
                import(/* webpackChunkName: "route" */ './component/RoutePage').then(
                  getDefault,
                ),
                import(/* webpackChunkName: "route" */ './component/RouteAlertsContainer').then(
                  getDefault,
                ),
                import(/* webpackChunkName: "route" */ './component/RoutePageMeta').then(
                  getDefault,
                ),
              ]).then(([title, header, content, meta]) =>
                cb(null, { title, header, content, meta }),
              );
            }}
            queries={{
              title: RouteQueries,
              header: RouteQueries,
              content: RouteQueries,
              meta: RouteQueries,
            }}
            render={ComponentLoading404Renderer}
          />
        </Route>
      </Route>
      <Route
        path={`/${PREFIX_ITINERARY_SUMMARY}/:from/:to`}
        getComponents={(location, cb) => {
          Promise.all([
            import(/* webpackChunkName: "itinerary" */ './component/SummaryTitle').then(
              getDefault,
            ),
            import(/* webpackChunkName: "itinerary" */ './component/SummaryPage').then(
              getDefault,
            ),
            import(/* webpackChunkName: "itinerary" */ './component/SummaryPageMeta').then(
              getDefault,
            ),
          ]).then(([title, content, meta]) =>
            cb(null, { title, content, meta }),
          );
        }}
        queries={{ content: planQueries }}
        prepareParams={preparePlanParams(config)}
        render={{ content: SummaryPageWrapper }}
      >
        <Route
          path=":hash/tulosta"
          getComponents={(location, cb) => {
            import(/* webpackChunkName: "itinerary" */ './component/PrintableItinerary')
              .then(content => cb(null, { content: content.default }))
              .catch(errorLoading);
          }}
          printPage
        >
          <Route path="kartta" fullscreenMap />
        </Route>
        <Route
          path=":hash"
          getComponents={(location, cb) => {
            Promise.all([
              import(/* webpackChunkName: "itinerary" */ './component/ItineraryTab').then(
                getDefault,
              ),
              import(/* webpackChunkName: "itinerary" */ './component/ItineraryPageMap').then(
                getDefault,
              ),
            ]).then(([content, map]) => cb(null, { content, map }));
          }}
        >
          <Route path="kartta" fullscreenMap />
        </Route>
      </Route>
      <Route
        path="/suosikki/muokkaa/sijainti/:id"
        getComponent={(location, cb) => {
          import(/* webpackChunkName: "add-favourite" */ './component/AddFavouritePage')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }}
      />
      <Route
        path="/suosikki/muokkaa/pysakki/:id"
        getComponent={(location, cb) => {
          import(/* webpackChunkName: "add-favourite" */ './component/AddFavouritePage')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }}
      />
      <Route
        path="/tietoja-palvelusta"
        getComponents={(location, cb) => {
          Promise.all([
            Promise.resolve(Title),
            import(/* webpackChunkName: "about" */ './component/AboutPage').then(
              getDefault,
            ),
          ]).then(([title, content]) => cb(null, { title, content }));
        }}
      />
      <Route path="/js/:name" component={Error404} />
      <Route path="/css/:name" component={Error404} />
      <Route
        path="/(:from)(/:to)(/:tab)"
        topBarOptions={{ disableBackButton: true }}
        components={{
          title: Title,
          content: IndexPage,
        }}
        onEnter={scrollTop}
      />
      <Route
        path="/?mock"
        topBarOptions={{ disableBackButton: true }}
        components={{
          title: Title,
          content: IndexPage,
        }}
      />
      {/* For all the rest render 404 */}
      <Route path="*" component={Error404} />
    </Route>
  );
};
