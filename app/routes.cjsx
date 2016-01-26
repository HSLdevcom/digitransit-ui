# Libraries
React         = require 'react'

TopLevel      = require './component/top-level'

# React Pages
IndexPage     = require './page/index'
ItineraryPage = require './page/itinerary'
RoutePage     = require './page/route'
StopMapPage   = require './page/stop-map'
StopPage      = require './page/stop'
SummaryPage   = require './page/summary'
TripPage      = require './page/trip'
TripMapPage   = require './page/trip-map'
LoadingPage   = require './page/loading'
Error404      = require './page/404'
StyleGuidelinesPage = require './page/style-guidelines'

# Queries
queries = require './queries'

# Reittiopas application
Route = require 'react-router/lib/Route'
IndexRoute = require 'react-router/lib/IndexRoute'

# Routes
routes =
  <Route path="/" name="app" component={TopLevel}>
    <IndexRoute component={IndexPage}/>
    <Route path="pysakit" name="stopList" component={Error404}/>
    <Route path="pysakit/:stopId" name="stop" component={StopPage} queries={queries.StopQueries} renderLoading={() => <LoadingPage/>}/>
    <Route path="pysakit/:stopId/kartta" name="stopMap" component={StopMapPage} queries={queries.StopQueries} renderLoading={() => <LoadingPage/>}/>
    <Route path="pysakit/:stopId/info" name="stopInfo" component={Error404}/>
    <Route path="linjat" name="routeList" component={Error404}/>
    <Route path="linjat/:routeId" name="route" component={RoutePage} queries={queries.RouteQueries} renderLoading={() => <LoadingPage/>}/>
    <Route path="lahdot/:tripId" name="trip" component={TripPage} queries={queries.TripQueries} renderLoading={() => <LoadingPage/>}/>
    <Route path="lahdot/:tripId/kartta" name="tripMap" component={TripMapPage} queries={queries.TripQueries} renderLoading={() => <LoadingPage/>}/>
    <Route path="reitti/:from/:to" name="summary" component={SummaryPage}/>
    <Route path="reitti/:from/:to/:hash" name="itinerary" component={ItineraryPage}/>
    <Route path="reitti/:from/:to/:hash/navigoi" name="navigate" component={Error404}/>
    <Route path="styleguidelines" name="styleGuidelines" component={StyleGuidelinesPage}/>
  </Route>

module.exports = routes
