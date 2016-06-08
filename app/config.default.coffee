CONFIG = process.env.CONFIG or 'default'
API_URL = process.env.API_URL or 'https://dev-api.digitransit.fi'
MAP_URL = process.env.MAP_URL or 'https://{s}-dev-api.digitransit.fi'
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
    OTP: "#{API_URL}/routing/v1/routers/finland/"
    MAP: "#{MAP_URL}/map/v1/hsl-map/"
    STOP_MAP: "#{API_URL}/map/v1/finland-stop-map/"
    CITYBIKE_MAP: "#{API_URL}/map/v1/hsl-citybike-map/"
    MQTT: "wss://dev.hsl.fi/mqtt-proxy"
    ALERTS: "#{API_URL}/realtime/service-alerts/v1"
    FONT: "https://fonts.googleapis.com/css?family=Lato:300,400,900%7CPT+Sans+Narrow:400,700"
    REALTIME: "#{API_URL}/realtime/vehicle-positions/v1"
    PELIAS: "#{API_URL}/geocoding/v1/search"
    PELIAS_REVERSE_GEOCODER: "#{API_URL}/geocoding/v1/reverse"
  APP_PATH: "#{APP_PATH}"
  title: "Matka.fi"
  contactName:
    sv: "Livin"
    fi: "Livin"
    default: "FTA's"
  searchParams: {}
  nearbyRoutes:
    radius: 10000
    bucketSize: 1000
  maxWalkDistance: 10000
  maxBikingDistance: 40000
  availableLanguages: ['fi', 'sv', 'en', 'fr', 'nb']
  defaultLanguage: 'en'
  timezone: 'Europe/Helsinki'
  enableDesktopWrapper: true
  mainMenu:
    # Whether to show the left menu toggle button at all
    show: true
    showDisruptions: true
    showInquiry: true
    showLoginCreateAccount: true
    showOffCanvasList: true
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
    useVectorTiles: true
    genericMarker:
      popup:
        offset: [106, 3]
        maxWidth: 250
        minWidth: 250
    line:
      halo:
        weight: 5
        thinWeight: 4
      leg:
        weight: 3
        thinWeight: 2
  stopCard:
    header:
      showDescription: true
      showStopCode: true
      showDistance: true
  autoSuggest:
    # Let Pelias suggest based on current user location
    locationAware: true
  cityBike:
    showCityBikes: true
    useUrl:
      fi: "https://www.hsl.fi/citybike"
      sv: "https://www.hsl.fi/sv/citybike"
      en: "https://www.hsl.fi/en/citybike"
    infoUrl:
      fi: "https://www.hsl.fi/kaupunkipyörät"
      sv: "https://www.hsl.fi/sv/stadscyklar"
      en: "https://www.hsl.fi/en/citybikes"
    cityBikeMinZoom: 14
    # When should bikeshare availability be rendered in orange rather than green
    fewAvailableCount: 3
  # Lowest level for stops and terminals are rendered
  stopsMinZoom: 14
  # Highest level when stops and terminals are still rendered as small markers
  stopsSmallMaxZoom: 14
  # Highest level when terminals are still rendered instead of individual stops
  terminalStopsMaxZoom: 17
  colors:
    primary: "#fff"
  disruption:
    showInfoButton: true
  socialMedia:
    title: "Uusi Matka.fi"
    description: "Liikenneviraston Matka.fi uudistuu. Apuasi kaivataan kehitystyössä. Tule palvelun testaajaksi tai tee siitä saman tien parempi."
  # Ticket information feature toggle
  showTicketInformation: false
  showRouteInformation: false
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
  showModeFilter: true
  moment:
    relativeTimeThreshold:
      seconds: 55
      minutes: 59
      hours: 23
      days: 26
      months: 11
  customizeSearch:
    walkReluctance:
      available: true
    walkBoardCost:
      available: true
    transferMargin:
      available: true
    walkingSpeed:
      available: true
    ticketOptions:
      available: true
    accessibility:
      available: true
  areaPolygon: [[ 18.776, 60.3316 ], [ 18.9625, 60.7385 ], [ 19.8615, 60.8957 ], [ 20.4145, 61.1942 ], [ 20.4349, 61.9592 ], [ 19.7853, 63.2157 ], [ 20.4727, 63.6319 ], [ 21.6353, 63.8559 ], [ 23.4626, 64.7794 ], [ 23.7244, 65.3008 ], [ 23.6873, 65.8569 ], [ 23.2069, 66.2701 ], [ 23.4627, 66.8344 ], [ 22.9291, 67.4662 ], [ 23.0459, 67.9229 ], [ 20.5459, 68.7605 ], [ 20.0996, 69.14 ], [ 21.426, 69.4835 ], [ 21.9928, 69.4009 ], [ 22.9226, 68.8678 ], [ 23.8108, 69.0145 ], [ 24.6903, 68.8614 ], [ 25.2262, 69.0596 ], [ 25.4029, 69.7235 ], [ 26.066, 70.0559 ], [ 28.2123, 70.2496 ], [ 29.5813, 69.7854 ], [ 29.8467, 69.49 ], [ 28.9502, 68.515 ], [ 30.4855, 67.6952 ], [ 29.4962, 66.9232 ], [ 30.5219, 65.8728 ], [ 30.1543, 64.9646 ], [ 30.9641, 64.1321 ], [ 30.572, 63.7098 ], [ 31.5491, 63.3309 ], [ 31.9773, 62.9304 ], [ 31.576, 62.426 ], [ 27.739, 60.1117 ], [ 26.0945, 59.8015 ], [ 22.4235, 59.3342 ], [ 20.2983, 59.2763 ], [ 19.3719, 59.6858 ], [ 18.7454, 60.1305 ], [ 18.776, 60.3316 ]]
  # Default origin endpoint to use when user is outside of area
  defaultEndpoint:
    address: "Helsinki-Vantaan Lentoasema"
    lat: 60.317429
    lon: 24.9690395
