module.exports =
  setSelectedTime: (actionContext, data) ->
    actionContext.dispatch 'SetSelectedTime', data
  setArriveBy: (actionContext, data) ->
    actionContext.dispatch 'SetArriveBy', data
  unsetSelectedTime: (actionContext, data) ->
    actionContext.dispatch 'UnsetSelectedTime'
