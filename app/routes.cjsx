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

# Routes
routes = 
  <Route name="app" path="/" handler={App}>
    <Route path="pysakit/:stopId" name="stop" handler={StopPage}/>
    # TEMP solution for dev
    <Route path="/openjourneyplanner-ui/" name="devindex" handler={IndexPage}/>
    <Route path="/openjourneyplanner-ui/pysakit/:stopId" name="devstop" handler={StopPage}/>
    <DefaultRoute handler={IndexPage}/>
    <NotFoundRoute handler={Error404}/>
  </Route>

module.exports = routes