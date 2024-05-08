import configMerger from '../util/configMerger';

const matkaConfig = require('./config.matka').default;

const CONFIG = 'kela';
const APP_TITLE = 'Reittiopas';
const APP_DESCRIPTION = 'Digitransit-reittiopas';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const OTP_URL =
  process.env.OTP_URL || `${API_URL}/routing/v2-kela/routers/kela/`;
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const POI_MAP_PREFIX = `${MAP_URL}/map/v3-kela/kela`;

export default configMerger(matkaConfig, {
  CONFIG,
  title: APP_TITLE,

  URL: {
    OTP: OTP_URL,

    // read stops and stations OTP2 vector map tile server
    STOP_MAP: {
      default: `${POI_MAP_PREFIX}/fi/stops,stations/`,
      sv: `${POI_MAP_PREFIX}/sv/stops,stations/`,
    },
    REALTIME_STOP_MAP: {
      default: `${POI_MAP_PREFIX}/fi/realtimeStops,stations/`,
      sv: `${POI_MAP_PREFIX}/sv/realtimeStops,stations/`,
    },
  },

  favicon: './app/configurations/images/default/default-favicon.png',
  feedIds: ['kela', 'matkahuolto', 'lansilinjat'],
  textLogo: true,
  logo: null, // override default logo from matka config
  appBarLink: false, // override default config - would show Traficom otherwise

  meta: {
    description: APP_DESCRIPTION,
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    locale: 'fi_FI',
  },

  menu: {
    copyright: null,
    content: [
      {
        name: 'accessibility-statement',
        href: {
          fi: 'https://www.digitransit.fi/accessibility',
          sv: 'https://www.digitransit.fi/accessibility',
          en: 'https://www.digitransit.fi/en/accessibility',
        },
      },
      {
        name: 'about-these-pages',
        href: '/tietoja-palvelusta',
      },
    ],
  },

  useAssembledGeoJsonZones: 'isOnByDefault',

  transportModes: {
    citybike: {
      availableForSelection: false,
      default: false,
    },
    airplane: {
      availableForSelection: false,
      default: false,
    },
    walk: {
      availableForSelection: false,
      default: false,
    },
    car: {
      availableForSelection: true,
      default: false,
    },
  },
  suggestCarMinDistance: 0,
  hideWeatherLabel: true,
  showDistanceBeforeDuration: true,
  hideItinerarySettings: true,
  showTransitLegDistance: true,
  showDistanceInItinerarySummary: false,
  hideWalkOption: true,
  alwaysShowDistanceInKm: true,
  defaultSettings: {
    ...matkaConfig.defaultSettings,
    includeCarSuggestions: true,
    includeBikeSuggestions: false,
    includeParkAndRideSuggestions: false,
  },
  mainMenu: {
    showDisruptions: false,
    stopMonitor: {
      show: false,
    },
    showEmbeddedSearch: false,
    countrySelection: [],
  },
  showNearYouButtons: false,
  hideFavourites: true,
  hideStopRouteSearch: true,

  hideMapLayersByDefault: true,
  hideCarSuggestionDuration: true,

  hideWalkLegDurationSummary: true,
  emphasizeDistance: true,
  emphasizeOneWayJourney: true,

  terminalStopsMinZoom: 14,
  useRealtimeTravellerCapacities: false,

  showVehiclesOnStopPage: false,
  showVehiclesOnItineraryPage: false,

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Reittiopasta käytetään Kelan matkaetuuksien hakemisessa ja myöntämisessä. Voit selvittää reittioppaalla matkasi tietoja kuten matkan pituuden, kulkutavan ja matkustusajan. Reittiopasta hyödynnetään Kelan <a href="https://www.kela.fi/koulumatkatuki">koulumatkatuessa</a> sekä <a href="https://www.kela.fi/matkat">terveydenhuollon ja kuntoutuksen matkakorvauksissa</a>.',
          'Kela ei vastaa reittioppaan tiedoista. Jos havaitset reittioppaassa puutteita tai virheitä, ole yhteydessä palvelun tietojen toimittajaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Reseplaneraren används vid ansökan om och beviljande av reseförmåner från FPA. Med hjälp av reseplaneraren ser du uppgifter om din resa, såsom resans längd, färdsätt och restid. Reseplaneraren används för FPA:s <a href="https://www.kela.fi/skolresestod">skoleresestöd</a> samt <a href="https://www.kela.fi/resor">reseersättningar i samband med hälso- och sjukvård och rehabilitering</a>.',
          'FPA svarar inte för uppgifterna i reseplaneraren. Om du märker brister eller fel i reseplaneraren ska du kontakta den som levererar uppgifter till tjänsten.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'The journey planner is used when applying for and granting travel-related benefits from Kela. In the journey planner, you can see information about your trip, for instance travel distance, mode of transport and travel time. The journey planner is used for <a href="https://www.kela.fi/school-transport-subsidy">school transport subsidy</a> and <a href="https://www.kela.fi/travel-costs">reimbursements of travel expenses in connection with health care and rehabilitation</a>.',
          'Kela is not responsible for the information in the journey planner. If you notice inaccuracies or incorrect information in the journey planner, you should contact the supplier of information to the service.',
        ],
      },
    ],
  },
  showCO2InItinerarySummary: false,
});
