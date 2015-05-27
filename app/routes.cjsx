# Libraries
React        = require 'react'
Router       = require 'react-router'

# React Pages
IndexPage     = require './page/index'
ItineraryPage = require './page/itinerary'
MapPage       = require './page/map'
StopPage      = require './page/stop'
StopMapPage   = require './page/stop-map'
SummaryPage   = require './page/summary'
Error404      = require './page/404'

# Reittiopas application
Route = Router.Route;
NotFoundRoute = Router.NotFoundRoute;
DefaultRoute = Router.DefaultRoute;
RouteHandler = Router.RouteHandler

App = React.createClass
  render: ->
    <RouteHandler/>

ROOT_PATH = if process?.env.ROOT_PATH != undefined then process.env.ROOT_PATH else '/'

# Routes
routes = 
  <Route name="app" path={ROOT_PATH} handler={App}>
    <Route path="kartta" name="map" handler={MapPage}/>
    <Route path="pysakit" name="stopList" handler={Error404}/>
    <Route path="pysakit/:stopId" name="stop" handler={StopPage}/>
    <Route path="pysakit/:stopId/kartta" name="stopMap" handler={StopMapPage}/>
    <Route path="pysakit/:stopId/info" name="stopInfo" handler={Error404}/>
    <Route path="linjat" name="routeList" handler={Error404}/>
    <Route path="linjat/:routeId" handler={Error404}>
      <Route path="kartta" name="routeMap" handler={Error404}/>
      <Route path="aikataulu" name="routeTimetable" handler={Error404}/>
      <DefaultRoute name="route" handler={Error404}/>
    </Route>
    <Route path="reitti/:from/:to" name="itineraryList" handler={SummaryPage}/>
    <Route path="reitti/:from/:to/:hash" name="itinerary" handler={ItineraryPage}/>
    <Route path="reitti/:from/:to/:hash/navigoi" name="navigate" handler={Error404}/>
    <DefaultRoute name="index" handler={IndexPage}/>
    <NotFoundRoute name="404" handler={Error404}/>
  </Route>

module.exports = routes