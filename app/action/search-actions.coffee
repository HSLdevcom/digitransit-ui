endpointActions = require './endpoint-actions'

module.exports =
  'openOriginSearch': (actionContext) ->
    actionContext.dispatch "OpenSearch",
    "action": endpointActions.setOrigin
  'openDestinationSearch': (actionContext) ->
    actionContext.dispatch "OpenSearch",
    "action": endpointActions.setDestination
  'closeSearch': (actionContext) ->
    actionContext.dispatch "CloseSearch"
