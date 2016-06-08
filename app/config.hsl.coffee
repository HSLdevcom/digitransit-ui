CONFIG = process.env.CONFIG or 'hsl'
API_URL = process.env.API_URL or 'https://dev-api.digitransit.fi'
MAP_URL = process.env.MAP_URL or 'https://{s}-api.digitransit.fi'
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
    OTP: "#{API_URL}/routing/v1/routers/hsl/"
    MAP: "#{MAP_URL}/map/v1/hsl-map/"
    STOP_MAP: "#{API_URL}/map/v1/hsl-stop-map/"
    CITYBIKE_MAP: "#{API_URL}/map/v1/hsl-citybike-map/"
    MQTT: "wss://dev.hsl.fi/mqtt-proxy"
    ALERTS: "#{API_URL}/realtime/service-alerts/v1"
    FONT: "https://cloud.typography.com/6364294/6653152/css/fonts.css"
    REALTIME: "#{API_URL}/realtime/vehicle-positions/v1"
    PELIAS: "#{API_URL}/geocoding/v1/search"
    PELIAS_REVERSE_GEOCODER: "#{API_URL}/geocoding/v1/reverse"
  APP_PATH: "#{APP_PATH}"
  title: "Reittiopas.fi"
  contactName:
    sv: "HSR"
    fi: "HSL"
    default: "HSL"
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
  availableLanguages: ['fi', 'sv', 'en']
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
    cityBikeMinZoom: 13
    fewAvailableCount: 3
  # Lowest level for stops and terminals are rendered
  stopsMinZoom: 14
  # Highest level when stops and terminals are still rendered as small markers
  stopsSmallMaxZoom: 14
  # Highest level when terminals are still rendered instead of individual stops
  terminalStopsMaxZoom: 17
  colors:
    primary: "#007ac9"
  disruption:
    showInfoButton: true
  socialMedia:
    title: "Uusi Reittiopas"
    description: "HSL:n Reittiopas.fi uudistuu. Apuasi kaivataan kehitystyössä. Tule palvelun testaajaksi tai tee siitä saman tien parempi."
  # Ticket information feature toggle
  showTicketInformation: true
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
      availableForSelection: false
      defaultValue: false
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
  areaPolygon: [[ 24.2647, 60.178 ], [ 24.3097, 60.2537 ], [ 24.3903, 60.3058 ], [ 24.4683, 60.3123 ], [ 24.4918, 60.3438 ], [ 24.5685, 60.3371 ], [ 24.6128, 60.3755 ], [ 24.739, 60.3642 ], [ 24.8046, 60.4071 ], [ 24.8684, 60.4192 ], [ 24.9694, 60.3508 ], [ 24.9992, 60.3524 ], [ 24.9865, 60.3732 ], [ 25.0452, 60.391 ], [ 25.0411, 60.4251 ], [ 25.1126, 60.4522 ], [ 25.162, 60.5238 ], [ 25.2438, 60.5168 ], [ 25.3261, 60.4666 ], [ 25.444, 60.3445 ], [ 25.5622, 60.2691 ], [ 25.4213, 60.1613 ], [ 25.3479, 59.9218 ], [ 24.94, 59.904 ], [ 24.5041, 59.801 ], [ 24.2785, 59.7737 ], [ 24.246, 59.791 ], [ 24.2367, 59.9579 ], [ 24.2579, 60.017 ], [ 24.3257, 60.0729 ], [ 24.2647, 60.178 ]]
  # Default origin endpoint to use when user is outside of area
  defaultEndpoint:
    address: "Rautatieasema, Helsinki"
    lat: 60.1710688
    lon: 24.9414841
