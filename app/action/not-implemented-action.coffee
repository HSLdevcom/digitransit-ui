module.exports.click = (actionContext, feature) ->
  actionContext.dispatch "openNotImplemented", feature

module.exports.close = (actionContext) ->
  actionContext.dispatch "closeNotImplemented"
