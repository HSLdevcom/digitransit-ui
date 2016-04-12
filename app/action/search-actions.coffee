XhrPromise       = require '../util/xhr-promise'
config           = require '../config'
debounce         = require 'lodash/debounce'
sortBy           = require 'lodash/sortBy'
uniqWith         = require 'lodash/uniqWith'
orderBy          = require 'lodash/orderBy'
take             = require 'lodash/take'
get              = require 'lodash/get'
SuggestionUtils  = require '../util/suggestion-utils'
geoUtils         = require '../util/geo-utils'

processResults = (actionContext, result) ->
  actionContext.dispatch 'SuggestionsResult',
    result

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
filterMatchingToInput = (list, input, fields) ->
  if input?.length >= 0
    return list.filter (item) ->
      parts = fields.map (pName) -> get(item, pName)
      test = parts.join(' ').toLowerCase()
      test.indexOf(input.toLowerCase()) > -1
  else
    return list

currentLocation =
  type: "CurrentLocation", properties:
    labelId: "own-position"
    layer: "currentPosition"

addOldSearches = (oldSearches, features, input) ->
  matchingOldSearches = filterMatchingToInput(oldSearches, input, ["address", "locationName"])
  results = take(matchingOldSearches, 10).map (item) ->
    type: "OldSearch"
    properties:
      label: item.address
      layer: 'oldSearch'
    geometry: item.geometry
  features.concat results

addFavouriteLocations = (favourites, features, input) ->
  matchingFavourites = orderBy(filterMatchingToInput(favourites, input, ["address", "locationName"]), (f) => f.locationName, )
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


queryGraphQL = (q, opts) ->
  payload = JSON.stringify (query: q, variables: null)
  return XhrPromise.postJson(config.URL.OTP + "index/graphql", opts, payload)

mapRoutes = (res) ->
  if res
    res.map (item) ->
      type: "Route"
      agency: item.agency
      properties:
        label: item.shortName + " " + item.longName
        layer: 'route-' + item.type
        link: '/linjat/' + item.patterns[0].code
      geometry:
        coordinates:
          [item.lat, item.lon]
  else
    []

getStops = (res) ->
  if res
    res.map (item) ->
      stop =
        type: "Stop"
        properties:
          code: item.code
          label: item.name
          layer: 'stop'
          link: '/pysakit/' + item.gtfsId
        geometry:
          coordinates:
            [item.lon, item.lat]

      if item.code
        stop.properties.label = stop.properties.label + ", " + item.code

      stop
  else
    []

searchStops = (input, reference) ->
  if input == undefined or input == null or input.trim().length < 3
    return Promise.resolve []

  queryGraphQL('{' + 'stops(name:"' + input + '") {gtfsId lat lon name code}' + '}').then (response) ->
    getStops(response?.data?.stops)

searchRoutesAndStops = (input, reference, favourites) ->
  searches = []
  fav = favourites.map (f) -> '"' + f + '"'
  searches.push('favouriteRoutes:routes(ids:[' + fav.join(',') + ']) {patterns {code} agency {name} shortName type longName}')

  if input != undefined &&  input != null and input.trim().length > 0
    doRouteSearch = doStopSearch = false

    #dumb quess on what the user is trying to do
    isNumber = input.match(/^\d+$/) != null
    if isNumber
      lnLen = input.match(/^\d+$/)[0].length
      if lnLen <= 3
        doRouteSearch = true

      if lnLen == 4
        doStopSearch = true
    else
      doRouteSearch = doStopSearch = true

  if doRouteSearch then searches.push 'routes(name:"' + input + '") {patterns {code} agency {name} shortName type longName}'
  if doStopSearch then searches.push 'stops(name:"' + input + '") {gtfsId lat lon name code}'

  if searches.length > 0
    suggestions = []
    refLatLng = geoUtils.getLatLng(reference.lat, reference.lon)
    return queryGraphQL('{' + searches.join(' ') + '}').then (response) ->

      favouriteRoutes = mapRoutes(response?.data?.favouriteRoutes).map (favourite) ->
        favourite.properties.layer = 'favourite'
        favourite.type= "Favourite"
        favourite
      [].concat sortBy(favouriteRoutes, (item) -> ['agency.name', 'properties.label'])
      .concat sortBy(mapRoutes(response?.data?.routes), (item) -> ['agency.name', 'properties.label'])
      .concat sortBy(getStops(response?.data?.stops), (item) ->
        stopPos = geoUtils.getLatLng(item.geometry.coordinates[1], item.geometry.coordinates[0])
        Math.round(stopPos.distanceTo(refLatLng) / 50000)) #50km buckets

  else
    Promise.resolve []

executeSearch = (actionContext, params) ->
  processResults(actionContext, [])
  {input, type} = params
  geoLocation = actionContext.getStore('PositionStore').getLocationState()
  origin = actionContext.getStore('EndpointStore').getOrigin()

  if origin.lat
    referenceLocation = {lon: origin.lon, lat: origin.lat}
  else
    referenceLocation = if geoLocation.hasLocation then {lon: geoLocation.lon, lat: geoLocation.lat} else {lon: config.initialLocation.lon, lat: config.initialLocation.lat}

  #endpoint
  if type == 'endpoint'
    favouriteLocations = actionContext.getStore("FavouriteLocationStore").getLocations()
    oldSearches = actionContext.getStore("OldSearchesStore").getOldSearches("endpoint")
    Promise.all([getGeocodingResult(input, geoLocation), searchStops (input)])
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
    favouriteRoutes = actionContext.getStore("FavouriteRoutesStore").getRoutes()
    searchRoutesAndStops(input, referenceLocation, favouriteRoutes)
    .then uniq
    .then (suggestions) ->
      take(filterMatchingToInput(suggestions, input, ["properties.label","properties.code"]), 20)
    .then (suggestions) ->
      processResults actionContext, suggestions
    .catch (e) ->
      console.error("error occurred", e)

search =
  debounce(executeSearch, 300)

module.exports.executeSearch = (actionContext, input) ->
  search(actionContext, input)
