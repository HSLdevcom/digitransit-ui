xhrPromise = require '../util/xhr-promise'
config     = require '../config'


cityBikeSearchRequest = (actionContext, options, done) =>

  xhrPromise.getJson(config.URL.OTP + "bike_rental").then((data) ->
    actionContext.dispatch "CityBikeStationsFound", data
    done()
  , (err) ->
    console.error("Failed to perform cityBikeStations search!", err)
    done()
  )

module.exports =
  'cityBikeSearchRequest': cityBikeSearchRequest
