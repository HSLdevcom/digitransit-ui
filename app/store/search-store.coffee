Store         = require 'fluxible/addons/BaseStore'
localStorage  = require './local-storage'
config        = require '../config'
XhrPromise    = require '../util/xhr-promise'
{sortBy}      = require 'lodash/collection'
{FormattedMessage} = require 'react-intl'

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
              config.autoSuggest.sortOrder[feature.properties.layer] || config.autoSuggest.sortOthers
          )

          cb(features)
    else
      #empty search, add default content
      cb([currentLocation()])

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
