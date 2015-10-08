module.exports = setLanguage: (actionContext, language) ->
  actionContext.dispatch "SetLanguage", language
