# Libraries
React        = require 'react'
Router       = require 'react-router'

# React Pages
IndexPage     = require './page/index.cjsx'
MapPage       = require './page/map.cjsx'
StopPage      = require './page/stop.cjsx'
Error404      = require './page/404.cjsx'

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
    <Route path="pysakit/:stopId" handler={StopPage}>
      <Route path="kartta" name="stopMap" handler={Error404}/>
      <DefaultRoute name="stop" handler={Error404}/>
    </Route>
    <Route path="linjat" name="routeList" handler={Error404}/>
    <Route path="linjat/:routeId" handler={Error404}>
      <Route path="kartta" name="routeMap" handler={Error404}/>
      <Route path="aikataulu" name="routeTimetable" handler={Error404}/>
      <DefaultRoute name="route" handler={Error404}/>
    </Route>
    <Route path="reitti(/:from)/:to" name="tripList" handler={Error404}/>
    <Route path="reitti/:from/:to/:hash" name="trip" handler={Error404}/>
    <Route path="reitti/:from/:to/:hash/navigoi" name="navigate" handler={Error404}/>
    <DefaultRoute name="index" handler={IndexPage}/>
    <NotFoundRoute handler={Error404}/>
  </Route>

module.exports = routes