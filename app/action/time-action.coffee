module.exports =
  setCurrentTime: (actionContext, data) ->
    actionContext.dispatch 'SetCurrentTime', data
  setArriveBy: (actionContext, data) ->
    actionContext.dispatch 'SetArriveBy', data
  unsetCurrentTime: (actionContext, data) ->
    actionContext.dispatch 'UnsetCurrentTime'
