Fluxible = require 'fluxible'

app = new Fluxible
    component: require './routes.cjsx'

app.registerStore require('./store/favourite-stops-store')
app.registerStore require('./store/location-store')
app.registerStore require('./store/nearest-stops-store')
app.registerStore require('./store/stop-departures-store')
app.registerStore require('./store/time-store')

module.exports = app;