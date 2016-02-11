endpointActions = require './endpoint-actions'

module.exports =
  'openOriginSearch': (actionContext) ->
    actionContext.dispatch "OpenSearch",
    "action": endpointActions.setOrigin

  'openDestinationSearch': (actionContext, position) ->
    actionContext.dispatch "OpenSearch",
      "action": endpointActions.setDestination
      "position": position

  'closeSearch': (actionContext) ->
    actionContext.dispatch "CloseSearch"
