Store = require 'fluxible/addons/BaseStore'

class RouteInformationStore extends Store
  @storeName: 'RouteInformationStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @routes = {}
    @patterns = {}
    @routePatterns = {}
    @routeTrips = {}
    @patternGeometries = {}

  getRoute: (id) =>
    @routes[id]

  getPattern: (id) =>
    @patterns[id]

  getRoutePatterns: (id) =>
    @routePatterns[id]

  getRouteTrips: (id) =>
    @routePatterns[id]

  getPatternGeometry: (id) =>
    @patternGeometries[id]

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

  storePatternGeometry: (data) ->
    @patternGeometries[data.id] = data.data
    @emitChange(data.id)

  dehydrate: ->
    routes: @routes
    patterns: @patterns
    routePatterns: @routePatterns
    routeTrips: @routeTrips
    patternGeometries: @patternGeometries

  rehydrate: (data) ->
    @routes = data.routes
    @patterns = data.patterns
    @routePatterns = data.routePatterns
    @routeTrips = data.routeTrips
    @patternGeometries = data.patternGeometries

  @handlers:
    "RouteInformationFound": 'storeRouteInformation'
    "PatternInformationFound": 'storePatternInformation'
    "RoutePatternsFound": 'storeRoutePatterns'
    "RouteTripsFound": 'storeRouteTrips'
    "PatternGeometryFound": 'storePatternGeometry'

module.exports = RouteInformationStore