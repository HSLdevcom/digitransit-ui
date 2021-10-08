/* eslint-disable prefer-template */
import safeJsonParse from '../util/safeJsonParser';
import { BIKEAVL_WITHMAX } from '../util/citybikes';
import { BicycleParkingFilter } from '../constants';

const CONFIG = process.env.CONFIG || 'default';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const GEOCODING_BASE_URL = `${API_URL}/geocoding/v1`;
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const MAP_PATH_PREFIX = process.env.MAP_PATH_PREFIX || '';
const APP_PATH = process.env.APP_CONTEXT || '';
const { SENTRY_DSN, AXE, NODE_ENV } = process.env;
const PORT = process.env.PORT || 8080;
const APP_DESCRIPTION = 'Digitransit journey planning UI';
const OTP_TIMEOUT = process.env.OTP_TIMEOUT || 12000;
const YEAR = 1900 + new Date().getYear();
const realtime = require('./realtimeUtils').default;

const REALTIME_PATCH = safeJsonParse(process.env.REALTIME_PATCH) || {};

export default {
  SENTRY_DSN,
  PORT,
  AXE,
  CONFIG,
  NODE_ENV,
  OTPTimeout: OTP_TIMEOUT,
  URL: {
    API_URL,
    ASSET_URL: process.env.ASSET_URL,
    MAP_URL,
    OTP: process.env.OTP_URL || `${API_URL}/routing/v1/routers/finland/`,
    MAP: {
      default: `${MAP_URL}/map/v1/${MAP_PATH_PREFIX}hsl-map/{z}/{x}/{y}{r}.png`,
      sv: `${MAP_URL}/map/v1/${MAP_PATH_PREFIX}hsl-map-sv/{z}/{x}/{y}{r}.png`,
    },
    STOP_MAP: `${MAP_URL}/map/v1/finland-stop-map/`,
    CITYBIKE_MAP: `${MAP_URL}/map/v1/finland-citybike-map/`,
    FONT:
      'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&family=Roboto:wght@400;700',
    PELIAS: `${process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL}/search`,
    PELIAS_REVERSE_GEOCODER: `${
      process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
    }/reverse`,
    PELIAS_PLACE: `${
      process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
    }/place`,
    ROUTE_TIMETABLES: {
      HSL: `${API_URL}/timetables/v1/hsl/routes/`,
      tampere: 'https://www.nysse.fi/aikataulut-ja-reitit/linjat/',
    },
    STOP_TIMETABLES: {
      HSL: `${API_URL}/timetables/v1/hsl/stops/`,
    },
    WEATHER_DATA:
      'https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::hirlam::surface::point::simple&timestep=5&parameters=temperature,WindSpeedMS,WeatherSymbol3',
  },

  APP_PATH: `${APP_PATH}`,
  indexPath: '',
  title: 'Reittihaku',

  textLogo: false,
  // Navbar logo
  logo: 'default/digitransit-logo.png',

  contactName: {
    sv: 'Digitransit',
    fi: 'Digitransit',
    default: "Digitransit's",
  },

  // Default labels for manifest creation
  name: 'Digitransit beta',
  shortName: 'Digitransit',

  searchParams: {},
  feedIds: [],

  realTime: realtime,
  realTimePatch: REALTIME_PATCH,

  // Google Tag Manager id
  GTMid: process.env.GTM_ID || null,

  /*
   * by default search endpoints from all but gtfs sources, correct gtfs source
   * figured based on feedIds config variable
   */
  searchSources: ['oa', 'osm', 'nlsfi'],

  search: {
    suggestions: {
      useTransportIcons: false,
    },
    usePeliasStops: false,
    mapPeliasModality: false,
    peliasMapping: {},
    peliasLayer: null,
    peliasLocalization: null,
    minimalRegexp: new RegExp('.{2,}'),
  },

  nearbyRoutes: {
    radius: 10000,
    bucketSize: 1000,
  },

  omitNonPickups: true,
  maxNearbyStopAmount: 5,
  maxNearbyStopRefetches: 5,
  maxNearbyStopDistance: {
    favorite: 100000,
    bus: 100000,
    tram: 100000,
    subway: 100000,
    rail: 100000,
    ferry: 100000,
    citybike: 100000,
    airplane: 200000,
  },

  defaultSettings: {
    accessibilityOption: 0,
    bikeSpeed: 5.55,
    bicycleParkingFilter: BicycleParkingFilter.All,
    ticketTypes: 'none',
    walkBoardCost: 600,
    walkReluctance: 2,
    walkSpeed: 1.2,
    includeBikeSuggestions: true,
    includeParkAndRideSuggestions: false,
    includeCarSuggestions: false,
  },

  /**
   * These are used for dropdown selection of values to override the default
   * settings. This means that values ought to be relative to the current default.
   * If not, the selection may not make any sense.
   */
  defaultOptions: {
    walkBoardCost: {
      least: 3600,
      less: 1200,
      more: 360,
      most: 120,
    },
    walkReluctance: {
      least: 5,
      less: 3,
      more: 1,
      most: 0.2,
    },
    walkSpeed: [0.69, 0.97, 1.2, 1.67, 2.22],
    bikeSpeed: [2.77, 4.15, 5.55, 6.94, 8.33],
  },

  walkBoardCost: 600,
  walkBoardCostHigh: 1200,

  parkAndRideBannedVehicleParkingTags: [],

  maxWalkDistance: 10000,
  suggestBikeMaxDistance: 30000,
  // max walking distance in bike and public transport
  suggestBikeAndPublicMaxDistance: 15000,
  // minimum linear distance in bike and take onto train (otherwise just cycle)
  suggestBikeAndPublicMinDistance: 3000,
  // minimum linear distance in bike and park / public transport (otherwise just cycle)
  suggestBikeAndParkMinDistance: 3000,
  // if you enable car suggestions but the linear distance between all points is less than this, then a car route will
  // not be computed
  suggestCarMinDistance: 2000,
  maxBikingDistance: 100000,
  itineraryFiltering: 1.5, // drops 66% worse routes
  useUnpreferredRoutesPenalty: 1200, // adds 10 minute (weight) penalty to routes that are unpreferred
  minTransferTime: 120,
  optimize: 'GREENWAYS',
  transferPenalty: 0,
  unpreferredBicycleParkingTagPenalty: 900,
  availableLanguages: ['fi', 'sv', 'en', 'fr', 'nb', 'de', 'da', 'es', 'ro'],
  defaultLanguage: 'en',
  // This timezone data will expire in 2037
  timezoneData:
    'Europe/Helsinki|EET EEST|-20 -30|0101010101010101010101010101010101010|22k10 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|12e5',

  allowLogin: false,
  allowFavouritesFromLocalstorage: true,

  mainMenu: {
    // Whether to show the left menu toggle button at all
    show: true,
    showDisruptions: true,
    showLoginCreateAccount: true,
    showOffCanvasList: true,
    showFrontPageLink: true,
  },

  itinerary: {
    // How long vehicle should be late in order to mark it delayed. Measured in seconds.
    delayThreshold: 180,
    // Wait time to show "wait leg"? e.g. 180 means over 3 minutes are shown as wait time.
    // Measured in seconds.
    waitThreshold: 180,
    enableFeedback: false,

    timeNavigation: {
      enableButtonArrows: false,
    },
    // Number of days to include to the service time range from the future (DT-3317)
    serviceTimeRange: 30,
  },

  map: {
    useRetinaTiles: true,
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 9,
    maxZoom: 18,
    controls: {
      zoom: {
        // available controls positions: 'topleft', 'topright', 'bottomleft, 'bottomright'
        position: 'bottomright',
      },
      scale: {
        position: 'bottomright',
      },
    },
    genericMarker: {
      // Do not render name markers at zoom levels below this value
      nameMarkerMinZoom: 18,

      popup: {
        offset: [106, 16],
        maxWidth: 250,
        minWidth: 250,
      },
    },

    line: {
      halo: {
        weight: 7,
        thinWeight: 2,
      },

      leg: {
        weight: 6,
        thinWeight: 2,
      },

      passiveColor: '#758993',
    },

    showZoomControl: true, // DT-3470
    showLayerSelector: true, // DT-3470
    showStopMarkerPopupOnMobile: true, // DT-3470
    showScaleBar: true, // DT-3470
    attribution:
      '<a tabIndex="-1" href="http://osm.org/copyright">© OpenStreetMap</a>', // DT-3470, DT-3397

    useModeIconsInNonTileLayer: false,
  },

  stopCard: {
    header: {
      showDescription: true,
      showStopCode: true,
      showDistance: true,
    },
  },

  autoSuggest: {
    // Let Pelias suggest based on current user location
    locationAware: true,
  },

  cityBike: {
    // Config for map features. NOTE: availability for routing is controlled by
    // transportModes.citybike.availableForSelection
    showFullInfo: false,
    showStationId: true,
    cityBikeMinZoom: 14,
    cityBikeSmallIconZoom: 14,
    // When should bikeshare availability be rendered in orange rather than green
    fewAvailableCount: 3,
    networks: {},
    capacity: BIKEAVL_WITHMAX,
  },

  // Lowest level for stops and terminals are rendered
  stopsMinZoom: 13,
  // Highest level when stops and terminals are still rendered as small markers
  stopsSmallMaxZoom: 14,
  // Highest level when terminals are still rendered instead of individual stops
  terminalStopsMaxZoom: 18,
  terminalStopsMinZoom: 12,
  // lowest zoom level when to draw rail platforms
  railPlatformsMinZoom: 15,
  terminalNamesZoom: 16,
  stopsIconSize: {
    small: 8,
    selected: 28,
    default: 18,
  },

  appBarLink: { name: 'Digitransit', href: 'https://www.digitransit.fi/' },
  appBarStyle: 'default', // DT-3375

  colors: {
    primary: '#000F94',
    iconColors: {
      'mode-airplane': '#0046ad',
      'mode-bus': '#0088ce',
      'mode-tram': '#6a8925',
      'mode-metro': '#ed8c00',
      'mode-rail': '#af8dbc',
      'mode-ferry': '#35b5b3',
      'mode-citybike': '#f2b62d',
    },
  },

  fontWeights: {
    medium: 700,
  },

  sprites: 'assets/svg-sprite.default.svg',

  disruption: {
    showInfoButton: true,
  },

  agency: {
    show: true,
  },

  socialMedia: {
    title: 'Digitransit',
    description: APP_DESCRIPTION,
    locale: 'en_US',

    image: {
      url: '/img/default-social-share.png',
      width: 2400,
      height: 1260,
    },

    twitter: {
      card: 'summary_large_image',
      site: '@hsldevcom',
    },
  },

  meta: {
    description: APP_DESCRIPTION,
    keywords: 'digitransit',
  },

  hideExternalOperator: () => false,
  // Ticket information feature toggle
  showTicketInformation: false,
  ticketInformation: {
    // This is the name of the primary agency operating in the area.
    // It is used when a ticket price cannot be shown to the user, indicating
    // that the primary agency is not responsible for ticketing.
    /*
    primaryAgencyName: ...,
    */
  },

  // Show ticket disclaimer when some of the fares are unknown.
  displayFareInfoTop: true,

  useTicketIcons: false,
  showRouteInformation: false,

  modeToOTP: {
    bus: 'BUS',
    tram: 'TRAM',
    rail: 'RAIL',
    subway: 'SUBWAY',
    citybike: 'BICYCLE_RENT',
    airplane: 'AIRPLANE',
    ferry: 'FERRY',
    walk: 'WALK',
  },

  // Control what transport modes that should be possible to select in the UI
  // and whether the transport mode is used in trip planning by default.
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
    },

    tram: {
      availableForSelection: true,
      defaultValue: true,
    },

    rail: {
      availableForSelection: true,
      defaultValue: true,
    },

    subway: {
      availableForSelection: true,
      defaultValue: true,
    },

    airplane: {
      availableForSelection: true,
      defaultValue: true,
    },

    ferry: {
      availableForSelection: true,
      defaultValue: true,
    },

    // this is just here so that the order is preserved when merging these config files
    // this is important because citybike needs to come last as it activates another toggle to select the
    // rental network which is rendered directly underneath.
    carpool: {
      availableForSelection: false,
      defaultValue: false,
    },

    citybike: {
      availableForSelection: false,
      defaultValue: false, // always false
    },
  },

  // modes that should not coexist with BICYCLE mode
  modesWithNoBike: ['BICYCLE_RENT', 'WALK'],

  moment: {
    relativeTimeThreshold: {
      seconds: 55,
      minutes: 59,
      hours: 23,
      days: 26,
      months: 11,
    },
  },

  customizeSearch: {
    walkReluctance: {
      available: true,
    },

    walkBoardCost: {
      available: true,
    },

    transferMargin: {
      available: true,
    },

    walkingSpeed: {
      available: true,
    },

    ticketOptions: {
      available: true,
    },

    accessibility: {
      available: true,
    },
    transferpenalty: {
      available: true,
    },
  },

  areaPolygon: [
    [18.776, 60.3316],
    [18.9625, 60.7385],
    [19.8615, 60.8957],
    [20.4145, 61.1942],
    [20.4349, 61.9592],
    [19.7853, 63.2157],
    [20.4727, 63.6319],
    [21.6353, 63.8559],
    [23.4626, 64.7794],
    [23.7244, 65.3008],
    [23.6873, 65.8569],
    [23.2069, 66.2701],
    [23.4627, 66.8344],
    [22.9291, 67.4662],
    [23.0459, 67.9229],
    [20.5459, 68.7605],
    [20.0996, 69.14],
    [21.426, 69.4835],
    [21.9928, 69.4009],
    [22.9226, 68.8678],
    [23.8108, 69.0145],
    [24.6903, 68.8614],
    [25.2262, 69.0596],
    [25.4029, 69.7235],
    [26.066, 70.0559],
    [28.2123, 70.2496],
    [29.5813, 69.7854],
    [29.8467, 69.49],
    [28.9502, 68.515],
    [30.4855, 67.6952],
    [29.4962, 66.9232],
    [30.5219, 65.8728],
    [30.1543, 64.9646],
    [30.9641, 64.1321],
    [30.572, 63.7098],
    [31.5491, 63.3309],
    [31.9773, 62.9304],
    [31.576, 62.426],
    [27.739, 60.1117],
    [26.0945, 59.8015],
    [22.4235, 59.3342],
    [20.2983, 59.2763],
    [19.3719, 59.6858],
    [18.7454, 60.1305],
    [18.776, 60.3316],
  ],

  // Minimun distance between from and to locations in meters. User is noticed
  // if distance is less than this.
  minDistanceBetweenFromAndTo: 20,

  // If certain mode(s) only exist in limited number of areas, listing the areas as a list of polygons for
  // selected mode key will remove the mode(s) from queries if no coordinates in the query are within the polygon(s).
  // This reduces complexity in finding routes for the query.
  modePolygons: {},

  menu: {
    copyright: { label: `© Digitransit ${YEAR}` },
    content: [
      {
        name: 'menu-feedback',
        nameEn: 'Submit feedback',
        href: 'https://github.com/HSLdevcom/digitransit-ui/issues',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
      },
    ],
  },

  // Default origin endpoint to use when user is outside of area
  defaultEndpoint: {
    address: 'Helsinki-Vantaan Lentoasema',
    lat: 60.317429,
    lon: 24.9690395,
  },

  availableRouteTimetables: {},

  routeTimetableUrlResolver: {},

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
      {
        header: 'Digitransit-palvelualusta',
        paragraphs: [
          'Digitransit-palvelualusta on HSL:n ja Traficomin kehittämä avoimen lähdekoodin reititystuote.',
        ],
      },
      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut ladataan Traficomin valtakunnallisesta joukkoliikenteen tietokannasta.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
      {
        header: 'Digitransit-plattformen',
        paragraphs: [
          'Digitransit-plattformen är en öppen programvara utvecklad av HRT och Traficom.',
        ],
      },
      {
        header: 'Datakällor',
        paragraphs: [
          'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller hämtas från Traficoms landsomfattande kollektivtrafiksdatabas.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
      {
        header: 'Digitransit platform',
        paragraphs: [
          'The Digitransit service platform is an open source routing platform developed by HSL and Traficom.',
        ],
      },
      {
        header: 'Data sources',
        paragraphs: [
          "Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is retrieved from the Building and Dwelling Register of the Finnish Population Register Center. Public transport routes and timetables are downloaded from Traficom's national public transit database.",
        ],
      },
    ],
    nb: {},
    fr: {},
    de: {},
  },

  staticMessages: [],

  staticIEMessage: [
    {
      id: '3',
      priority: -1,
      content: {
        fi: [
          {
            type: 'text',
            content:
              'Palvelu ei tue käyttämääsi selainta. Päivitä selainohjelmasi tai lataa uusi selain oheisista linkeistä.\n',
          },
          {
            type: 'a',
            content: 'Google Chrome',
            href: 'https://www.google.com/chrome/',
          },
          {
            type: 'a',
            content: 'Firefox',
            href: 'https://www.mozilla.org/fi/firefox/new/',
          },
          {
            type: 'a',
            content: 'Microsoft Edge',
            href: 'https://www.microsoft.com/en-us/windows/microsoft-edge',
          },
        ],
        en: [
          {
            type: 'text',
            content:
              'The service does not support the browser you are using. Update your browser or download a new browser using the links below.\n',
          },
          {
            type: 'a',
            content: 'Google Chrome',
            href: 'https://www.google.com/chrome/',
          },
          {
            type: 'a',
            content: 'Firefox',
            href: 'https://www.mozilla.org/fi/firefox/new/',
          },
          {
            type: 'a',
            content: 'Microsoft Edge',
            href: 'https://www.microsoft.com/en-us/windows/microsoft-edge',
          },
        ],
        sv: [
          {
            type: 'text',
            content:
              'Tjänsten stöder inte den webbläsare som du har i bruk. Uppdatera din webbläsare eller ladda ner en ny webbläsare via nedanstående länk.\n',
          },
          {
            type: 'a',
            content: 'Google Chrome',
            href: 'https://www.google.com/chrome/',
          },
          {
            type: 'a',
            content: 'Firefox',
            href: 'https://www.mozilla.org/sv-SE/firefox/new/',
          },
          {
            type: 'a',
            content: 'Microsoft Edge',
            href: 'https://www.microsoft.com/en-us/windows/microsoft-edge',
          },
        ],
      },
    },
  ],
  themeMap: {
    hsl: 'reittiopas',
    turku: '(turku|foli)',
    lappeenranta: 'lappeenranta',
    joensuu: 'joensuu',
    oulu: 'oulu',
    hameenlinna: 'hameenlinna',
    matka: 'matka',
    bar: '(bar|hamburg)',
    landstadtmobil: 'landstadtmobil',
    engstingen: 'engstingen',
    muensingen: 'muensingen',
    vaasa: 'vaasa',
    walttiOpas: 'waltti',
    rovaniemi: 'rovaniemi',
    kouvola: 'kouvola',
    tampere: 'tampere',
    mikkeli: 'mikkeli',
    kotka: 'kotka',
    jyvaskyla: 'jyvaskyla',
    lahti: 'lahti',
    kuopio: 'kuopio',
    hbnext: 'hbnext',
  },

  minutesToDepartureLimit: 9,

  imperialEnabled: false,
  // this flag when true enables imperial measurements  'feet/miles system'

  vehicles: false,
  showVehiclesOnStopPage: false,
  // DT-3551: Link to traffic information page.
  trafficNowLink: '',

  timetables: {},

  // DT-3611
  showVehiclesOnSummaryPage: false,

  showWeatherInformation: true,
  showBikeAndPublicItineraries: false,
  showBikeAndParkItineraries: false,

  includeBikeSuggestions: true,
  includeCarSuggestions: true,
  includeParkAndRideSuggestions: true,

  showRouteSearch: true,
  showNearYouButtons: false,
  nearYouModes: [],
  showStopAndRouteSearch: true,

  /* Option to disable the "next" column of the Route panel as it can be confusing sometimes: https://github.com/mfdz/digitransit-ui/issues/167 */
  displayNextDeparture: true,

  messageBarAlerts: false,

  availableTickets: {},
  /* Option to disable TimeTableOptionsPanel component on Route panel */
  showTimeTableOptions: true,

  // the route to stop button in when you select an individual stop/bike rental station
  showMapRoutingButton: true,

  zones: {
    stops: false,
    itinerary: false,
  },

  viaPointsEnabled: true,

  // DT-4802 Toggling this off shows the alert bodytext instead of the header
  showAlertHeader: true,

  showSimilarRoutesOnRouteDropDown: false,

  prioritizedStopsNearYou: {},

  welcomePopup: {
    enabled: false,
    heading: 'Welcome to Digitransit',
    paragraphs: [],
  },
};
