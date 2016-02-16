module.exports =
  'openOriginSearch': (actionContext, params) ->
    actionContext.dispatch "OpenSearch",
      "actionTarget": "origin"
      "position": params.position
      "placeholder": params.placeholder

  'openDestinationSearch': (actionContext, params) ->
    actionContext.dispatch "OpenSearch",
      "actionTarget": "destination"
      "position": params.position
      "placeholder": params.placeholder

  'openSearchWithCallback': (actionContext, params) ->
    actionContext.dispatch "OpenSearch",
      "action": params.callback
      "position": params.position
      "placeholder": params.placeholder

  'closeSearch': (actionContext) ->
    actionContext.dispatch "CloseSearch"
