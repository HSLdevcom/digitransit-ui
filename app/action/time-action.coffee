module.exports =
  setCurrentTime: (actionContext, data) ->
    actionContext.dispatch 'SetCurrentTime', data
  unsetCurrentTime: (actionContext, data) ->
    actionContext.dispatch 'UnsetCurrentTime'
