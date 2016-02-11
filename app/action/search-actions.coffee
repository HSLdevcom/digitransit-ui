endpointActions = require './endpoint-actions'

openOriginSearch = (actionContext) ->
  actionContext.dispatch "OpenSearch",
    "action": endpointActions.setOrigin

openDestinationSearch = (actionContext) ->
  actionContext.dispatch "OpenSearch",
    "action": endpointActions.setDestination

module.exports =
  'openOriginSearch': openOriginSearch
  'openDestinationSearch': openDestinationSearch
  'closeSearch': (actionContext) ->
    console.log("dispatching CloseSearch")
    actionContext.dispatch "CloseSearch"
