Fluxible = require 'fluxible'

app = new Fluxible(
  component: require './routes.cjsx')

app.registerStore require './store/service-store'
app.registerStore require './store/favourite-routes-store'
app.registerStore require './store/favourite-stops-store'
app.registerStore require './store/endpoint-store'
app.registerStore require './store/itinerary-search-store'
app.registerStore require './store/position-store'
app.registerStore require './store/real-time-information-store'
app.registerStore require './store/time-store'
app.registerStore require './store/preferences-store'
app.registerStore require './store/mode-store'
app.registerStore require './store/not-implemented-store'
app.registerStore require './store/city-bike-store'
app.registerStore require './store/feedback-store'
app.registerStore require './store/favourite-location-store'
app.registerStore require './store/search-store'

module.exports = app
