const CONFIG = process.env.CONFIG || 'joensuu';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const MAP_URL = process.env.MAP_URL || 'https://{s}-dev-api.digitransit.fi';
const APP_PATH = process.env.APP_CONTEXT || '';
const PIWIK_ADDRESS = process.env.PIWIK_ADDRESS || '';
const PIWIK_ID = process.env.PIWIK_ID || '';
const SENTRY_DSN = process.env.SENTRY_DSN || '';
const PORT = process.env.PORT || 8080;
const APP_DESCRIPTION = 'Reittiopas uudistuu. Tule mukaan! Ota uuden uuden sukupolven matkaopas käyttöösi.';

export default {
  PIWIK_ADDRESS: `${PIWIK_ADDRESS}`,
  PIWIK_ID: `${PIWIK_ID}`,
  SENTRY_DSN: `${SENTRY_DSN}`,
  PORT,
  CONFIG: `${CONFIG}`,

  URL: {
    API_URL: `${API_URL}`,
    OTP: API_URL + '/routing/v1/routers/waltti/',
    MAP: MAP_URL + '/map/v1/hsl-map/',
    STOP_MAP: API_URL + '/map/v1/waltti-stop-map/',
    CITYBIKE_MAP: API_URL + '/map/v1/hsl-citybike-map/',
    MQTT: 'wss://dev.hsl.fi/mqtt-proxy',
    ALERTS: API_URL + '/realtime/service-alerts/v1',
    FONT: 'https://fonts.googleapis.com/css?family=Lato:300,400,900%7CPT+Sans+Narrow:400,700',
    REALTIME: API_URL + '/realtime/vehicle-positions/v1',
    PELIAS: API_URL + '/geocoding/v1/search',
    PELIAS_REVERSE_GEOCODER: API_URL + '/geocoding/v1/reverse',
  },

  APP_PATH: `${APP_PATH}`,
  title: 'joensuu.digitransit.fi',
  useNavigationLogo: true,

  contactName: {
    sv: '',
    fi: '',
    default: '',
  },

  searchParams: {
    'boundary.rect.min_lat': 61.6,
    'boundary.rect.max_lat': 63.6,
    'boundary.rect.min_lon': 27.1,
    'boundary.rect.max_lon': 31,
  },

  search: {
    suggestions: {
      useTransportIcons: false,
    },

    showStopsFirst: false,
  },

  nearbyRoutes: {
    radius: 10000,
    bucketSize: 1000,
  },

  maxWalkDistance: 10000,
  maxBikingDistance: 100000,
  availableLanguages: ['fi', 'sv', 'en'],
  defaultLanguage: 'en',
  timezoneData: 'Europe/Helsinki|EET EEST|-20 -30|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|35e5',
  enableDesktopWrapper: true,

  mainMenu: {
    show: true,
    showDisruptions: true,
    showInquiry: true,
    showLoginCreateAccount: true,
    showOffCanvasList: true,
  },

  feedback: {
    enable: true,
  },

  itinerary: {
    delayThreshold: 180,
    waitThreshold: 180,
    enableFeedback: false,

    timeNavigation: {
      enableButtonArrows: false,
    },
  },

  initialLocation: {
    zoom: 11,
    lat: 62.6024263,
    lon: 29.7569847,
  },

  nearestStopDistance: {
    maxShownDistance: 5000,
  },

  map: {
    useRetinaTiles: true,
    tileSize: 512,
    zoomOffset: -1,
    useVectorTiles: true,

    genericMarker: {
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
        thinWeight: 4,
      },

      leg: {
        weight: 5,
        thinWeight: 2,
      },
    },

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
    locationAware: true,
  },

  cityBike: {
    showCityBikes: false,

    useUrl: {
      fi: 'https://www.hsl.fi/citybike',
      sv: 'https://www.hsl.fi/sv/citybike',
      en: 'https://www.hsl.fi/en/citybike',
    },

    infoUrl: {
      fi: 'https://www.hsl.fi/kaupunkipyörät',
      sv: 'https://www.hsl.fi/sv/stadscyklar',
      en: 'https://www.hsl.fi/en/citybikes',
    },

    cityBikeMinZoom: 13,
    fewAvailableCount: 3,
  },

  stopsMinZoom: 14,
  stopsSmallMaxZoom: 14,
  terminalStopsMaxZoom: 17,
  terminalStopsMinZoom: 12,
  terminalNamesZoom: 16,

  colors: {
    primary: '#007ac9',
  },

  disruption: {
    showInfoButton: true,
  },

  socialMedia: {
    title: 'Uusi Reittiopas - Joensuu',
    description: APP_DESCRIPTION,
    locale: 'fi_FI',

    twitter: {
      site: '@hsldevcom',
    },
  },

  meta: {
    description: APP_DESCRIPTION,
    keywords: 'reitti,reitit,opas,reittiopas,joukkoliikenne',
  },

  showTicketInformation: false,
  showRouteInformation: false,

  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
    },

    tram: {
      availableForSelection: false,
      defaultValue: false,
    },

    rail: {
      availableForSelection: true,
      defaultValue: true,
    },

    subway: {
      availableForSelection: false,
      defaultValue: false,
    },

    citybike: {
      availableForSelection: false,
      defaultValue: false,
    },

    airplane: {
      availableForSelection: false,
      defaultValue: false,
    },

    ferry: {
      availableForSelection: true,
      defaultValue: true,
    },
  },

  showModeFilter: false,

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
  },

  areaPolygon: [[29.2154, 62.2692], [29.2154, 62.9964], [31.0931, 62.9964], [31.0931, 62.2692]],

  defaultEndpoint: {
    address: 'Keskusta, Joensuu',
    lat: 62.6024263,
    lon: 29.7569847,
  },

  aboutThisService: {
    fi: {
      about: 'Tämä on Joensuun kaupungin testi uudeksi reittioppaaksi Joensuun alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.',
      digitransit: 'Digitransit palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin reititystuote. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä.',
      datasources: 'Kartat, kadut, rakennukset, pysäkkisijainnit ym. tiedot tarjoaa © OpenStreetMap contributors ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan VRK:n rakennustietorekisteristä ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan HSL:n dev.hsl.fi/gtfs palvelimelta.',
    },

    sv: {
      about: 'This is a test service for Joensuu area route planning. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },

    en: {
      about: 'This is a test service for Joensuu area route planning. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },
  },

  desktopWrapperText: '<h2>\n  Reittiopas<sup>BETA</sup>\n</h2>\n<h1>Kokeile uutta Reittiopasta!</h1>\nReittiopas uudistuu pian. Uusi Reittiopas tuo mukanaan liudan kauan\nkaivattuja parannuksia:\n<ul>\n  <li>Reaaliaikatiedot kaikista liikennevälineistä</li>\n  <li>Entistä parempi kartta</li>\n  <li>Ennakoiva haku</li>\n  <li>Näet lähialueesi lähdöt helposti</li>\n</ul>\nUusi Reittiopas on suunniteltu erityisesti mobiililaitteet huomioiden, mutta se tulee toki\ntoimimaan erinomaisesti myös tietokoneella. Voit tutustua jo nyt mobiilioptimoituun\nversioon. Valmista on loppuvuodesta 2016.',
};
