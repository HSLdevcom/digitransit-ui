module.exports =
  click: (actionContext, details,b) ->
    console.log(details, b)
    actionContext.dispatch "click", details
