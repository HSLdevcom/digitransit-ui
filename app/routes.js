// Libraries
import React from 'react';
import { Route, IndexRoute } from 'react-router';

// React pages
import IndexPage from './page/IndexPage';
import ItineraryPage from './page/itinerary';
import RoutePage from './page/route';
import StopMapPage from './page/stop-map';
import StopPage from './page/stop';
import SummaryPage from './page/summary';
import TripPage from './page/trip';
import TripMapPage from './page/trip-map';
import LoadingPage from './page/loading';
import Error404 from './page/404';
import StyleGuidelines from './page/StyleGuidelines';
import AddFavouritePage from './page/add-favourite';
import splashOrComponent from './component/splash/splash-or-component';

import TopLevel from './component/top-level';
import { StopQueries, TripQueries, RouteQueries } from './queries';

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
      renderLoading={() => <LoadingPage />}
    />
    <Route
      path="pysakit/:stopId/kartta"
      name="stopMap"
      component={StopMapPage}
      queries={StopQueries}
      renderLoading={() => <LoadingPage />}
    />
    <Route path="pysakit/:stopId/info" name="stopInfo" component={Error404} />
    <Route path="linjat" name="routeList" component={Error404} />
    <Route
      path="linjat/:routeId"
      name="route"
      component={RoutePage}
      queries={RouteQueries}
      renderLoading={() => <LoadingPage />}
    />
    <Route
      path="lahdot/:tripId"
      name="trip"
      component={TripPage}
      queries={TripQueries}
      renderLoading={() => <LoadingPage />}
    />
    <Route
      path="lahdot/:tripId/kartta"
      name="tripMap"
      component={TripMapPage}
      queries={TripQueries}
      renderLoading={() => <LoadingPage />}
    />
    <Route path="reitti/:from/:to" name="summary" component={SummaryPage} />
    <Route path="reitti/:from/:to/:hash" name="itinerary" component={ItineraryPage} />
    <Route path="reitti/:from/:to/:hash/navigoi" name="navigate" component={Error404} />
    <Route path="styleguide" name="styleGuidelines" component={StyleGuidelines} />
    <Route path="lisaa-suosikki" name="addFavourite" component={AddFavouritePage} />
  </Route>
);

export default routes;
