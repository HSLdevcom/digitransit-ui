module.exports.setSelectedTime = (actionContext, data) ->
  actionContext.dispatch 'SetSelectedTime', data

module.exports.setArriveBy = (actionContext, data) ->
  actionContext.dispatch 'SetArriveBy', data

module.exports.unsetSelectedTime = (actionContext) ->
  actionContext.dispatch 'UnsetSelectedTime'
