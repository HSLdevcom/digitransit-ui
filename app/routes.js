// Libraries
import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute } from 'react-router';

// React pages
import IndexPage from './page/IndexPage';
import ItineraryPage from './page/itinerary';
import RoutePage from './page/RoutePage';
import StopPage from './page/StopPage';
import SummaryPage from './page/SummaryPage';
import TripPage from './page/TripPage';
import LoadingPage from './page/loading';
import Error404 from './page/404';
import StyleGuidelines from './page/StyleGuidelines';
import AddFavouritePage from './page/add-favourite';
import AboutPage from './page/AboutPage';
import splashOrComponent from './component/splash/splash-or-component';

import TopLevel from './component/top-level';

const StopQueries = {
  stop: () => Relay.QL`
    query  {
      stop(id: $stopId)
    }
  `,
};

const RouteQueries = {
  pattern: () => Relay.QL`
    query {
      pattern(id: $routeId)
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
      <Route path=":routeId">
        <IndexRoute
          component={RoutePage}
          queries={RouteQueries}
          render={({ props }) => (props ? <RoutePage {...props} /> : <LoadingPage />)}
        />
        <Route
          path="kartta"
          component={RoutePage}
          queries={RouteQueries}
          render={({ props }) => (props ? <RoutePage {...props} fullscreenMap /> : <LoadingPage />)}
        />
      </Route>
    </Route>
    <Route path="lahdot">
      <IndexRoute component={Error404} />
      <Route path=":tripId">
        <IndexRoute
          component={TripPage}
          queries={TripQueries}
          render={({ props }) => (props ? <TripPage {...props} /> : <LoadingPage />)}
        />
        <Route
          path="kartta"
          component={TripPage}
          queries={TripQueries}
          render={({ props }) => (props ? <TripPage {...props} fullscreenMap /> : <LoadingPage />)}
        />
      </Route>
    </Route>
    <Route path="reitti/:from/:to" component={SummaryPage} />
    <Route path="reitti/:from/:to/:hash" component={ItineraryPage} />
    <Route path="reitti/:from/:to/:hash/navigoi" component={Error404} />
    <Route path="styleguide" component={StyleGuidelines} />
    <Route path="styleguide/component/:componentName" component={StyleGuidelines} />
    <Route path="lisaa-suosikki" name="addFavourite" component={AddFavouritePage} />
    <Route path="tietoja-palvelusta" name="about" component={AboutPage} />
    {/* Main menu does not open without this in mock mode? */}
    <Route path="/?mock" name="mockIndex" component={IndexPage} />
  </Route>
);

export default routes;
