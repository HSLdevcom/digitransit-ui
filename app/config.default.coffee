SERVER_ROOT = process.env.SERVER_ROOT or "http://beta.digitransit.fi"
module.exports =
  URL:
    SERVER_ROOT: SERVER_ROOT
    OTP: "#{SERVER_ROOT}/otp/routers/finland/"
    MAP: "#{SERVER_ROOT}/hsl-map/"
    MQTT: "ws://213.138.147.225:1883"
    ALERTS: "#{SERVER_ROOT}/hsl-alert/"
    FONT: "http://fonts.googleapis.com/css?family=Lato:300,400,900%7CPT+Sans+Narrow:400,700"
    REALTIME: "#{SERVER_ROOT}/navigator-server"
    PELIAS: "#{SERVER_ROOT}/pelias/v1/autocomplete"
    PELIAS_REVERSE_GEOCODER: "#{SERVER_ROOT}/pelias/v1/reverse"
  ROOT_PATH: process.env.ROOT_PATH or ''
  title: "Digitransit"
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
  autoSuggest:
    sortOrder: locality: 1, address: 2, stop: 3
    sortOthers: 4
  showCityBikes: false
  # Lowest level when stop or terminal markers are rendered at all
  stopsMinZoom: 15
  # Highest level when stops and terminals are still rendered as small markers
  stopsSmallMaxZoom: 15
  # Highest level when terminals are still rendered instead of individual stops
  terminalStopsMaxZoom: 17
  colors:
    primary: "#fff"
  socialMedia:
    title: "Uusi Matka.fi"
    description: "Liikenneviraston Matka.fi uudistuu. Apuasi kaivataan kehitystyössä. Tule palvelun testaajaksi tai tee siitä saman tien parempi."
