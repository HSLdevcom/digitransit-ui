$             = require 'jquery'

serialize = (obj, prefix) ->
  str = []
  for p of obj
    if obj.hasOwnProperty p
      k = if prefix then prefix + "[" + p + "]" else p
      v = obj[p]
      str.push(if typeof v == "object" then serialize(v, k) else encodeURIComponent(k) + "=" + encodeURIComponent(v))
  str.join "&"


module.exports = routeSearchRequest: (actionContext, options, done) ->
  $.getJSON "http://matka.hsl.fi/otp/routers/finland" + "/plan?" + serialize(options)
  , (data) ->
    actionContext.dispatch "RouteFound", data
    done()