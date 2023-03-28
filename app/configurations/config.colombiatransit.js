/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'colombiatransit';
const APP_TITLE = 'ColombiaTransit';
const APP_DESCRIPTION = 'Uusi Reittiopas - colombiatransit';

const walttiConfig = require('./config.waltti').default;

const API_URL = process.env.API_URL || 'https://api.colombiatransit.co';
const OTP_URL = process.env.OTP_URL || `${API_URL}/api/otp/v2/`;
const MAP_URL =
  process.env.MAP_URL || 'https://tileserver.colombiatransit.co';
const POI_MAP_PREFIX = `${OTP_URL}vectorTiles`;

const rootLink = process.env.ROOTLINK || 'https://digitransit.colombiatransit.co';

const minLat = -4.2316872;
const maxLat = 16.0571269;
const minLon = -82.1243666;
const maxLon = -66.8511907;

export default configMerger(walttiConfig, {
  CONFIG,

  URL: {
    OTP: OTP_URL,
    MAP: {
      default: `${MAP_URL}/styles/osm-bright/`,      
    },
    STOP_MAP: {
      default: `${POI_MAP_PREFIX}/stops,stations/`,      
    },
    RENTAL_STATION_MAP: {
      default: `${POI_MAP_PREFIX}/rentalStations/`,
    },
    REALTIME_RENTAL_STATION_MAP: {
      default: `${POI_MAP_PREFIX}/realtimeRentalStations/`,
    },
    PARK_AND_RIDE_MAP: {
      default: `${POI_MAP_PREFIX}/vehicleParking/`,      
    },
    PARK_AND_RIDE_GROUP_MAP: {
      default: `${POI_MAP_PREFIX}/vehicleParkingGroups/`,
    },    
    ROOTLINK: rootLink,    
  },

  appBarLink: { name: 'Colombiatransit', href: 'http://colombiatransit.co/' },

  colors: {
    primary: '#dc0451',
    iconColors: {
      'mode-bus': '#007ac9',
      'mode-bus-express': '#CA4000',
      'mode-bus-local': '#007ac9',
      'mode-rail': '#8c4799',
      'mode-tram': '#008151',
      'mode-ferry': '#007A97',
      'mode-ferry-pier': '#666666',
      'mode-metro': '#CA4000',
      'mode-citybike': '#f2b62d',
      'mode-citybike-secondary': '#333333',
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  textLogo: true,

  feedIds: ['Colombiatransit'],

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
    address: 'Bogotá Eldorado Airport',
    lat: 4.701944,
    lon: -74.147222,
  },

  menu: {
    copyright: { label: `© Colombiatransit ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'about-this-service',
        route: '/tietoja-palvelusta',
      },
      {
        name: 'accessibility-statement',
        href:
          'https://kauppa.waltti.fi/media/authority/154/files/Saavutettavuusseloste_Waltti-reittiopas_JyQfJhC.htm',
      },
    ],
  },  

  aboutThisService: {
    
    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Colombiatransit for route planning in Colombiatransit region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
  hostnames: [
    // DEV hostnames    
    'https://digitransit.colombiatransit.co',    
    // PROD hostnames
    'https://colombiatransit.co',
  ],
},
);
