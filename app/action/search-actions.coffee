endpointActions = require './endpoint-actions'

module.exports =
  'openOriginSearch': (actionContext, position) ->
    actionContext.dispatch "OpenSearch",
      "action": endpointActions.setOrigin
      "position": position

  'openDestinationSearch': (actionContext, position) ->
    actionContext.dispatch "OpenSearch",
      "action": endpointActions.setDestination
      "position": position

  'closeSearch': (actionContext) ->
    actionContext.dispatch "CloseSearch"
