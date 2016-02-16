Store         = require 'fluxible/addons/BaseStore'
localStorage  = require './local-storage'
config        = require '../config'
XhrPromise    = require '../util/xhr-promise'
{sortBy}      = require 'lodash/collection'

class SearchStore extends Store
  @storeName: 'SearchStore'

  @action = undefined
  @position = undefined
  @placeholder = undefined

  constructor: (dispatcher) ->
    super(dispatcher)
    @modalOpen = false

  isModalOpen: () ->
    @modalOpen

  getAction: () ->
    @action

  getPlaceholder: () ->
    @placeholder

  getPosition: () ->
    @position

  getSuggestions: (input, geoLocation, cb) ->
    if input != undefined and input != null && input.trim() != ""
      if config.autoSuggest.locationAware && geolocation.hasLocation
        opts = Object.assign(text: input, config.searchParams, "focus.point.lat": geolocation.lat, "focus.point.lon": geolocation.lon)
      else
        opts = Object.assign(text: input, config.searchParams)

      XhrPromise.getJson(config.URL.PELIAS, opts).then (res) =>
        features = res.features

        if config.autoSuggest?
          features = sortBy(features,
            (feature) ->
              config.autoSuggest.sortOrder[feature.properties.layer] || config.autoSuggest.sortOther
          )
          cb(features)
    else
      cb([])

  openSearch: (props) ->
    @modalOpen = true
    @action = props.action
    @position = props.position
    @placeholder = props.placeholder
    @emitChange(props)

  closeSearch: () ->
    @modalOpen = false
    @action = undefined
    @position = undefined
    @placeholder = undefined
    @emitChange()

  @handlers:
    "OpenSearch": 'openSearch'
    "CloseSearch": 'closeSearch'

module.exports = SearchStore
