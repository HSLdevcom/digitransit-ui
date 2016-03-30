XhrPromise       = require '../util/xhr-promise'
config           = require '../config'
debounce         = require 'lodash/debounce'
orderBy          = require 'lodash/orderBy'
sortBy           = require 'lodash/sortBy'
uniqWith         = require 'lodash/uniqWith'
takeRight        = require 'lodash/takeRight'
SuggestionUtils  = require '../util/suggestion-utils'


processResults = (actionContext, result) ->
  actionContext.dispatch 'SuggestionsResult',
    result

module.exports.openOriginSearch = (actionContext, params) ->
  actionContext.dispatch 'OpenSearch',
    'actionTarget': 'origin'
    'position': params.position
    'placeholder': params.placeholder

module.exports.openDestinationSearch = (actionContext, params) ->
  actionContext.dispatch 'OpenSearch',
    'actionTarget': 'destination'
    'position': params.position
    'placeholder': params.placeholder

module.exports.openSearchWithCallback = (actionContext, params) ->
  actionContext.dispatch 'OpenSearch',
    'action': params.callback
    'position': params.position
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

currentLocation =
  type: "CurrentLocation", properties:
    labelId: "own-position"
    layer: "currentPosition"

addOldSearches = (oldSearches, features, input) ->
  if input?.length >= 0
    matchingOldSearches = oldSearches.filter (search) -> search.address.toLowerCase().indexOf(input.toLowerCase()) > -1
  else
    matchingOldSearches = oldSearches

  results = takeRight(matchingOldSearches, 10).map (item) ->
    type: "OldSearch"
    properties:
      label: item.address
      layer: 'oldSearch'
    geometry: item.geometry
  features.concat results

getPeliasDataOrEmptyArray = (input, geolocation) ->
  if input == undefined or input == null or input.trim().length < 3
    return Promise.resolve []

  if config.autoSuggest.locationAware && geolocation.hasLocation
    opts = Object.assign text: input, config.searchParams, "focus.point.lat": geolocation.lat, "focus.point.lon": geolocation.lon
  else
    opts = Object.assign text: input, config.searchParams

  return XhrPromise.getJson(config.URL.PELIAS, opts).then (res) -> res.features

directGeocode = (actionContext, input) ->
  geoLocation = actionContext.getStore('PositionStore').getLocationState()
  oldSearches = actionContext.getStore("OldSearchesStore").getOldSearches()
  getPeliasDataOrEmptyArray(input, geoLocation)
  .then addCurrentPositionIfEmpty
  .then (suggestions) -> addOldSearches(oldSearches, suggestions, input)
  .then sort
  .then uniq
  .then (suggestions) ->
    processResults actionContext, suggestions
  .catch (e) ->
    console.error("error occurred", e)

geocode =
  debounce(directGeocode, 400)

#used by the modal
module.exports.executeSearch = (actionContext, input) ->
  geocode(actionContext, input)
