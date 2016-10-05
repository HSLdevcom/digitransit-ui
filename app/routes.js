// Libraries
import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import ContainerDimensions from 'react-container-dimensions';

// React pages
import IndexPage from './page/IndexPage';
import ItineraryPage from './page/ItineraryPage';
import RoutePage from './page/RoutePage';
import StopPage from './page/StopPage';
import SummaryPage from './page/SummaryPage';
// import LoadingPage from './page/loading'; TODO: Re-add loadingspinners where wanted
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
import FavouritesPanel from './component/favourites/FavouritesPanel';
import NearbyRoutesPanel from './component/front-page/NearbyRoutesPanel';


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
          title: () => <span>Pysäkki</span>, // TODO: Add FormattedMessage
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
          title: () => <span>Terminaali</span>, // TODO: Add FormattedMessage
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
      components={{ title: () => <span>Reittiehdotukset</span>, content: SummaryPage }}
    />
    <Route
      path="/reitti/:from/:to/:hash"
      components={{ title: () => <span>Reittiohje</span>, content: ItineraryPage }}
    />
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
