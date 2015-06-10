Store = require 'fluxible/addons/BaseStore'

class RouteInformationStore extends Store
  @storeName: 'RouteInformationStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @routes = {}
    @patterns = {}
    @routePatterns = {}
    @routeTrips = {}

  getRoute: (id) =>
    @routes[id]

  getPattern: (id) =>
    @patterns[id]

  getRoutePatterns: (id) =>
    @routePatterns[id]

  getRouteTrips: (id) =>
    @routePatterns[id]

  storeRouteInformation: (data) ->
    @routes[data.id] = data
    @emitChange(data.id)

  storePatternInformation: (data) ->
    @patterns[data.id] = data
    @emitChange(data.id)

  storeRoutePatterns: (data) ->
    @routePatterns[data.id] = data.data
    @emitChange(data.id)

  storeRouteTrips: (data) ->
    @routeTrips[data.id] = data.data
    @emitChange(data.id)

  dehydrate: ->
    routes: @routes
    patterns: @patterns
    routePatterns: @routePatterns
    routeTrips: @routeTrips

  rehydrate: (data) ->
    @routes = data.routes
    @patterns = data.patterns
    @routePatterns = data.routePatterns
    @routeTrips = data.routeTrips

  @handlers:
    "RouteInformationFound": 'storeRouteInformation'
    "PatternInformationFound": 'storePatternInformation'
    "RoutePatternsFound": 'storeRoutePatterns'
    "RouteTripsFound": 'storeRouteTrips'

module.exports = RouteInformationStore