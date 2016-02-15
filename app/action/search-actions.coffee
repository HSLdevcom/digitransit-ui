endpointActions = require './endpoint-actions'

module.exports =
  'openOriginSearch': (actionContext, params) ->
    actionContext.dispatch "OpenSearch",
      "action": endpointActions.setOrigin
      "position": params.position
      "placeholder": params.placeholder

  'openDestinationSearch': (actionContext, params) ->
    actionContext.dispatch "OpenSearch",
      "action": endpointActions.setDestination
      "position": params.position
      "placeholder": params.placeholder

  'closeSearch': (actionContext) ->
    actionContext.dispatch "CloseSearch"
