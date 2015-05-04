# Libraries
React        = require 'react'
Router       = require 'react-router'

# React Pages
IndexPage     = require './page/index.cjsx'
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
    <Route path="pysakit/:stopId" name="stop" handler={StopPage}/>
    <DefaultRoute name="index" handler={IndexPage}/>
    <NotFoundRoute handler={Error404}/>
  </Route>

module.exports = routes