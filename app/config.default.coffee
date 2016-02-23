CONFIG = process.env.CONFIG or 'default'
API_URL = process.env.API_URL or 'http://dev.digitransit.fi'
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
    OTP: "#{API_URL}/otp/routers/finland/"
    MAP: "#{API_URL}/hsl-map/"
    STOP_MAP: "#{API_URL}/finland-stop-map/"
    MQTT: "ws://213.138.147.225:1883"
    ALERTS: "#{API_URL}/hsl-alert/"
    FONT: "http://fonts.googleapis.com/css?family=Lato:300,400,900%7CPT+Sans+Narrow:400,700"
    REALTIME: "#{API_URL}/navigator-server"
    PELIAS: "#{API_URL}/pelias/v1/autocomplete"
    PELIAS_REVERSE_GEOCODER: "#{API_URL}/pelias/v1/reverse"
  APP_PATH: "#{APP_PATH}"
  title: "Matka.fi"
  searchParams: {}
  nearbyRoutes:
    radius: 10000
    bucketSize: 1000
  maxWalkDistance: 10000
  maxBikingDistance: 40000
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
    tileSize: 512
    zoomOffset: -1
  autoSuggest:
    sortOrder: currentPosition: 1, oldSearch: 2, locality: 3, address: 4, stop: 5
    sortOthers: 6
    # Let Pelias suggest based on current user location
    locationAware: false
  showCityBikes: false
  # Lowest level when stop or terminal markers are rendered at all
  stopsMinZoom: 15
  # Highest level when stops and terminals are still rendered as small markers
  stopsSmallMaxZoom: 15
  # Highest level when terminals are still rendered instead of individual stops
  terminalStopsMaxZoom: 17
  colors:
    primary: "#fff"
  disruption:
    showInfoButton: true
  socialMedia:
    title: "Uusi Matka.fi"
    description: "Liikenneviraston Matka.fi uudistuu. Apuasi kaivataan kehitystyössä. Tule palvelun testaajaksi tai tee siitä saman tien parempi."
  #Ticket information feature toggle
  showTicketInformation: false
  # Control what transport modes that should be possible to select in the UI
  # and whether the transport mode is used in trip planning by default.
  transportModes:
    bus:
      availableForSelection: true
      defaultValue: true
    tram:
      availableForSelection: true
      defaultValue: true
    rail:
      availableForSelection: true
      defaultValue: true
    subway:
      availableForSelection: true
      defaultValue: true
    citybike:
      availableForSelection: true
      defaultValue: false
    airplane:
      availableForSelection: true
      defaultValue: true
    ferry:
      availableForSelection: true
      defaultValue: true
