import configMerger from '../util/configMerger';

const matkaConfig = require('./config.matka').default;

const CONFIG = 'kela';
const APP_TITLE = 'Matkalaskuri';
const APP_DESCRIPTION = 'Kelan matkalaskuri';

export default configMerger(matkaConfig, {
  CONFIG,
  title: APP_TITLE,
  textLogo: true,

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

  showWeatherLabel: false,
  showDistanceBeforeDuration: true,
  hideItinerarySettings: true,
  showTransitLegDistance: true,
  showDistanceInItinerarySummary: true,
  showWalkOption: false,
  alwaysShowDistanceInKm: true,
  defaultSettings: {
    ...matkaConfig.defaultSettings,
    includeCarSuggestions: true,
    includeBikeSuggestions: false,
  },
  nearYouModes: ['bus', 'tram', 'subway', 'rail', 'ferry', 'citybike'],
});
