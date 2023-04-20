import configMerger from '../util/configMerger';

const defaultConfig = require('./config.default').default;

const APP_TITLE = 'Kelan matkalaskuri';
const APP_DESCRIPTION = 'Kelan matkalaskuri';

export default configMerger(defaultConfig, {
  title: APP_TITLE,

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
      default: true,
    },
  },

  showWeatherLabel: false,
  includeCarSuggestions: true,
  showDistanceBeforeDuration: true,
  hideItinerarySettings: true,
});
