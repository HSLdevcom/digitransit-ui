XhrPromise       = require '../util/xhr-promise'
config           = require '../config'
debounce         = require 'lodash/debounce'
sortBy           = require 'lodash/sortBy'
uniqWith         = require 'lodash/uniqWith'
orderBy          = require 'lodash/orderBy'
take             = require 'lodash/take'
SuggestionUtils  = require '../util/suggestion-utils'
geoUtils         = require '../util/geo-utils'

processResults = (actionContext, result) ->
  actionContext.dispatch 'SuggestionsResult',
    result

module.exports.openSearchWithCallback = (actionContext, params) ->
  actionContext.dispatch 'OpenSearch',
    'action': params.callback
    'placeholder': params.placeholder

module.exports.saveSearch = (actionContext, endpoint) ->
  actionContext.dispatch 'SaveSearch', endpoint

module.exports.closeSearch = (actionContext) ->
  actionContext.dispatch 'CloseSearch'

sort = (features) ->
  sortBy features, (feature) ->
    config.autoSuggest.sortOrder[feature.properties.layer] || config.autoSuggest.sortOthers

uniq = (features) ->
  uniqWith features, (feat1, feat2) ->
    SuggestionUtils.getLabel(feat1.properties) == SuggestionUtils.getLabel(feat2.properties) # or perhaps coords instead?

addCurrentPositionIfEmpty = (features) ->
  if features.length == 0
    features.push currentLocation
  features

# Filters given list and returns only elements that match with given input
filterMatchingToInput = (list, input) ->
  if input?.length >= 0
    return list.filter (item) ->
      item.address?.toLowerCase().indexOf(input.toLowerCase()) > -1 ||
      item.locationName?.toLowerCase().indexOf(input.toLowerCase()) > -1
  else
    return list

currentLocation =
  type: "CurrentLocation", properties:
    labelId: "own-position"
    layer: "currentPosition"

addOldSearches = (oldSearches, features, input) ->
  matchingOldSearches = filterMatchingToInput(oldSearches, input)
  results = take(matchingOldSearches, 10).map (item) ->
    type: "OldSearch"
    properties:
      label: item.address
      layer: 'oldSearch'
    geometry: item.geometry
  features.concat results

addFavouriteLocations = (favourites, features, input) ->
  matchingFavourites = orderBy(filterMatchingToInput(favourites, input), (f) => f.locationName)
  results = matchingFavourites.map (item) ->
    type: "Favourite"
    properties:
      label: item.locationName
      layer: 'favourite'
    geometry:
      type: "Point"
      coordinates: [item.lon, item.lat]

  features.concat results

getGeocodingResult = (input, geolocation) ->
  if input == undefined or input == null or input.trim().length < 3
    return Promise.resolve []

  if config.autoSuggest.locationAware && geolocation.hasLocation
    opts = Object.assign text: input, config.searchParams, "focus.point.lat": geolocation.lat, "focus.point.lon": geolocation.lon
  else
    opts = Object.assign text: input, config.searchParams

  return XhrPromise.getJson(config.URL.PELIAS, opts).then (res) -> res.features


queryGraphQL = (q, opts, converter) ->
  payload = JSON.stringify (query:q, variables:null)
  return XhrPromise.postJson(config.URL.OTP + "index/graphql", opts, payload).then (res) -> converter(res)

getStopsdataPromise = (input) ->
  queryGraphQL("{stops(name:\"" + input + "\") {gtfsId lat lon name}}", undefined, (d) ->
    "type": "stops", data:d.data.stops)
  .then (res) ->
    res.data.map (item) ->
      type: "Stop"
      properties:
        label: item.name
        layer: 'stop'
        link: '/pysakit/' + item.gtfsId
      geometry:
        coordinates: [item.lon, item.lat]

getRouteDataPromise = (input) ->
  queryGraphQL("{routes(name:\"" + input + "\") {patterns {code} agency {name} shortName type longName}}", undefined, (d) ->
    "type": "routes", data:d.data.routes)
  .then (res) ->
    console.log("data before map", res)
    res.data.map (item) ->
      type: "Route"
      agency: item.agency
      properties:
        label: item.shortName + " " + item.longName
        layer: 'route-' + item.type
        link: '/linjat/' + item.patterns[0].code
      geometry:
        coordinates = [item.lat, item.lon]
  .then (suggestions) ->
    sortBy(suggestions, (item) -> ['item.agency.name', 'item.properties.label'])

sortByDistance = (stops, reference) ->
  stops

endpointGTFSSearch = (input, reference) ->
  if input == undefined or input == null or input.trim().length < 2
    return Promise.resolve []

  getStopsdataPromise(input).then((input) ->
    console.log("gtfs search:", input)
    input)

commonGTFSSearch = (input, reference) ->
  if input == undefined or input == null or input.trim().length < 2
    return Promise.resolve []

  isNumber = input.match(/^\d+$/) != null

  if isNumber
    lnLen = input.match(/^\d+$/).length
    if lnLen <= 3
      #   4 = linjat alkaen 4*
      #  40 = linjat alkaen 40*
      # 404 = linjat alkaen 404*
      getRouteDataPromise input
    else
     #pysäkkihaku
      getStopsdataPromise input
  else
    #pysäkki + linjahaku jos pidempi kuin 2 merkkiä
    Promise.all([getStopsdataPromise(input), getRouteDataPromise(input)])
      .then (results) ->
        results[0].concat(results[1])

#query gtfs data
getGraphResults = (input, type, reference) ->
  isEndpoint = type == 'endpoint'

  if isEndpoint
    endpointGTFSSearch input, reference
  else
    commonGTFSSearch input, reference

executeSearch = (actionContext, params) ->
  processResults(actionContext, [])
  {input, type} = params
  console.log "search q:", input, type
  geoLocation = actionContext.getStore('PositionStore').getLocationState()
  referenceLocation = if geoLocation.hasLocation then {lon: geoLocation.lon, lat: geoLocation.lat} else console.log("no location, what's the reference?")

  #endpoint
  if type == 'endpoint'
    favouriteLocations = actionContext.getStore("FavouriteLocationStore").getLocations()
    oldSearches = actionContext.getStore("OldSearchesStore").getOldSearches()
    console.log "endpointsearch"
    Promise.all([getGeocodingResult(input, geoLocation), getGraphResults(input, params.type)])
    .then (result) ->
      result[0].concat(result[1])
    .then addCurrentPositionIfEmpty
    .then (suggestions) -> addFavouriteLocations(favouriteLocations, suggestions, input)
    .then (suggestions) -> addOldSearches(oldSearches, suggestions, input)
    .then sort
    .then uniq
    .then (suggestions) ->
      processResults actionContext, suggestions
    .catch (e) ->
      console.error("error occurred", e)

  else
    console.log("common search")
    favouriteRoutes = actionContext.getStore("FavouriteRoutesStore").getRoutes()
    # todo fetch data
    getGraphResults(input, type)
    .then uniq
    .then (suggestions) ->
      processResults actionContext, suggestions
    .catch (e) ->
      console.error("error occurred", e)

search =
  debounce(executeSearch, 300)

module.exports.executeSearch = (actionContext, input) ->
  search(actionContext, input)

