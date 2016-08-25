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


const routes = (
  <Route path="/" name="app" component={TopLevel}>
    <IndexRoute
      component={splashOrComponent(IndexPage)}
    />
    <Route
      path="pysakit"
      name="stopList"
      component={Error404}
    />
    <Route
      path="pysakit/:stopId"
      name="stop"
      component={StopPage}
      queries={StopQueries}
      render={({ props }) => (props ? <StopPage {...props} /> : <LoadingPage />)}
    />
    <Route
      path="pysakit/:stopId/kartta"
      name="stopMap"
      component={StopPage}
      queries={StopQueries}
      render={({ props }) => (props ? <StopPage {...props} fullscreenMap /> : <LoadingPage />)}
    />
    <Route path="pysakit/:stopId/info" name="stopInfo" component={Error404} />
    <Route path="linjat" name="routeList" component={Error404} />
    <Route
      path="linjat/:routeId"
      name="route"
      component={RoutePage}
      queries={RouteQueries}
      render={({ props }) => (props ? <RoutePage {...props} /> : <LoadingPage />)}
    />
    <Route
      path="linjat/:routeId/kartta"
      name="route"
      component={RoutePage}
      queries={RouteQueries}
      render={({ props }) => (props ? <RoutePage {...props} fullscreenMap /> : <LoadingPage />)}
    />
    <Route
      path="lahdot/:tripId"
      name="trip"
      component={TripPage}
      queries={TripQueries}
      render={({ props }) => (props ? <TripPage {...props} /> : <LoadingPage />)}
    />
    <Route
      path="lahdot/:tripId/kartta"
      name="tripMap"
      component={TripPage}
      queries={TripQueries}
      render={({ props }) => (props ? <TripPage {...props} fullscreenMap /> : <LoadingPage />)}
    />
    <Route path="reitti/:from/:to" name="summary" component={SummaryPage} />
    <Route path="reitti/:from/:to/:hash" name="itinerary" component={ItineraryPage} />
    <Route path="reitti/:from/:to/:hash/navigoi" name="navigate" component={Error404} />
    <Route path="styleguide" name="styleGuidelines" component={StyleGuidelines} />
    <Route
      path="styleguide/component/:componentName" name="componentExample" component={StyleGuidelines}
    />
    <Route path="lisaa-suosikki" name="addFavourite" component={AddFavouritePage} />
    <Route path="tietoja-palvelusta" name="about" component={AboutPage} />
    {/* Main menu does not open without this in mock mode? */}
    <Route path="/?mock" name="mockIndex" component={IndexPage} />
  </Route>
);

export default routes;
