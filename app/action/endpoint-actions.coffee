xhrPromise = require '../util/xhr-promise'
executeMultiple = require 'fluxible-action-utils/async/executeMultiple'
config        = require '../config'

setOrigin = (actionContext, location, done) ->
  actionContext.dispatch "setOrigin",
    lat: location.lat
    lon: location.lon
    address: location.address

setDestination = (actionContext, location, done) ->
  actionContext.dispatch "setDestination",
    lat: location.lat
    lon: location.lon
    address: location.address

setOriginToCurrent = (actionContext, done) ->
  actionContext.dispatch "setOriginToCurrent",

setDestinationToCurrent = (actionContext, done) ->
  actionContext.dispatch "setDestinationToCurrent",

clearOrigin = (actionContext, done) ->
  actionContext.dispatch "clearOrigin",

clearDestination = (actionContext, done) ->
  actionContext.dispatch "clearDestination",

module.exports =
  'setOrigin': setOrigin
  'setDestination': setDestination
  'setOriginToCurrent': setOriginToCurrent
  'setDestinationToCurrent': setDestinationToCurrent
  'clearOrigin': clearOrigin
  'clearDestination': clearDestination
