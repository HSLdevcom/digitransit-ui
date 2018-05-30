const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const APP_DESCRIPTION = 'Uusi Reittiopas';
const YEAR = 1900 + new Date().getYear();

export default {
  YEAR,
  URL: {
    OTP: process.env.OTP_URL || `${API_URL}/routing/v1/routers/waltti/`,
    STOP_MAP: `${MAP_URL}/map/v1/waltti-stop-map/`,
    CITYBIKE_MAP: `${MAP_URL}/map/v1/waltti-citybike-map/`,
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

  search: {
    minimalRegexp: new RegExp('.+'),
  },

  agency: {
    show: false,
  },

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

  redirectReittiopasParams: true,
  queryMaxAgeDays: 14,

  nationalServiceLink: { name: 'matka.fi', href: 'https://opas.matka.fi/' },
};
