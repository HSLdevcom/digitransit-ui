SERVER_ROOT = process.env.SERVER_ROOT or "http://matka.hsl.fi"
module.exports =
  URL:
    SERVER_ROOT: SERVER_ROOT
    OTP: "#{SERVER_ROOT}/otp/routers/finland/"
    GEOCODER: "#{SERVER_ROOT}/geocoder/"
    MAP: "#{SERVER_ROOT}/hsl-map/"
    MQTT: "ws://213.138.147.225:1883"
    ALERTS: "#{SERVER_ROOT}/hsl-alert/"
    FONT: "http://fonts.googleapis.com/css?family=Nunito:300,400,700%7COpen+Sans+Condensed:300,700"
    REALTIME: "#{SERVER_ROOT}/navigator-server"
    PELIAS: "#{SERVER_ROOT}/pelias/v1/search"
  ROOT_PATH: process.env.ROOT_PATH or ''
  title: "Digitransit (HSL)"
  cities: ["helsinki", "vantaa", "espoo", "kauniainen", "kerava", "kirkkonummi", "sipoo"]
  icon: "hsl-icon.png"
  preferredAgency: "HSL"
  searchParams:
    "boundary.rect.min_lat": 59.9
    "boundary.rect.max_lat": 60.45
    "boundary.rect.min_lon": 24.3
    "boundary.rect.max_lon": 25.5
  pelias:
    useNeighbourhood: false
  nearbyRoutes:
    radius: 2000
    bucketSize: 100
  maxWalkDistance: 2500
  nearestStopDistance:
    maxShownDistance: 5000
  itinerary:
    delayThreshold: 180
  initialLocation:
    zoom: 11
    lat: 60.17332
    lon: 24.94102
