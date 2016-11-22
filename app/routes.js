// Libraries
import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import ContainerDimensions from 'react-container-dimensions';
import withProps from 'recompose/withProps';
import { FormattedMessage } from 'react-intl';

import omitBy from 'lodash/omitBy';
import isNil from 'lodash/isNil';

import moment from 'moment';

// React pages
import IndexPage from './component/IndexPage';
import RoutePage from './component/RoutePage';
import StopPage from './component/StopPage';
import SummaryPage from './component/SummaryPage';
import LoadingPage from './component/LoadingPage';
import Error404 from './component/404';
import AddFavouritePage from './component/AddFavouritePage';
import AboutPage from './component/AboutPage';
import SplashOrChildren from './component/SplashOrChildren';

// Components for page parts
import RouteAlertsContainer from './component/RouteAlertsContainer';
import RouteMapContainer from './component/RouteMapContainer';
import RouteScheduleContainer from './component/RouteScheduleContainer';
import PatternStopsContainer from './component/PatternStopsContainer';
import TripStopsContainer from './component/TripStopsContainer';
import RouteTitle from './component/RouteTitle';
import StopPageMap from './component/StopPageMap';
import StopPageHeaderContainer from './component/StopPageHeaderContainer';
import StopPageMeta from './component/StopPageMeta';
import SummaryTitle from './component/SummaryTitle';
import ItineraryTab from './component/ItineraryTab';
import ItineraryPageMap from './component/ItineraryPageMap';

import { storeEndpoint } from './action/EndpointActions';
import { otpToLocation } from './util/otpStrings';

import TopLevel from './component/TopLevel';

import config from './config';

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

