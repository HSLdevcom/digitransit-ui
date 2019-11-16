/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'hb';
const APP_TITLE = 'Mobil in Herrenberg';
const APP_DESCRIPTION = '';
const API_URL = process.env.API_URL || 'https://api.mobil-in-herrenberg.de';
const MAP_URL = process.env.MAP_URL || 'https://maps.wikimedia.org/osm-intl/';
const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || `https://pelias.locationiq.org/v1`;
const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;

const walttiConfig = require('./waltti').default;

const minLat = 48.55525;
const maxLat = 48.64040;
const minLon = 8.78597;
const maxLon = 8.98613;

export default configMerger(walttiConfig, {
  CONFIG,
  URL: {
    OTP: process.env.OTP_URL || `${API_URL}/routing/v1/routers/hb/`,
    MAP: {
      default: MAP_URL,
    },
    STOP_MAP: `${API_URL}/map/v1/stop-map/`,
    DYNAMICPARKINGLOTS_MAP: `${API_URL}/map/v1/hb-parking-map/`,

    PELIAS: `${GEOCODING_BASE_URL}/search${LOCATIONIQ_API_KEY ? '?api_key=' + LOCATIONIQ_API_KEY : ''}`,
    PELIAS_REVERSE_GEOCODER: `${GEOCODING_BASE_URL}/reverse${LOCATIONIQ_API_KEY ? '?api_key=' + LOCATIONIQ_API_KEY : ''}`,
  },

  availableLanguages: ['de', 'en'],
  defaultLanguage: 'de',

  appBarLink: { name: 'Herrenberg.de', href: 'https://www.herrenberg.de' },

  contactName: {
    de: 'transportkollektiv',
    default: 'transportkollektiv',
  },

  colors: {
    primary: '#9fc727',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  dynamicParkingLots: {
    showDynamicParkingLots: true,
    dynamicParkingLotsSmallIconZoom: 16,
    dynamicParkingLotsMinZoom: 14
  },

  mergeStopsByCode: true,

  title: APP_TITLE,

  meta: {
    description: APP_DESCRIPTION,
  },

  textLogo: true,
  GTMid: '',

  timezoneData: 'Europe/Berlin|CET CEST CEMT|-10 -20 -30|01010101010101210101210101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-2aFe0 11d0 1iO0 11A0 1o00 11A0 Qrc0 6i00 WM0 1fA0 1cM0 1cM0 1cM0 kL0 Nc0 m10 WM0 1ao0 1cp0 dX0 jz0 Dd0 1io0 17c0 1fA0 1a00 1ehA0 1a00 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o 00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|41e5',

  map: {
    useRetinaTiles: true,
    tileSize: 256,
    zoomOffset: 0,
  },

  feedIds: ['hb'],
  searchSources: ['oa', 'osm'],

  searchParams: {
    'boundary.rect.min_lat': minLat,
    'boundary.rect.max_lat': maxLat,
    'boundary.rect.min_lon': minLon,
    'boundary.rect.max_lon': maxLon,
  },

  areaPolygon: [
    [minLon, minLat],
    [minLon, maxLat],
    [maxLon, maxLat],
    [maxLon, minLat],
  ],

  defaultEndpoint: {
    address: 'ZOB Herrenberg',
    lat: 48.5942066,
    lon: 8.8644041,
  },

  defaultOrigins: [
    {
      icon: 'icon-icon_bus',
      label: 'ZOB Herrenberg',
      lat: 48.5942066,
      lon: 8.8644041,
    },
    {
      icon: 'icon-icon_star',
      label: 'Krankenhaus',
      lat: 48.59174,
      lon: 8.87536,
    },
    {
      icon: 'icon-icon_star',
      label: 'Waldfriedhof / Schönbuchturm',
      lat: 48.6020352, 
      lon: 8.9036348,
    },
  ],

  footer: {
    content: [
      { label: `ein digitransit des transportkollektivs` },
      {},
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
      {
        name: 'imprint',
        nameEn: 'Imprint',
        href: 'https://www.herrenberg.de/impressum',
      },
      {
        name: 'privacy',
        nameEn: 'Privacy',
        href: 'https://www.herrenberg.de/datenschutz',
      },
    ],
  },

  aboutThisService: {
    de: [
      {
        header: 'Über diesen Dienst',
        paragraphs: [
          'This service is provided by Hb for route planning in Hb region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Hb for route planning in Hb region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },

  redirectReittiopasParams: false,

  themeMap: {
    hb: 'hb',
  },

  transportModes: {
    rail: {
      availableForSelection: true,
      defaultValue: true,
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

  streetModes: {
    public_transport: {
      availableForSelection: true,
      defaultValue: true,
      exclusive: false,
      icon: 'bus-withoutBox',
    },

    walk: {
      availableForSelection: true,
      defaultValue: false,
      exclusive: true,
      icon: 'walk',
    },

    bicycle: {
      availableForSelection: true,
      defaultValue: false,
      exclusive: true,
      icon: 'bicycle-withoutBox',
    },

    car: {
      availableForSelection: false,
      defaultValue: false,
      exclusive: false,
      icon: 'car-withoutBox',
    },

    car_park: {
      availableForSelection: true,
      defaultValue: false,
      exclusive: false,
      icon: 'car-withoutBox',
    }
  },

  // adding assets/geoJson/hb-layers layers
  geoJson: {
    layers: [
      //taxi stands
      {
        name: {
          fi: '',
          en: 'Taxi stands',
          de: 'Taxi Standorte',
        },
        url: '/assets/geojson/hb-layers/taxistand.geojson',
      },
      // bike parks
      {
        name: {
          fi: '',
          en: 'Open-air bicycle parks',
          de: 'Fahrradstellplätze',
        },
        url: '/assets/geojson/hb-layers/open-airbikepark.geojson',
      },
      {
        name: {
          fi: '',
          en: 'Covered bicycle parks',
          de: 'Überdachte Fahrradstellplätze',
        },
        url: '/assets/geojson/hb-layers/coveredbikepark.geojson',
      },
      // bike repair stations
      {
        name: {
          fi: '',
          en: 'Bicycle repair stations',
          de: 'Fahrradreparaturstationen',
        },
        url: '/assets/geojson/hb-layers/bicyclerepairstation.geojson',
      },
      // bike shops in Stuttgart
      {
        name: {
          fi: '',
          en: 'Bicycle shops',
          de: 'Fahrradgeschäfte',
        },
        url: '/assets/geojson/hb-layers/bicycleshop.geojson',
      },
      // bike charging stations in Stuttgart
      {
        name: {
          fi: '',
          en: 'Bicycle charging stations',
          de: 'Fahrradladestationen',
        },
        url: '/assets/geojson/hb-layers/bicyclechargingstation.geojson',
      },
      // Bike rental places in Stuttgart
      {
        name: {
          fi: '',
          en: 'Bicycle rental places',
          de: 'Fahrradverleih',
        },
        url: '/assets/geojson/hb-layers/bikerental.geojson',
      },
      // car parks
      {
        name: {
          fi: '',
          en: 'Open-air car parks',
          de: 'Parkplätze',
        },
        url: '/assets/geojson/hb-layers/carparking.geojson',
      },
      {
        name: {
          fi: '',
          en: 'Multi-story/underground car parks',
          de: 'Parkhäuser/Tiefgaragen',
        },
        url: '/assets/geojson/hb-layers/multi-storyundergroundcarparking.geojson',
      },
      // park and ride places
      {
        name: {
          fi: '',
          en: 'Park and Ride',
          de: 'Park-Und-Ride',
        },
        url: '/assets/geojson/hb-layers/parkandride.geojson',
      },
      // Car sharing options in Stuttgart
      {
        name: {
          fi: '',
          en: 'Car sharing',
          de: 'Car-Sharing',
        },
        url: '/assets/geojson/hb-layers/carsharing.geojson',
      },
      // Car charging stations in Stuttgart
      {
        name: {
          fi: '',
          en: 'Car charging stations',
          de: 'Elektroauto-Ladestationen',
        },
        url: '/assets/geojson/hb-layers/carchargingstation.geojson',
      }
      /*,
       Had to comment out since there is no bike monitoring stations
        in Herrenberg's neighbourhood and so would return an error.
      // bike monitoring stations
      {
        name: {
          fi: '',
          en: 'Bicycle monitoring stations',
          de: 'Fahrradzählstellen',
        },
        url: '/assets/geojson/hb-layers/bicyclemonitoringstation.geojson',
      }
      */
    ],
},
  
});
