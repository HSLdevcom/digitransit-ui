module.exports = setCurrentTime: (actionContext, data) ->
  actionContext.dispatch 'SetCurrentTime',
    'date': data.date
    'hour': data.hour
    'minute': data.minute
