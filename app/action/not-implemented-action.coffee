module.exports =
  click: (actionContext, feature) ->
    console.log("featureName", feature, " clicked")
    actionContext.dispatch "click", feature