const preparePlanParams = (
    { from, to },
    { location: { query: {
      numItineraries,
      time,
      arriveBy,
      walkReluctance,
      walkSpeed,
      walkBoardCost,
      minTransferTime,
      modes,
      accessibilityOption,
    } } }
  ) => omitBy({
    fromPlace: from,
    toPlace: to,
    from: otpToLocation(from),
    to: otpToLocation(to),
    numItineraries: numItineraries ? Number(numItineraries) : undefined,
    modes: modes ? modes
      .split(',')
      .sort()
      .map(mode => (mode === 'CITYBIKE' ? 'BICYCLE_RENT' : mode))
      .join(',')
    : undefined,
    date: time ? moment(time * 1000).format('YYYY-MM-DD') : undefined,
    time: time ? moment(time * 1000).format('HH:mm:ss') : undefined,
    walkReluctance: walkReluctance ? Number(walkReluctance) : undefined,
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

function errorLoading(err) {
  console.error('Dynamic page loading failed', err);
}

function loadRoute(cb) {
  return module => cb(null, module.default);
}

const SummaryPageWrapper = ({ props, routerProps }) => (props ?
  <SummaryPage {...props} /> :
  <SummaryPage
    {...routerProps}
    {...preparePlanParams(routerProps.params, routerProps)}
    plan={{ plan: { } }}
    loading
  />
);

SummaryPageWrapper.propTypes = {
  props: React.PropTypes.object.isRequired,
  routerProps: React.PropTypes.object.isRequired,
};

const StopTitle = withProps({
  id: 'stop-page.title-short',
  defaultMessage: 'Stop',
})(FormattedMessage);

const TerminalTitle = withProps({
  id: 'terminal-page.title-short',
  defaultMessage: 'Terminal',
})(FormattedMessage);

const routes = (
  <Route
    component={props => (typeof window !== 'undefined' ?
      <ContainerDimensions><TopLevel {...props} /></ContainerDimensions> :
      <TopLevel {...props} />
    )}
  >
    <Route
      path="/" topBarOptions={{ disableBackButton: true }} components={{
        title: () => <span>{config.title}</span>,
        content: props => <SplashOrChildren><IndexPage {...props} /></SplashOrChildren>
        ,
      }}
    >
      <Route path="lahellasi" />
      <Route path="suosikit" />
    </Route>

    <Route
      path="/?mock" topBarOptions={{ disableBackButton: true }} components={{
        title: () => <span>{config.title}</span>,
        content: props => <SplashOrChildren><IndexPage {...props} /></SplashOrChildren>
        ,
      }}
    >
      <Route path="lahellasi" />
      <Route path="suosikit" />
    </Route>

    <Route path="/pysakit">
      <IndexRoute component={Error404} /> {/* TODO: Should return list of all routes*/}
      <Route
        path=":stopId"
        components={{
          title: StopTitle,
          header: StopPageHeaderContainer,
          content: StopPage,
          map: StopPageMap,
          meta: StopPageMeta,
        }}
        queries={{
          header: StopQueries,
          content: StopQueries,
          map: StopQueries,
          meta: StopQueries,
        }}
        render={{
          // eslint-disable-next-line react/prop-types
          header: ({ props }) => (props ? <StopPageHeaderContainer {...props} /> : <LoadingPage />),
          // eslint-disable-next-line react/prop-types
          content: ({ props }) => (props ? <StopPage {...props} /> : undefined),
        }}
      >
        <Route path="kartta" fullscreenMap />
        <Route path="info" component={Error404} />
      </Route>
    </Route>
    <Route path="/terminaalit">
      <IndexRoute component={Error404} /> {/* TODO: Should return list of all terminals*/}
      <Route
        path=":terminalId"
        components={{
          title: TerminalTitle,
          header: StopPageHeaderContainer,
          content: StopPage,
          map: StopPageMap,
          meta: StopPageMeta,
        }}
        queries={{
          header: terminalQueries,
          content: terminalQueries,
          map: terminalQueries,
          meta: terminalQueries,
        }}
      >
        <Route path="kartta" fullscreenMap />
      </Route>
    </Route>
    <Route path="/linjat">
      <IndexRoute component={Error404} />
      <Route path=":routeId">
        <IndexRedirect to="pysakit" />
        <Route path="pysakit">
          <IndexRedirect to=":routeId%3A0%3A01" /> {/* Redirect to first pattern of route*/}
          <Route path=":patternId">
            <IndexRoute
              components={{
                title: RouteTitle,
                header: RoutePage,
                map: RouteMapContainer,
                content: PatternStopsContainer,
              }}
              queries={{
                title: RouteQueries,
                header: RouteQueries,
                map: PatternQueries,
                content: PatternQueries,
              }}
              // eslint-disable-next-line react/prop-types
              render={{ title: ({ props }) => <RouteTitle {...props} /> }}
            />
            <Route
              path="kartta"
              components={{
                title: RouteTitle,
                header: RoutePage,
                map: RouteMapContainer,
                content: PatternStopsContainer,
              }}
              queries={{
                title: RouteQueries,
                header: RouteQueries,
                map: PatternQueries,
                content: PatternQueries,
              }}
              // eslint-disable-next-line react/prop-types
              render={{ title: ({ props }) => <RouteTitle {...props} /> }}
              fullscreenMap
            />
            <Route
              path=":tripId"
              components={{
                title: RouteTitle,
                header: RoutePage,
                map: RouteMapContainer,
                content: TripStopsContainer,
              }}
              queries={{
                title: RouteQueries,
                header: RouteQueries,
                map: TripQueries,
                content: TripQueries,
              }}
              // eslint-disable-next-line react/prop-types
              render={{ title: ({ props }) => <RouteTitle {...props} /> }}
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
            components={{
              title: RouteTitle,
              header: RoutePage,
              map: RouteMapContainer,
              content: RouteScheduleContainer,
            }}
            queries={{
              title: RouteQueries,
              header: RouteQueries,
              map: PatternQueries,
              content: PatternQueries,
            }}
            // eslint-disable-next-line react/prop-types
            render={{ title: ({ props }) => <RouteTitle {...props} /> }}
          />
        </Route>
        <Route
          path="hairiot"
          components={{
            title: RouteTitle,
            header: RoutePage,
            content: RouteAlertsContainer,
          }}
          queries={{
            title: RouteQueries,
            header: RouteQueries,
            content: RouteQueries,
          }}
          // eslint-disable-next-line react/prop-types
          render={{ title: ({ props }) => <RouteTitle {...props} /> }}
        />
      </Route>
    </Route>
    <Route
      path="/reitti/:from/:to"
      components={{
        title: SummaryTitle,
        content: SummaryPage,
      }}
      queries={{ content: planQueries }}
      prepareParams={preparePlanParams}
      render={{ content: SummaryPageWrapper }}
      loadAction={params => [
        [storeEndpoint, { target: 'origin', endpoint: otpToLocation(params.from) }],
        [storeEndpoint, { target: 'destination', endpoint: otpToLocation(params.to) }],
      ]}
    >
      <Route path=":hash" components={{ content: ItineraryTab, map: ItineraryPageMap }}>
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
      getComponent={(location, cb) => {
        System.import('./component/StyleGuidePage').then(loadRoute(cb)).catch(errorLoading);
      }}
    />
    <Route path="/suosikki/uusi" component={AddFavouritePage} />
    <Route path="/suosikki/muokkaa/:id" component={AddFavouritePage} />
    <Route
      path="/tietoja-palvelusta"
      components={{
        title: () => <span>{config.title}</span>,
        content: AboutPage }}
    />
  </Route>
);

export default routes;
