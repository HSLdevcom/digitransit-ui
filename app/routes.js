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
import IndexPage from './page/IndexPage';
import RoutePage from './page/RoutePage';
import StopPage from './page/StopPage';
import SummaryPage from './page/SummaryPage';
import LoadingPage from './page/loading';
import Error404 from './page/404';
import StyleGuidelines from './page/StyleGuidelines';
import AddFavouritePage from './page/AddFavouritePage';
import AboutPage from './page/AboutPage';
import SplashOrChildren from './component/splash/SplashOrChildren';

// Components for page parts
import RouteAlertsContainer from './component/route/RouteAlertsContainer';
import RoutePatternSelectContainer from './component/route/RoutePatternSelectContainer';
import RouteScheduleContainer from './component/route/RouteScheduleContainer';
import PatternStopsContainer from './component/route/PatternStopsContainer';
import TripStopsContainer from './component/trip/TripStopsContainer';
import RouteTitle from './component/route/RouteTitle';
import StopPageMap from './component/stop/StopPageMap';
import StopPageHeader from './component/stop/StopPageHeader';
import StopPageMeta from './component/stop/StopPageMeta';
import SummaryTitle from './component/summary/SummaryTitle';
import ItineraryTab from './component/itinerary/ItineraryTab';
import ItineraryPageMap from './component/itinerary/ItineraryPageMap';
import FavouritesPanel from './component/favourites/FavouritesPanel';
import NearbyRoutesPanel from './component/front-page/NearbyRoutesPanel';

import { storeEndpoint } from './action/EndpointActions';
import { otpToLocation } from './util/otp-strings';

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
    maxWalkDistance: modes && modes.split(',').includes('BICYCLE') ?
      config.maxWalkDistance : config.maxBikingDistance,
    wheelchair: accessibilityOption === '1',
    preferred: { agencies: config.preferredAgency || '' },
    disableRemainingWeightHeuristic: modes && modes.split(',').includes('CITYBIKE'),
  }, isNil);

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
    component={(props) => <ContainerDimensions><TopLevel {...props} /></ContainerDimensions>}
  >

    <Route
      path="/" components={{
        title: () => <span>{config.title}</span>,
        content: (props) => (<SplashOrChildren><IndexPage {...props} /></SplashOrChildren>)
        ,
      }}
    >
      <Route
        path="lahellasi" component={() => <NearbyRoutesPanel />}
      />
      <Route
        path="suosikit" component={() => <FavouritesPanel />}
      />
    </Route>

    <Route path="/pysakit">
      <IndexRoute component={Error404} /> {/* TODO: Should return list of all routes*/}
      <Route
        path=":stopId"
        components={{
          title: StopTitle,
          header: StopPageHeader,
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
          header: ({ props }) => (props ? <StopPageHeader {...props} /> : <LoadingPage />),
          // eslint-disable-next-line react/prop-types
          content: ({ props }) => (props ? <StopPage {...props} /> : false),
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
          header: StopPageHeader,
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
      <Route
        path=":routeId"
        components={{ title: RouteTitle, content: RoutePage }}
        queries={{ title: RouteQueries, content: RouteQueries }}
      >
        <IndexRedirect to="pysakit" />
        <Route path="pysakit" component={RoutePatternSelectContainer} queries={RouteQueries}>
          <IndexRedirect to=":routeId%3A0%3A01" /> {/* Redirect to first pattern of route*/}
          <Route path=":patternId">
            <IndexRoute component={PatternStopsContainer} queries={PatternQueries} />
            <Route
              path="kartta"
              component={PatternStopsContainer}
              queries={PatternQueries}
              fullscreenMap
            />
            <Route path=":tripId">
              <IndexRoute component={TripStopsContainer} queries={TripQueries} />
              <Route
                path="kartta"
                component={TripStopsContainer}
                queries={TripQueries}
                fullscreenMap
              />
            </Route>
          </Route>
        </Route>
        <Route path="aikataulu" component={RoutePatternSelectContainer} queries={RouteQueries}>
          <IndexRedirect to=":routeId%3A0%3A01" />
          <Route path=":patternId" component={RouteScheduleContainer} queries={PatternQueries} />
        </Route>
        <Route path="hairiot" component={RouteAlertsContainer} queries={RouteQueries} />
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
      render={{ content: ({ props, routerProps }) => (props ?
        <SummaryPage {...props} /> :
        <SummaryPage
          {...routerProps}
          {...preparePlanParams(routerProps.params, routerProps)}
          plan={{ plan: { } }}
          loading
        />
      ) }}
      loadAction={(params) => [
        [storeEndpoint, { target: 'origin', endpoint: otpToLocation(params.from) }],
        [storeEndpoint, { target: 'destination', endpoint: otpToLocation(params.to) }],
      ]}
    >
      <Route path=":hash" components={{ content: ItineraryTab, map: ItineraryPageMap }}>
        <Route path="kartta" fullscreenMap />
      </Route>
    </Route>
    <Route path="/styleguide" component={StyleGuidelines} />
    <Route path="/styleguide/component/:componentName" component={StyleGuidelines} />
    <Route path="/suosikki/uusi" component={AddFavouritePage} />
    <Route path="/suosikki/muokkaa/:id" component={AddFavouritePage} />
    <Route
      path="/tietoja-palvelusta"
      components={{
        title: () => <span>{config.title}</span>,
        content: AboutPage }}
    />
    {/* Main menu does not open without this in mock mode? */}
    <Route path="/?mock" name="mockIndex" component={IndexPage} />
  </Route>
);

export default routes;
