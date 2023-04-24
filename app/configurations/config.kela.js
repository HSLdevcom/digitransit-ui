import configMerger from '../util/configMerger';

const matkaConfig = require('./config.matka').default;

const CONFIG = 'kela';
const APP_TITLE = 'Matkalaskuri';
const APP_DESCRIPTION = 'Kelan matkalaskuri';

export default configMerger(matkaConfig, {
  CONFIG,
  title: APP_TITLE,
  textLogo: true,

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
  },

  showWeatherLabel: false,
  includeCarSuggestions: true,
  includeBikeSuggestions: false,
  showDistanceBeforeDuration: true,
  hideItinerarySettings: true,
  showTransitLegDistance: true,
  showDistanceInItinerarySummary: true,
});
