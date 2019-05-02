/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'hb';
const APP_TITLE = 'Mobil in Herrenberg';
const APP_DESCRIPTION = '';

const API_URL = process.env.API_URL;
const MAP_URL = process.env.MAP_URL || 'https://maps.wikimedia.org/osm-intl/';
const GEOCODING_BASE_URL = `https://pelias.locationiq.org/v1`;
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

    PELIAS: `${GEOCODING_BASE_URL}/search?api_key=${LOCATIONIQ_API_KEY}`,
    PELIAS_REVERSE_GEOCODER: `${GEOCODING_BASE_URL}/reverse?api_key=${LOCATIONIQ_API_KEY}`,
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

  title: APP_TITLE,

  meta: {
    description: APP_DESCRIPTION,
  },

  textLogo: true,

  timezoneData: 'Europe/Berlin|CET CEST CEMT|-10 -20 -30|01010101010101210101210101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-2aFe0 11d0 1iO0 11A0 1o00 11A0 Qrc0 6i00 WM0 1fA0 1cM0 1cM0 1cM0 kL0 Nc0 m10 WM0 1ao0 1cp0 dX0 jz0 Dd0 1io0 17c0 1fA0 1a00 1ehA0 1a00 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o 00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|41e5',

  map: {
    useRetinaTiles: true,
    tileSize: 256,
    zoomOffset: 0,
  },

  feedIds: ['hb'],

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
});
