# Libraries
React = require('react')
Dispatcher = require('./dispatcher/dispatcher.coffee')
LocationStore = require('./store/location-store.coffee')
Router = require('react-router')
FastClick = require('fastclick')
React = require('react')

# React Pages
IndexPage = require('./page/index.coffee');
StopPage = require('./page/stop.coffee');
Error404 = require('./page/404.coffee');

# Enable Fastclick
window.addEventListener 'load', () ->
  FastClick(document.body)

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
    <Route path="/pysakit/:stopId" name="stop" handler={StopPage}/>
    <DefaultRoute handler={IndexPage}/>
    <NotFoundRoute handler={Error404}/>
  </Route>

# Run application
Router.run(routes, Router.HistoryLocation, (Handler) -> 
  React.render(<Handler/>, document.getElementById('page'))
)