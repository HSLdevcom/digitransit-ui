// Libraries
import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import ContainerDimensions from 'react-container-dimensions';

import omitBy from 'lodash/omitBy';
import isNil from 'lodash/isNil';

import moment from 'moment';

// React pages
import IndexPage from './component/IndexPage';
import Error404 from './component/404';
import NetworkError from './component/NetworkError';
import Loading from './component/LoadingPage';
import SplashOrChildren from './component/SplashOrChildren';

import { otpToLocation } from './util/otpStrings';

import TopLevel from './component/TopLevel';
import Title from './component/Title';

import { isBrowser } from './util/browser';

// Localstorage data
import { getCustomizedSettings } from './store/localStorage';

const ComponentLoading404Renderer = {
  /* eslint-disable react/prop-types */
  header: ({ error, props, element, retry }) => {
    if (error) {
      if (error.message === 'Failed to fetch' // Chrome
        || error.message === 'Network request failed' // Safari && FF && IE
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
  title: ({ props, element }) => React.cloneElement(element, { route: null, ...props }),
  content: ({ props, element }) => (
    props ? React.cloneElement(element, props) : <div className="flex-grow" />
  ),
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

function getIntermediatePlaces(intermediatePlaces) {
  if (!intermediatePlaces) {
    return [];
  } else if (Array.isArray(intermediatePlaces)) {
    return intermediatePlaces.map(otpToLocation);
  } else if (typeof intermediatePlaces === 'string') {
    return [otpToLocation(intermediatePlaces)];
  }
  return [];
}

export default (config) => {
  const custSettings = getCustomizedSettings();
  const settings = {
    walkSpeed: custSettings.walkSpeed ? Number(custSettings.walkSpeed)
      : undefined,
    walkReluctance: custSettings.walkReluctance ? Number(custSettings.walkReluctance)
      : undefined,
    walkBoardCost: custSettings.walkBoardCost ? Number(custSettings.walkBoardCost)
      : undefined,
    modes: custSettings.modes ? custSettings.modes
        .toString()
        .split(',')
        .sort()
        .map(mode => (mode === 'CITYBIKE' ? 'BICYCLE_RENT' : mode))
        .join(',') : undefined,
    minTransferTime: custSettings.minTransferTime ? Number(custSettings.minTransferTime)
      : undefined,
    accessibilityOption: custSettings.accessibilityOption ? custSettings.accessibilityOption
      : undefined,
  };
  console.log(settings);
  const preparePlanParams = (
      { from, to },
      { location: { query: {
        intermediatePlaces,
        numItineraries,
        time,
        arriveBy,
        walkReluctance,
        walkSpeed,
        walkBoardCost,
        minTransferTime,
        modes,
        accessibilityOption,
      } } },
    ) => omitBy({
      fromPlace: from,
      toPlace: to,
      from: otpToLocation(from),
      to: otpToLocation(to),
      intermediatePlaces: getIntermediatePlaces(intermediatePlaces),
      numItineraries: numItineraries ? Number(numItineraries) : undefined,
      modes: modes ? modes
        .split(',')
        .sort()
        .map(mode => (mode === 'CITYBIKE' ? 'BICYCLE_RENT' : mode))
        .join(',')
      : settings.modes,
      date: time ? moment(time * 1000).format('YYYY-MM-DD') : undefined,
      time: time ? moment(time * 1000).format('HH:mm:ss') : undefined,
      walkReluctance: walkReluctance ? Number(walkReluctance) : settings.walkReluctance,
      walkBoardCost: walkBoardCost ? Number(walkBoardCost) : undefined,
      minTransferTime: minTransferTime ? Number(minTransferTime) : undefined,
      walkSpeed: walkSpeed ? Number(walkSpeed) : undefined,
      arriveBy: arriveBy ? arriveBy === 'true' : undefined,
      maxWalkDistance: (typeof modes === 'undefined' ||
        (typeof modes === 'string' && !modes.split(',').includes('BICYCLE'))) ?
        config.maxWalkDistance : config.maxBikingDistance,
      wheelchair: accessibilityOption === '1',
      preferred: { agencies: config.preferredAgency || '' },
      disableRemainingWeightHeuristic: modes && modes.split(',').includes('CITYBIKE'),
    }, isNil);

  const SummaryPageWrapper = ({ props, routerProps, element }) => (props ?
    React.cloneElement(element, props) :
    React.cloneElement(element, {
      ...routerProps,
      ...preparePlanParams(routerProps.params, routerProps),
      plan: { plan: { } },
      loading: true,
    })
  );

  SummaryPageWrapper.propTypes = {
    props: React.PropTypes.object.isRequired,
    routerProps: React.PropTypes.object.isRequired,
  };


  return (
    <Route
      component={props => (isBrowser ?
        <ContainerDimensions><TopLevel {...props} /></ContainerDimensions> :
        <TopLevel {...props} />
      )}
    >
      <Route
        path="/" topBarOptions={{ disableBackButton: true }} components={{
          title: Title,
          content: props => <SplashOrChildren><IndexPage {...props} /></SplashOrChildren>
          ,
        }}
      >
        <Route
          path="lahellasi"
          getComponents={(location, cb) =>
            System.import('./component/NearbyRoutesPanel')
              .then(getDefault).then(content => cb(null, { content })).catch(errorLoading)
          }
        />
        <Route
          path="suosikit"
          getComponents={(location, cb) =>
            System.import('./component/FavouritesPanel')
              .then(getDefault).then(content => cb(null, { content })).catch(errorLoading)
          }
        />
      </Route>
      <Route
        path="/?mock" topBarOptions={{ disableBackButton: true }} components={{
          title: Title,
          content: props => <SplashOrChildren><IndexPage {...props} /></SplashOrChildren>,
        }}
      >
        <Route
          path="lahellasi"
          getComponents={(location, cb) =>
            System.import('./component/NearbyRoutesPanel')
              .then(getDefault).then(content => cb(null, { content })).catch(errorLoading)
          }
        />
        <Route
          path="suosikit"
          getComponents={(location, cb) =>
            System.import('./component/FavouritesPanel')
              .then(getDefault).then(content => cb(null, { content })).catch(errorLoading)
          }
        />
      </Route>

      <Route path="/pysakit">
        <IndexRoute component={Error404} /> {/* TODO: Should return list of all routes*/}
        <Route
          path=":stopId"
          getComponents={(location, cb) => {
            Promise.all([
              System.import('./component/StopTitle').then(getDefault),
              System.import('./component/StopPageHeaderContainer').then(getDefault),
              System.import('./component/StopPage').then(getDefault),
              System.import('./component/StopPageMap').then(getDefault),
              System.import('./component/StopPageMeta').then(getDefault),
            ]).then(([title, header, content, map, meta]) =>
              cb(null, { title, header, content, map, meta },
            ));
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
        <IndexRoute component={Error404} /> {/* TODO: Should return list of all terminals*/}
        <Route
          path=":terminalId"
          getComponents={(location, cb) => {
            Promise.all([
              System.import('./component/TerminalTitle').then(getDefault),
              System.import('./component/StopPageHeaderContainer').then(getDefault),
              System.import('./component/TerminalPage').then(getDefault),
              System.import('./component/StopPageMap').then(getDefault),
              System.import('./component/StopPageMeta').then(getDefault),
            ]).then(([title, header, content, map, meta]) =>
              cb(null, { title, header, content, map, meta },
            ));
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
      <Route path="/linjat">
        <IndexRoute component={Error404} /> {/* TODO: Should return list of all routes */}
        <Route path=":routeId">
          <IndexRedirect to="pysakit" />
          <Route path="pysakit">
            <IndexRedirect to=":routeId%3A0%3A01" /> {/* Redirect to first pattern of route*/}
            <Route path=":patternId">
              <IndexRoute
                getComponents={(location, cb) => {
                  Promise.all([
                    System.import('./component/RouteTitle').then(getDefault),
                    System.import('./component/RoutePage').then(getDefault),
                    System.import('./component/RouteMapContainer').then(getDefault),
                    System.import('./component/PatternStopsContainer').then(getDefault),
                    System.import('./component/RoutePageMeta').then(getDefault),
                  ]).then(
                    ([title, header, map, content, meta]) =>
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
                    System.import('./component/RouteTitle').then(getDefault),
                    System.import('./component/RoutePage').then(getDefault),
                    System.import('./component/RouteMapContainer').then(getDefault),
                    System.import('./component/PatternStopsContainer').then(getDefault),
                    System.import('./component/RoutePageMeta').then(getDefault),
                  ]).then(
                    ([title, header, map, content, meta]) =>
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
                    System.import('./component/RouteTitle').then(getDefault),
                    System.import('./component/RoutePage').then(getDefault),
                    System.import('./component/RouteMapContainer').then(getDefault),
                    System.import('./component/TripStopsContainer').then(getDefault),
                    System.import('./component/RoutePageMeta').then(getDefault),
                  ]).then(
                    ([title, header, map, content, meta]) =>
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
          <Route path="aikataulu" >
            <IndexRedirect to=":routeId%3A0%3A01" />
            <Route
              path=":patternId"
              disableMapOnMobile
              getComponents={(location, cb) => {
                Promise.all([
                  System.import('./component/RouteTitle').then(getDefault),
                  System.import('./component/RoutePage').then(getDefault),
                  System.import('./component/RouteMapContainer').then(getDefault),
                  System.import('./component/RouteScheduleContainer').then(getDefault),
                  System.import('./component/RoutePageMeta').then(getDefault),
                ]).then(([title, header, map, content, meta]) =>
                  cb(null, { title, header, map, content, meta }));
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
                System.import('./component/RouteTitle').then(getDefault),
                System.import('./component/RoutePage').then(getDefault),
                System.import('./component/RouteAlertsContainer').then(getDefault),
                System.import('./component/RoutePageMeta').then(getDefault),
              ]).then(([title, header, content, meta]) =>
                cb(null, { title, header, content, meta }));
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
        path="/reitti/:from/:to"
        getComponents={(location, cb) => {
          Promise.all([
            System.import('./component/SummaryTitle').then(getDefault),
            System.import('./component/SummaryPage').then(getDefault),
            System.import('./component/SummaryPageMeta').then(getDefault),
          ]).then(([title, content, meta]) => cb(null, { title, content, meta }));
        }}
        queries={{ content: planQueries }}
        prepareParams={preparePlanParams}
        render={{ content: SummaryPageWrapper }}
      >
        <Route
          path=":hash"
          getComponents={(location, cb) => {
            Promise.all([
              System.import('./component/ItineraryTab').then(getDefault),
              System.import('./component/ItineraryPageMap').then(getDefault),
            ]).then(([content, map]) => cb(null, { content, map }));
          }}
        >
          <Route path="kartta" fullscreenMap />
        </Route>
      </Route>
      <Route
        path="/styleguide"
        getComponent={(location, cb) => {
          System.import('./component/StyleGuidePage').then(loadRoute(cb)).catch(errorLoading);
        }}
      />
      <Route
        path="/styleguide/component/:componentName"
        topBarOptions={{ hidden: true }}
        getComponent={(location, cb) => {
          System.import('./component/StyleGuidePage').then(loadRoute(cb)).catch(errorLoading);
        }}
      />
      <Route
        path="/suosikki/uusi"
        getComponent={(location, cb) => {
          System.import('./component/AddFavouritePage').then(loadRoute(cb)).catch(errorLoading);
        }}
      />
      <Route
        path="/suosikki/muokkaa/:id"
        getComponent={(location, cb) => {
          System.import('./component/AddFavouritePage').then(loadRoute(cb)).catch(errorLoading);
        }}
      />
      <Route
        path="/tietoja-palvelusta"
        getComponents={(location, cb) => {
          Promise.all([
            Promise.resolve(Title),
            System.import('./component/AboutPage').then(getDefault),
          ]).then(([title, content]) => cb(null, { title, content }));
        }}
      />
      {/* For all the rest render 404 */}
      <Route path="*" component={Error404} />
    </Route>
  );
};
