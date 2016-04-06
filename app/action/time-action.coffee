module.exports.setSelectedTime = (actionContext, data) ->
  actionContext.dispatch 'SetSelectedTime', data

module.exports.setArriveBy = (actionContext, data) ->
  actionContext.dispatch 'SetArriveBy', data

module.exports.setArrivalTime = (actionContext, data) ->
  actionContext.dispatch 'SetArrivalTime', data

module.exports.setDepartureTime = (actionContext, data) ->
  actionContext.dispatch 'SetDepartureTime', data

module.exports.unsetSelectedTime = (actionContext) ->
  actionContext.dispatch 'UnsetSelectedTime'
