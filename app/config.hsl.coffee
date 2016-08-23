CONFIG = process.env.CONFIG or 'hsl'
API_URL = process.env.API_URL or 'https://dev-api.digitransit.fi'
MAP_URL = process.env.MAP_URL or 'https://{s}-api.digitransit.fi'
APP_PATH = process.env.APP_CONTEXT or ''
PIWIK_ADDRESS = process.env.PIWIK_ADDRESS or ''
PIWIK_ID = process.env.PIWIK_ID or ''
SENTRY_DSN = process.env.SENTRY_DSN or ''
PORT = process.env.PORT or 8080
APP_DESCRIPTION = "HSL:n Reittiopas.fi uudistuu. Apuasi kaivataan kehitystyössä. Tule palvelun testaajaksi tai tee siitä saman tien parempi."

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
    STOP_MAP: "http://localhost:3000/hsl-stop-map/"
    CITYBIKE_MAP: "#{API_URL}/map/v1/hsl-citybike-map/"
    MQTT: "wss://dev.hsl.fi/mqtt-proxy"
    ALERTS: "#{API_URL}/realtime/service-alerts/v1"
    FONT: "https://cloud.typography.com/6364294/6653152/css/fonts.css"
    REALTIME: "#{API_URL}/realtime/vehicle-positions/v1"
    PELIAS: "#{API_URL}/geocoding/v1/search"
    PELIAS_REVERSE_GEOCODER: "#{API_URL}/geocoding/v1/reverse"
  APP_PATH: "#{APP_PATH}"
  title: "Reittiopas.fi"
  useNavigationLogo: false
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
  search:
    suggestions:
      useTransportIcons: false
    showStopsFirst: false
  nearbyRoutes:
    radius: 2000
    bucketSize: 100
  maxWalkDistance: 2500
  maxBikingDistance: 100000
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
      # Do not render name markers at zoom levels below this value
      nameMarkerMinZoom: 18
      popup:
        offset: [106, 16]
        maxWidth: 250
        minWidth: 250
    line:
      halo:
        weight: 7
        thinWeight: 4
      leg:
        weight: 5
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
    cityBikeSmallIconZoom: 14
    fewAvailableCount: 3
  # Lowest level for stops and terminals are rendered
  stopsMinZoom: 14
  # Highest level when stops and terminals are still rendered as small markers
  stopsSmallMaxZoom: 14
  # Highest level when terminals are still rendered instead of individual stops
  terminalStopsMaxZoom: 17
  terminalStopsMinZoom: 13
  terminalNamesZoom: 16
  colors:
    primary: "#007ac9"
  disruption:
    showInfoButton: true
  socialMedia:
    title: "Uusi Reittiopas"
    description: APP_DESCRIPTION
    locale: "fi_FI"
    twitter:
      site: '@hsldevcom'
  meta:
    description: APP_DESCRIPTION
    keywords: "reitti,reitit,opas,reittiopas,joukkoliikenne"
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
  aboutThisService: {
    fi: {
      about: "Tämän palvelun tarjoaa HSL joukkoliikenteen reittisuunnittelua varten Helsingin, Espoon, Vantaan, Kauniaisten, Keravan, Kirkkonummen ja Sipoon alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.",
      digitransit: "Digitransit palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin reititystuote. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä."
      datasources: "Kartat, kadut, rakennukset, pysäkkisijainnit ym. tiedot tarjoaa © OpenStreetMap contributors ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan VRK:n rakennustietorekisteristä ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan HSL:n dev.hsl.fi/gtfs palvelimelta."
    }
    sv: {
      about: "This service is provided by HSL for journey planning and information in the HSL region (Helsinki, Espoo, Vantaa, Kauniainen, Kerava, Kirkkonummi and Sipoo). The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.",
      digitransit: "Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses."
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs."
    }
    en: {
      about: "This service is provided by HSL for journey planning and information in the HSL region (Helsinki, Espoo, Vantaa, Kauniainen, Kerava, Kirkkonummi and Sipoo). The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.",
      digitransit: "Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses."
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs."
    }
  }
  staticMessages: [
    {
      id: 1,
      content: {
        fi: {
          title: 'Tämä on Reittioppaan kehitysversio',
          content: 'Kuulut eliittiin! Käytät Reittioppaan kehitysversiota. Nauti uusista ominaisuuksista ja lähetä meille palautetta. Päivitämme palvelua jatkuvasti. Valmista on luvassa loppuvuodesta 2016. Lisätietoa projektista löydät osoitteesta digitransit.fi.'},
        sv: {
          title: 'Det här är reseplanerarens utvecklingsversion',
          content: 'Du tillhör eliten! Du använder utvecklingsversionen av reseplaneraren. Njut av de nya egenskaperna och ge oss feedback. Vi uppdaterar tjänsten kontinuerligt. Tjänsten kommer att stå färdig kring slutet av 2016. Mer information om projektet hittar du på addressen digitransit.fi.'},
        en: {
          title: 'This Journey Planner is still under development',
          content: 'You are one of the elite! You are using the development version of the Journey Planner. Enjoy the new features and send us feedback. We are updating the service constantly. Work is done by end of 2016. More information about the project can be found at digitransit.fi.'},
      },
    },
  ],
  desktopWrapperText: '''<h2>
                        <svg
                          viewBox="0 0 84 34"
                          height="34px"
                          style="vertical-align: bottom; margin-right: 5"
                        >
                          <path
                            fill="#999"
                            d="M60.9 17.86c-.36 0-.65.3-.65.64v4.42h-6.58V18.5c0-.35-.3-.64-.65-.64-.34 0-.64.3-.64.64v10.1c0 .34.3.63.64.63.36 0 .65-.3.65-.65V24.1h6.58v4.48c0 .36.3.65.65.65.34 0 .63-.3.63-.65V18.5c0-.35-.3-.64-.63-.64zm7.36.08H64c-.35 0-.64.3-.64.64v10c0 .36.3.65.64.65.35 0 .65-.3.65-.64v-3.8h3.27l3.2 4.1c.15.18.35.33.6.33.33 0 .66-.3.66-.63 0-.18-.08-.32-.2-.46l-2.84-3.6c1.77-.33 3.04-1.4 3.04-3.24v-.03c0-.88-.32-1.67-.88-2.2-.72-.7-1.84-1.13-3.24-1.13zm2.82 3.4c0 1.45-1.22 2.32-2.93 2.32h-3.5V19.1h3.5c1.85 0 2.93.84 2.93 2.22v.03zm10.32-3.4h-7.92c-.32 0-.6.27-.6.6 0 .3.28.57.6.57h3.3v9.48c0 .36.3.65.66.65.36 0 .65-.3.65-.65v-9.47h3.3c.32 0 .6-.25.6-.57 0-.32-.28-.6-.6-.6zM60.52 4.84c-.7 0-1.25.54-1.25 1.23v3.3h-4.62v-3.3c0-.7-.56-1.23-1.26-1.23s-1.26.54-1.26 1.23V15c0 .7.55 1.24 1.25 1.24s1.25-.55 1.25-1.23v-3.36h4.62V15c0 .7.55 1.24 1.25 1.24s1.26-.55 1.26-1.23V6.07c0-.7-.55-1.23-1.26-1.23zm3.23 10.12c1.27.9 2.8 1.34 4.28 1.34 2.46 0 4.2-1.25 4.2-3.47v-.04c0-1.96-1.32-2.77-3.63-3.37-1.97-.5-2.45-.73-2.45-1.47v-.03c0-.54.5-.98 1.46-.98.8 0 1.57.27 2.4.76.2.12.4.18.64.18.65 0 1.17-.5 1.17-1.14 0-.48-.27-.8-.54-.97-1.03-.64-2.23-1-3.62-1-2.33 0-4 1.35-4 3.38v.04c0 2.2 1.5 2.84 3.8 3.4 1.9.5 2.3.8 2.3 1.44v.03c0 .66-.63 1.06-1.66 1.06-1.1 0-2.05-.4-2.9-1-.17-.12-.4-.24-.73-.24-.65 0-1.17.5-1.17 1.13 0 .38.2.74.47.93zm11.22 1.18h5.9c.63 0 1.13-.5 1.13-1.12 0-.62-.5-1.12-1.14-1.12h-4.64V6.07c0-.7-.55-1.23-1.26-1.23-.7 0-1.25.54-1.25 1.23v8.84c0 .7.57 1.24 1.27 1.24zM29 14.84c-.06 0-1.3 0-2.27.88l-1.9-4.56c1.32-.03 2.22-.9 2.27-.95 1.17-1.14 1.34-2.63.42-3.54-.92-.9-2.44-.74-3.6.4-.06.06-.93.94-.98 2.2l-4.62-1.9c.9-.92.92-2.17.92-2.24 0-1.62-.95-2.8-2.26-2.8-1.3 0-2.26 1.18-2.26 2.8 0 .07.02 1.3.9 2.24L11 9.23c-.04-1.3-.93-2.18-.98-2.23-1.17-1.15-2.7-1.33-3.6-.42-.94.9-.76 2.4.4 3.55.06.05.95.9 2.26.96l-1.94 4.53c-.95-.9-2.22-.9-2.3-.9-1.64 0-2.84.93-2.84 2.22 0 1.28 1.2 2.22 2.85 2.22.07 0 1.32-.02 2.28-.9l1.9 4.57c-1.32.03-2.23.9-2.27.95-1.17 1.14-1.35 2.63-.42 3.54.92.9 2.44.74 3.6-.4.06-.06.93-.94.98-2.2l4.62 1.9c-.9.92-.92 2.17-.92 2.24 0 1.62.95 2.8 2.26 2.8 1.3 0 2.25-1.18 2.25-2.8 0-.07 0-1.3-.9-2.24l4.64-1.87c.03 1.3.92 2.18.97 2.23 1.17 1.15 2.7 1.32 3.6.42.94-.9.76-2.4-.4-3.56-.06-.04-.95-.9-2.26-.95l1.94-4.54c.95.9 2.22.9 2.3.9 1.64 0 2.84-.92 2.84-2.2 0-1.3-1.2-2.23-2.86-2.23zM4.85 17.88c-.9 0-1.55-.4-1.55-.95 0-.55.65-.94 1.56-.94.05 0 1.15.03 1.7.96-.56.9-1.65.93-1.7.93zm19.98-9.93c.63-.62 1.38-.8 1.77-.4.4.38.22 1.1-.42 1.74-.03.04-.84.8-1.9.5-.24-1 .5-1.78.55-1.83zM16.98 3.6c.56 0 .96.64.96 1.53 0 .05-.02 1.13-.97 1.67-.9-.55-.94-1.62-.94-1.68 0-.88.4-1.53.95-1.53zM7.75 9.22c-.64-.63-.82-1.36-.42-1.75.4-.38 1.14-.2 1.78.42.04.04.8.82.52 1.86-1.03.25-1.83-.5-1.87-.53zm1.28 16.8c-.64.62-1.38.8-1.77.4-.4-.38-.22-1.1.42-1.74.03-.04.83-.8 1.9-.5.24 1-.5 1.78-.55 1.83zm7.85 4.38c-.56 0-.96-.64-.96-1.53 0-.05.02-1.13.97-1.67.9.55.93 1.62.93 1.68 0 .88-.4 1.53-.95 1.53zm9.23-5.63c.65.63.82 1.36.43 1.75-.4.38-1.14.2-1.78-.42-.03-.04-.8-.82-.52-1.86 1.04-.25 1.84.5 1.88.53zm-2.87-1.53L16.9 25.8l-6.3-2.6-2.62-6.23 2.65-6.2 6.33-2.57 6.3 2.6 2.6 6.23-2.63 6.2zM29 18c-.05 0-1.16-.03-1.7-.96.56-.9 1.64-.93 1.7-.93.9 0 1.56.4 1.56.95 0 .55-.66.95-1.56.95zM39.3 2.32c-.37 0-.68.3-.68.64v28.08c0 .35.3.64.67.64.36 0 .67-.28.67-.64V2.96c0-.35-.3-.64-.68-.64zm2.7 0c-.37 0-.68.3-.68.64v28.08c0 .36.3.64.67.64.36 0 .67-.28.67-.64V2.96c0-.35-.3-.64-.68-.64z" // eslint-disable-line max-len
                          />
                        </svg>
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
