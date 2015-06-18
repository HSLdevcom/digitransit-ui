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
    @fuzzyTrips = {}

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

  getFuzzyTrip: (details) =>
    key = "#{details.route}/trips/#{details.date}/#{details.direction}/#{details.trip}"
    @fuzzyTrips[key]

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

  storeFuzzyTripInformation: (data) ->
    key = "#{data.details.route}/trips/#{data.details.date}/#{data.details.direction}/#{data.details.trip}"
    @fuzzyTrips[key] = data.data

  dehydrate: ->
    routes: @routes
    patterns: @patterns
    routePatterns: @routePatterns
    routeTrips: @routeTrips
    patternGeometries: @patternGeometries
    fuzzyTrips: @fuzzyTrips

  rehydrate: (data) ->
    @routes = data.routes
    @patterns = data.patterns
    @routePatterns = data.routePatterns
    @routeTrips = data.routeTrips
    @patternGeometries = data.patternGeometries
    @fuzzyTrips = data.fuzzyTrips

  @handlers:
    "RouteInformationFound": 'storeRouteInformation'
    "PatternInformationFound": 'storePatternInformation'
    "RoutePatternsFound": 'storeRoutePatterns'
    "RouteTripsFound": 'storeRouteTrips'
    "PatternGeometryFound": 'storePatternGeometry'
    "FuzzyTripInformationFound": 'storeFuzzyTripInformation'

module.exports = RouteInformationStore