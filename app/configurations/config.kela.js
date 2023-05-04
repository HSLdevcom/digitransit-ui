import configMerger from '../util/configMerger';

const matkaConfig = require('./config.matka').default;

const CONFIG = 'kela';
const APP_TITLE = 'Matkalaskuri';
const APP_DESCRIPTION = 'Kelan matkalaskuri';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const OTP_URL = process.env.OTP_URL || `${API_URL}/routing/v2/routers/kela/`;
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const POI_MAP_PREFIX = `${MAP_URL}/map/v3/kela`;

export default configMerger(matkaConfig, {
  CONFIG,
  title: APP_TITLE,
  textLogo: true,

  URL: {
    OTP: OTP_URL,

    // read stops and stations OTP2 vector map tile server
    STOP_MAP: {
      default: `${POI_MAP_PREFIX}/fi/stops,stations/`,
      sv: `${POI_MAP_PREFIX}/sv/stops,stations/`,
    },
  },

  feedIds: ['kela'],

  favicon: './app/configurations/images/kela/favicon.png',
  appBarLink: {
    name: 'Kela',
    href: 'https://www.kela.fi/',
  },

  meta: {
    description: APP_DESCRIPTION,
  },

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

  hideWeatherLabel: true,
  showDistanceBeforeDuration: true,
  hideItinerarySettings: true,
  showTransitLegDistance: true,
  showDistanceInItinerarySummary: true,
  hideWalkOption: true,
  alwaysShowDistanceInKm: true,
  defaultSettings: {
    ...matkaConfig.defaultSettings,
    includeCarSuggestions: true,
    includeBikeSuggestions: false,
  },
  mainMenu: {
    showDisruptions: false,
    stopMonitor: {
      show: false,
    },
    showEmbeddedSearch: false,
  },
  showNearYouButtons: false,
  hideFavourites: true,
  hideStopRouteSearch: true,
});
