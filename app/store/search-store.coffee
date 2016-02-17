Store         = require 'fluxible/addons/BaseStore'
localStorage  = require './local-storage'
config        = require '../config'
XhrPromise    = require '../util/xhr-promise'
{sortBy}      = require 'lodash/collection'
{FormattedMessage} = require 'react-intl'
q             = require 'q'

class SearchStore extends Store
  @storeName: 'SearchStore'

  @actionTarget = undefined
  @position = undefined
  @placeholder = undefined

  currentLocation = () ->
    return type: "CurrentLocation", properties:
      labelId: "own-position"
      layer: "currentPosition"

  constructor: (dispatcher) ->
    super(dispatcher)
    @modalOpen = false

  isModalOpen: () ->
    @modalOpen

  getActionTarget: () ->
    @actionTarget

  getPlaceholder: () ->
    @placeholder

  getPosition: () ->
    @position

  sort = (features) ->
    sortBy(features,
      (feature) ->
        console.log(feature)
        config.autoSuggest.sortOrder[feature.properties.layer] || config.autoSuggest.sortOthers
    )

  addCurrentPositionIfEmpty = (features) =>
    if features.length == 0
      features.push currentLocation()
    features

  getPeliasDataOrEmptyArray = (input) ->
    deferred = q.defer()
    if input == undefined or input == null or input.trim() == ""
      deferred.resolve []
      return deferred.promise

    if config.autoSuggest.locationAware && geolocation.hasLocation
      opts = Object.assign(text: input, config.searchParams, "focus.point.lat": geolocation.lat, "focus.point.lon": geolocation.lon)
    else
      opts = Object.assign(text: input, config.searchParams)

    XhrPromise.getJson(config.URL.PELIAS, opts).then (res) ->
      deferred.resolve res.features

    deferred.promise

  getSuggestions: (input, geoLocation, cb) =>
    getPeliasDataOrEmptyArray(input)
    .then sort
    .then addCurrentPositionIfEmpty
    .then (suggestions) ->
      cb(suggestions)

  openSearch: (props) ->
    @modalOpen = true
    @actionTarget = props.actionTarget
    @position = props.position
    @placeholder = props.placeholder
    @emitChange(props)

  closeSearch: () ->
    @modalOpen = false
    @actionTarget = undefined
    @position = undefined
    @placeholder = undefined
    @emitChange()

  @handlers:
    "OpenSearch": 'openSearch'
    "CloseSearch": 'closeSearch'

module.exports = SearchStore
