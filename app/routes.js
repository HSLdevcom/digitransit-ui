// Libraries
import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute, IndexRedirect } from 'react-router';

// React pages
import IndexPage from './page/IndexPage';
import ItineraryPage from './page/ItineraryPage';
import RoutePage from './page/RoutePage';
import StopPage from './page/StopPage';
import SummaryPage from './page/SummaryPage';
import LoadingPage from './page/loading';
import Error404 from './page/404';
import StyleGuidelines from './page/StyleGuidelines';
import AddFavouritePage from './page/AddFavouritePage';
import AboutPage from './page/AboutPage';
import splashOrComponent from './component/splash/splash-or-component';

// Components for page parts
import RouteAlertsContainer from './component/route/RouteAlertsContainer';
import RoutePatternSelectContainer from './component/route/RoutePatternSelectContainer';
import RouteScheduleContainer from './component/route/RouteScheduleContainer';
import PatternStopsContainer from './component/route/PatternStopsContainer';
import TripStopsContainer from './component/trip/TripStopsContainer';

import TopLevel from './component/TopLevel';

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
  <Route path="/" component={TopLevel}>
    <IndexRoute component={splashOrComponent(IndexPage)} />
    <Route path="pysakit">
      <IndexRoute component={Error404} /> {/* TODO: Should return list of all routes*/}
      <Route path=":stopId">
        <IndexRoute
          component={StopPage}
          queries={StopQueries}
          render={({ props }) => (props ? <StopPage {...props} /> : <LoadingPage />)}
        />
        <Route
          path="kartta"
          component={StopPage}
          queries={StopQueries}
          render={({ props }) => (props ? <StopPage {...props} fullscreenMap /> : <LoadingPage />)}
        />
        <Route path="info" component={Error404} />
      </Route>
    </Route>
    <Route path="terminaalit">
      <IndexRoute component={Error404} /> {/* TODO: Should return list of all terminals*/}
      <Route path=":terminalId">
        <IndexRoute
          component={StopPage}
          queries={terminalQueries}
          render={({ props }) => (props ? <StopPage {...props} isTerminal /> : <LoadingPage />)}
        />
        <Route
          path="kartta"
          component={StopPage}
          queries={terminalQueries}
          render={({ props }) => (
            props ? <StopPage {...props} isTerminal fullscreenMap /> : <LoadingPage />
          )}
        />
      </Route>
    </Route>
    <Route path="linjat">
      <IndexRoute component={Error404} />
      <Route
        path=":routeId"
        component={RoutePage}
        queries={RouteQueries}
        render={({ props }) => (props ? <RoutePage {...props} /> : <LoadingPage />)}
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
    <Route path="reitti/:from/:to" component={SummaryPage} />
    <Route path="reitti/:from/:to/:hash" component={ItineraryPage} />
    <Route path="reitti/:from/:to/:hash/navigoi" component={Error404} />
    <Route path="styleguide" component={StyleGuidelines} />
    <Route path="styleguide/component/:componentName" component={StyleGuidelines} />
    <Route path="suosikki/uusi" component={AddFavouritePage} />
    <Route path="suosikki/muokkaa/:id" component={AddFavouritePage} />
    <Route path="tietoja-palvelusta" name="about" component={AboutPage} />
    {/* Main menu does not open without this in mock mode? */}
    <Route path="/?mock" name="mockIndex" component={IndexPage} />
  </Route>
);

export default routes;
