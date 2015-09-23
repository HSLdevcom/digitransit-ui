# Libraries
React        = require 'react'

# React Pages
IndexPage     = require './page/index'
ItineraryPage = require './page/itinerary'
MapPage       = require './page/map'
NavigationPage = require './page/navigation'
RoutePage     = require './page/route'
StopMapPage   = require './page/stop-map'
StopPage      = require './page/stop'
SummaryPage   = require './page/summary'
TripPage      = require './page/trip'
TripMapPage   = require './page/trip-map'
Error404      = require './page/404'

# Queriesd
queries = require './queries'

# Reittiopas application
Route = require 'react-router/lib/Route'
IndexRoute = require 'react-router/lib/IndexRoute'

ROOT_PATH = if process?.env.ROOT_PATH != undefined then process.env.ROOT_PATH else '/'

# Routes
routes =
  <Route path={ROOT_PATH} name="app">
    <IndexRoute component={IndexPage}/>
    <Route path="kartta" name="map" component={MapPage}/>
    <Route path="pysakit" name="stopList" component={Error404}/>
    <Route path="pysakit/:stopId" name="stop" component={StopPage} queries={queries.StopQueries}/>
    <Route path="pysakit/:stopId/kartta" name="stopMap" component={StopMapPage} queries={queries.StopQueries}/>
    <Route path="pysakit/:stopId/info" name="stopInfo" component={Error404}/>
    <Route path="linjat" name="routeList" component={Error404}/>
    <Route path="linjat/:routeId" name="route" component={RoutePage} queries={queries.RouteQueries}/>
    <Route path="lahdot/:tripId" name="trip" component={TripPage} queries={queries.TripQueries}/>
    <Route path="lahdot/:tripId/kartta" name="tripMap" component={TripMapPage} queries={queries.TripQueries}/>
    <Route path="reitti/:from/:to" name="summary" component={SummaryPage}/>
    <Route path="reitti/:from/:to/:hash" name="itinerary" component={ItineraryPage}/>
    <Route path="reitti/:from/:to/:hash/navigoi" name="navigate" component={NavigationPage}/>
  </Route>

module.exports = routes
