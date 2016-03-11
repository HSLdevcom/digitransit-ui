module.exports.openOriginSearch = (actionContext, params) ->
  actionContext.dispatch 'OpenSearch',
    'actionTarget': 'origin'
    'position': params.position
    'placeholder': params.placeholder

module.exports.openDestinationSearch = (actionContext, params) ->
  actionContext.dispatch 'OpenSearch',
    'actionTarget': 'destination'
    'position': params.position
    'placeholder': params.placeholder

module.exports.openSearchWithCallback = (actionContext, params) ->
  actionContext.dispatch 'OpenSearch',
    'action': params.callback
    'position': params.position
    'placeholder': params.placeholder

module.exports.saveSearch = (actionContext, endpoint) ->
  actionContext.dispatch 'SaveSearch', endpoint

module.exports.closeSearch = (actionContext) ->
  actionContext.dispatch 'CloseSearch'
