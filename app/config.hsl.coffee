CONFIG = process.env.CONFIG or 'hsl'
API_URL = process.env.API_URL or 'http://dev.reittiopas.fi'
APP_PATH = process.env.APP_CONTEXT or ''
PIWIK_ADDRESS = process.env.PIWIK_ADDRESS or ''
PIWIK_ID = process.env.PIWIK_ID or ''
SENTRY_DSN = process.env.SENTRY_DSN or ''
PORT = process.env.PORT or 8080

module.exports =
  PIWIK_ADDRESS: "#{PIWIK_ADDRESS}"
  PIWIK_ID: "#{PIWIK_ID}"
  SENTRY_DSN: "#{SENTRY_DSN}"
  PORT: PORT
  CONFIG: "#{CONFIG}"
  URL:
    API_URL: "#{API_URL}"
    MAP: "#{API_URL}/hsl-map/"
    OTP: "#{API_URL}/otp/routers/hsl/"
    STOP_MAP: "#{API_URL}/hsl-stop-map/"
    MQTT: "ws://213.138.147.225:1883"
    ALERTS: "#{API_URL}/hsl-alert/"
    FONT: "http://fonts.googleapis.com/css?family=Nunito:300,400,700%7COpen+Sans+Condensed:300,700"
    REALTIME: "#{API_URL}/navigator-server"
    PELIAS: "#{API_URL}/pelias/v1/search"
    PELIAS_REVERSE_GEOCODER: "#{API_URL}/pelias/v1/reverse"
  APP_PATH: "#{APP_PATH}"
  title: "Reittiopas.fi"
  preferredAgency: "HSL"
  searchParams:
    "boundary.rect.min_lat": 59.9
    "boundary.rect.max_lat": 60.45
    "boundary.rect.min_lon": 24.3
    "boundary.rect.max_lon": 25.5
  nearbyRoutes:
    radius: 2000
    bucketSize: 100
  maxWalkDistance: 2500
  maxBikingDistance: 10000
  itinerary:
    # How long vehicle should be late in order to mark it delayed. Measured in seconds.
    delayThreshold: 180
    # Wait time to show "wait leg"? e.g. 180 means over 3 minutes are shown as wait time. Measured in seconds.
    waitThreshold: 180
  initialLocation:
    zoom: 11
    lat: 60.17332
    lon: 24.94102
  nearestStopDistance:
    maxShownDistance: 5000
  map:
    useRetinaTiles: true
  # Let Pelias suggest based on current user location
  locationAwareSuggestions: false
  showCityBikes: true
  # Lowest level when stop or terminal markers are rendered at all
  stopsMinZoom: 15
  # Highest level when stops and terminals are still rendered as small markers
  stopsSmallMaxZoom: 15
  # Highest level when terminals are still rendered instead of individual stops
  terminalStopsMaxZoom: 17
  colors:
    primary: "#007ac9"
  socialMedia:
    title: "Uusi Reittiopas"
    description: "HSL:n Reittiopas.fi uudistuu. Apuasi kaivataan kehitystyössä. Tule palvelun testaajaksi tai tee siitä saman tien parempi."
