CONFIG = process.env.CONFIG or 'joensuu'
API_URL = process.env.API_URL or 'https://dev-api.digitransit.fi'
MAP_URL = process.env.MAP_URL or 'https://{s}-dev-api.digitransit.fi'
APP_PATH = process.env.APP_CONTEXT or ''
PIWIK_ADDRESS = process.env.PIWIK_ADDRESS or ''
PIWIK_ID = process.env.PIWIK_ID or ''
SENTRY_DSN = process.env.SENTRY_DSN or ''
PORT = process.env.PORT or 8080
APP_DESCRIPTION = "Reittiopas uudistuu. Tule mukaan! Ota uuden uuden sukupolven matkaopas käyttöösi."

module.exports =
  PIWIK_ADDRESS: "#{PIWIK_ADDRESS}"
  PIWIK_ID: "#{PIWIK_ID}"
  SENTRY_DSN: "#{SENTRY_DSN}"
  PORT: PORT
  CONFIG: "#{CONFIG}"
  URL:
    API_URL: "#{API_URL}"
    OTP: "#{API_URL}/routing/v1/routers/waltti/"
    MAP: "#{MAP_URL}/map/v1/hsl-map/"
    STOP_MAP: "#{API_URL}/map/v1/waltti-stop-map/"
    CITYBIKE_MAP: "#{API_URL}/map/v1/hsl-citybike-map/"
    MQTT: "wss://dev.hsl.fi/mqtt-proxy"
    ALERTS: "#{API_URL}/realtime/service-alerts/v1"
    FONT: "https://fonts.googleapis.com/css?family=Lato:300,400,900%7CPT+Sans+Narrow:400,700"
    REALTIME: "#{API_URL}/realtime/vehicle-positions/v1"
    PELIAS: "#{API_URL}/geocoding/v1/search"
    PELIAS_REVERSE_GEOCODER: "#{API_URL}/geocoding/v1/reverse"
  APP_PATH: "#{APP_PATH}"
  title: "joensuu.digitransit.fi"
  useNavigationLogo: true
  contactName:
    sv: ""
    fi: ""
    default: ""
  searchParams:
    "boundary.rect.min_lat": 61.6
    "boundary.rect.max_lat": 63.6
    "boundary.rect.min_lon": 27.1
    "boundary.rect.max_lon": 31.0
  search:
    suggestions:
      useTransportIcons: false
  nearbyRoutes:
    radius: 10000
    bucketSize: 1000
  maxWalkDistance: 10000
  maxBikingDistance: 40000
  availableLanguages: ['fi', 'sv', 'en']
  defaultLanguage: 'en'
  # This timezone data will expire on 31.12.2020
  timezoneData: "Europe/Helsinki|EET EEST|-20 -30|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|35e5"
  enableDesktopWrapper: true
  mainMenu:
    # Whether to show the left menu toggle button at all
    show: true
    showDisruptions: true
    showInquiry: true
    showLoginCreateAccount: true
    showOffCanvasList: true
  feedback:
    # Whether to allow the feedback popup
    enable: true
  itinerary:
    # How long vehicle should be late in order to mark it delayed. Measured in seconds.
    delayThreshold: 180
    # Wait time to show "wait leg"? e.g. 180 means over 3 minutes are shown as wait time. Measured in seconds.
    waitThreshold: 180
    enableFeedback: false
    timeNavigation:
      enableButtonArrows: false
  initialLocation:
    zoom: 11
    lat: 62.6024263
    lon: 29.7569847
  nearestStopDistance:
    maxShownDistance: 5000
  map:
    useRetinaTiles: true
    tileSize: 512
    zoomOffset: -1
    useVectorTiles: true
    genericMarker:
      # Do not render name markers at zoom levels below this value
      nameMarkerMinZoom: 18
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
    useModeIconsInNonTileLayer: false
  stopCard:
    header:
      showDescription: true
      showStopCode: true
      showDistance: true
  autoSuggest:
    # Let Pelias suggest based on current user location
    locationAware: true
  cityBike:
    showCityBikes: false
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
    title: "Uusi Reittiopas - Joensuu"
    description: APP_DESCRIPTION
    locale: "fi_FI"
    twitter:
      site: '@hsldevcom'
  meta:
    description: APP_DESCRIPTION
    keywords: "reitti,reitit,opas,reittiopas,joukkoliikenne"
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
      availableForSelection: false
      defaultValue: false
    rail:
      availableForSelection: true
      defaultValue: true
    subway:
      availableForSelection: false
      defaultValue: false
    citybike:
      availableForSelection: false
      defaultValue: false
    airplane:
      availableForSelection: false
      defaultValue: false
    ferry:
      availableForSelection: true
      defaultValue: true
  showModeFilter: false
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
  # http://www.darrinward.com/lat-long/?id=2003445
  areaPolygon: [[29.2154, 62.2692],[29.2154, 62.9964],[31.0931, 62.9964],[31.0931,62.2692]]
  # Default origin endpoint to use when user is outside of area
  defaultEndpoint:
    address: "Keskusta, Joensuu"
    lat: 62.6024263
    lon: 29.7569847
  desktopWrapperText: '''<h2>
                        Reittiopas<sup>BETA</sup>
                      </h2>
                      <h1>Kokeile uutta Reittiopasta!</h1>
                      Reittiopas uudistuu pian. Uusi Reittiopas tuo mukanaan liudan kauan
                      kaivattuja parannuksia:
                      <ul>
                        <li>Reaaliaikatiedot kaikista liikennevälineistä</li>
                        <li>Entistä parempi kartta</li>
                        <li>Ennakoiva haku</li>
                        <li>Näet lähialueesi lähdöt helposti</li>
                      </ul>
                      Uusi Reittiopas on suunniteltu erityisesti mobiililaitteet huomioiden, mutta se tulee toki
                      toimimaan erinomaisesti myös tietokoneella. Voit tutustua jo nyt mobiilioptimoituun
                      versioon. Valmista on loppuvuodesta 2016.'''
