const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const MAP_URL = process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const APP_DESCRIPTION = 'Uusi Reittiopas';

export default {
  URL: {
    OTP: `${API_URL}/routing/v1/routers/waltti/`,
    STOP_MAP: `${MAP_URL}/map/v1/waltti-stop-map/`,
  },

  contactName: {
    sv: '',
    fi: '',
    default: '',
  },

  stopsMinZoom: 14,

  cityBike: {
    showCityBikes: false,
  },

  agency: {
    show: false,
  },

  sprites: 'svg-sprite.default.svg', // use default set

  meta: {
    description: APP_DESCRIPTION,
  },

  availableLanguages: ['fi', 'sv', 'en'],
  defaultLanguage: 'fi',

  transportModes: {
    rail: {
      availableForSelection: false,
      defaultValue: false,
    },

    tram: {
      availableForSelection: false,
      defaultValue: false,
    },

    subway: {
      availableForSelection: false,
      defaultValue: false,
    },

    citybike: {
      availableForSelection: false,
    },

    airplane: {
      availableForSelection: false,
      defaultValue: false,
    },

    ferry: {
      availableForSelection: false,
      defaultValue: false,
    },
  },

  showModeFilter: false,
};
