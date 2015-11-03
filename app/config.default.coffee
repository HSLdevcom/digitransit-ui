SERVER_ROOT = process.env.SERVER_ROOT or "http://beta.digitransit.fi"
module.exports =
  URL:
    SERVER_ROOT: SERVER_ROOT
    OTP: "#{SERVER_ROOT}/otp/routers/finland/"
    GEOCODER: "#{SERVER_ROOT}/geocoder/"
    MAP: "#{SERVER_ROOT}/hsl-map/"
    MQTT: "ws://213.138.147.225:1883"
    ALERTS: "#{SERVER_ROOT}/hsl-alert/"
    FONT: "http://fonts.googleapis.com/css?family=Lato:300,400,900%7CPT+Sans+Narrow:400,700"
    REALTIME: "#{SERVER_ROOT}/navigator-server"
    PELIAS: "#{SERVER_ROOT}/pelias/v1/autocomplete"
  ROOT_PATH: process.env.ROOT_PATH or ''
  title: "Digitransit"
  cities: []
  searchParams: {}
  pelias:
    useNeighbourhood: true
  nearbyRoutes:
    radius: 10000
    bucketSize: 1000
  maxWalkDistance: 10000
  nearestStopDistance:
    maxShownDistance: 5000
  itinerary:
    delayThreshold: 180
  nearestStopDistance:
    maxShownDistance: 5000
