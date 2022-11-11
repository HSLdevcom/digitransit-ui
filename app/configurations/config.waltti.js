const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const OTP_URL = process.env.OTP_URL || `${API_URL}/routing/v2/routers/waltti/`;
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const POI_MAP_PREFIX = `${MAP_URL}/map/v3/waltti`;
const APP_DESCRIPTION = 'Uusi Reittiopas';
const YEAR = 1900 + new Date().getYear();
const HSLParkAndRideUtils = require('../util/ParkAndRideUtils').default.HSL;

export default {
  YEAR,
  URL: {
    OTP: OTP_URL,
    STOP_MAP: {
      default: `${POI_MAP_PREFIX}/fi/stops,stations/`,
      sv: `${POI_MAP_PREFIX}/sv/stops,stations/`,
    },
    RENTAL_STATION_MAP: {
      default: `${POI_MAP_PREFIX}/fi/rentalStations/`,
    },
    REALTIME_RENTAL_STATION_MAP: {
      default: `${POI_MAP_PREFIX}/fi/realtimeRentalStations/`,
    },
    PARK_AND_RIDE_MAP: {
      default: `${POI_MAP_PREFIX}/en/vehicleParking/`,
      sv: `${POI_MAP_PREFIX}/sv/vehicleParking/`,
      fi: `${POI_MAP_PREFIX}/fi/vehicleParking/`,
    },
    PARK_AND_RIDE_GROUP_MAP: {
      default: `${POI_MAP_PREFIX}/en/vehicleParkingGroups/`,
      sv: `${POI_MAP_PREFIX}/sv/vehicleParkingGroups/`,
      fi: `${POI_MAP_PREFIX}/fi/vehicleParkingGroups/`,
    },
  },

  contactName: {
    sv: '',
    fi: '',
    default: '',
  },

  stopsMinZoom: 14,

  cityBike: {},

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
    nearYouButton: {
      borderRadius: '50%',
      color: '#000F94',
    },

    nearYouTitle: {
      fi: 'Aikataulut ja linjat',
      sv: 'Tidtabeller och linjer',
      en: 'Timetables and routes',
    },

    bus: {
      availableForSelection: true,
      defaultValue: true,
      nearYouLabel: {
        fi: 'Bussit ja lähipysäkit kartalla',
        sv: 'Bussar och hållplatser på kartan',
        en: 'Buses and nearby stops on map',
      },
    },

    rail: {
      availableForSelection: false,
      defaultValue: false,
      nearYouLabel: {
        fi: 'Junat ja lähiasemat kartalla',
        sv: 'Tåg och stationer på kartan',
        en: 'Trains and nearby stations on map',
      },
    },

    tram: {
      availableForSelection: false,
      defaultValue: false,
      nearYouLabel: {
        fi: 'Raitiovaunut ja lähipysäkit kartalla',
        sv: 'Spårvagnar och hållplatser på kartan',
        en: 'Trams and nearby stops on map',
      },
    },

    subway: {
      availableForSelection: false,
      defaultValue: false,
      nearYouLabel: {
        fi: 'Metrot ja lähiasemat kartalla',
        sv: 'Metro och stationer på kartan',
        en: 'Metro and nearby stations on map',
      },
    },

    citybike: {
      availableForSelection: false,
      defaultValue: false,
      nearYouLabel: {
        fi: 'Lähimmät kaupunkipyöräasemat',
        sv: 'Närmaste cykelstationer',
        en: 'The closest city bike stations',
      },
    },

    airplane: {
      availableForSelection: false,
      defaultValue: false,
      nearYouLabel: {
        fi: 'Lähimmät lentoasemat',
        sv: 'Närmaste flygplatser',
        en: 'The closest airports',
      },
    },

    ferry: {
      availableForSelection: false,
      defaultValue: false,
      nearYouLabel: {
        fi: 'Lähimmät lauttalaiturit',
        sv: 'Närmaste färjekajer',
        en: 'The closest ferry piers',
      },
    },

    funicular: {
      availableForSelection: false,
      defaultValue: false,
    },
  },

  nearbyModeSet: 'waltti',

  redirectReittiopasParams: true,
  queryMaxAgeDays: 14,

  nationalServiceLink: {
    fi: {
      name: 'matka.fi',
      href: 'https://opas.matka.fi/',
    },
    sv: {
      name: 'matka.fi',
      href: 'https://opas.matka.fi/sv/',
    },
    en: {
      name: 'matka.fi',
      href: 'https://opas.matka.fi/en/',
    },
  },

  showNearYouButtons: true,
  allowLogin: false,

  messageBarAlerts: true,

  // DT-5494
  includeCarSuggestions: true,
  includeParkAndRideSuggestions: true,
  // Include both bike and park and bike and public
  includePublicWithBikePlan: false,
  // Park and ride and car suggestions separated into two switches
  separatedParkAndRideSwitch: true,
  showBikeAndParkItineraries: true,
  parkingAreaSources: ['liipi'],

  parkAndRide: {
    showParkAndRide: false,
    parkAndRideMinZoom: 13,
    pageContent: {
      default: HSLParkAndRideUtils,
    },
  },

  hostnames: [
    // DEV hostnames
    'https://next-dev-hameenlinna.digitransit.fi',
    'https://next-dev-joensuu.digitransit.fi',
    'https://next-dev-jyvaskyla.digitransit.fi',
    'https://next-dev-kotka.digitransit.fi',
    'https://next-dev-kouvola.digitransit.fi',
    'https://next-dev-kuopio.digitransit.fi',
    'https://next-dev-lahti.digitransit.fi',
    'https://next-dev-lappeenranta.digitransit.fi',
    'https://next-dev-mikkeli.digitransit.fi',
    'https://next-dev-oulu.digitransit.fi',
    'https://next-dev-rovaniemi.digitransit.fi',
    'https://next-dev-tampere.digitransit.fi',
    'https://next-dev-opas.waltti.fi',
    // PROD hostnames
    'https://reittiopas.hameenlinna.fi',
    'https://hameenlinna.digitransit.fi',
    'https://joensuu.digitransit.fi',
    'https://jyvaskyla.digitransit.fi',
    'https://kotka.digitransit.fi',
    'https://kouvola.digitransit.fi',
    'https://kuopio.digitransit.fi',
    'https://lahti.digitransit.fi',
    'https://lappeenranta.digitransit.fi',
    'https://mikkeli.digitransit.fi',
    'https://oulu.digitransit.fi',
    'https://rovaniemi.digitransit.fi',
    'https://reittiopas.tampere.fi',
    'https://tampere.digitransit.fi',
    'https://opas.waltti.fi',
  ],
};
