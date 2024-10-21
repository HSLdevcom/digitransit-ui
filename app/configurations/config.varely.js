/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'varely';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const APP_TITLE = 'Seutu+ reittiopas';
const APP_DESCRIPTION = 'Varsinais-Suomen ELY-keskuksen reittiopas';
const OTP_URL = process.env.OTP_URL || `${API_URL}/routing/v2/varely/`;
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const POI_MAP_PREFIX = `${MAP_URL}/map/v3/varely`;

const walttiConfig = require('./config.waltti').default;

const colorPrimary = '#008161';

const minLat = 60;
const maxLat = 61.8;
const minLon = 21;
const maxLon = 23.6;

export default configMerger(walttiConfig, {
  CONFIG,

  URL: {
    OTP: OTP_URL,

    // read stops and stations OTP2 vector map tile server
    STOP_MAP: {
      default: `${POI_MAP_PREFIX}/fi/stops,stations/`,
      sv: `${POI_MAP_PREFIX}/sv/stops,stations/`,
    },
  },

  feedIds: ['VARELY', 'FOLI', 'Rauma'],

  colors: {
    primary: colorPrimary,
    hover: '#00BF6F',
    iconColors: {
      'mode-bus': colorPrimary,
      'mode-ferry': '#0064f0',
      'mode-ferry-pier': '#666666',
    },
  },

  appBarLink: { name: 'Seutu+', href: 'https://seutuplus.fi/' },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  meta: {
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'varely/seutuplus-logo-white.svg',
  favicon: './app/configurations/images/varely/varely-favicon.png',

  transportModes: {
    bus: {
      availableForSelection: true,
      color: colorPrimary,
    },

    ferry: {
      availableForSelection: true,
      defaultValue: true,
      color: '#0064f0',
    },
  },

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

  menu: {
    copyright: { label: `© Seutu+ ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'about-this-service',
        route: '/tietoja-palvelusta',
      },
      {
        name: 'accessibility-statement',
        href: {
          fi: 'https://www.digitransit.fi/accessibility',
          sv: 'https://www.digitransit.fi/accessibility',
          en: 'https://www.digitransit.fi/en/accessibility',
        },
      },
    ],
  },

  defaultEndpoint: {
    address: 'Linja-autoasema, Turku',
    lat: 60.4567994,
    lon: 22.2679201,
  },

  /* Enable real-time map layer for vehicle positions */
  vehicles: false,
  viaPointsEnabled: false,
  showVehiclesOnStopPage: true,
  showVehiclesOnItineraryPage: true,

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tervetuloa reittioppaaseen! Reittiopas kertoo, miten pääset nopeasti ja helposti perille joukkoliikenteellä Turussa, Aurassa, Maskussa, Mynämäellä, Nousiaisissa, Paimiossa ja Paraisilla. Reittiopas-palvelun tarjoaa Varsinais-Suomen ELY-keskus, ja se perustuu Digitransit –palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten är för reseplanering inom Egentliga Finland (Åbo, Aura, Masku, Mynämäki, Nousis, Pemar and Pargas). Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'Welcome to the Journey Planner! The Journey Planner shows you how to get to your destination fast and easy by public transport in Turku, Aura, Masku, Mynämäki, Nousiainen, Paimio and Parainen. You can also use the planner to find fast walking and cycling routes, and to an extent, for driving directions. The Journey Planner is provided by Centre for Economic Development, Transport and the Environment of Southwest Finland and it is based on the Digitransit service platform.',
        ],
      },
    ],
  },

  sourceForAlertsAndDisruptions: {
    VARELY: {
      fi: 'Varsinais-Suomi',
      sv: 'Egentliga Finland',
      en: 'Varsinais-Suomi',
    },
    Rauma: {
      fi: 'Rauma',
      sv: 'Raumo',
      en: 'Rauma',
    },
    FOLI: {
      fi: 'Turun seutu',
      sv: 'Åboregion',
      en: 'Turku region',
    },
  },

  staticMessages: [],
  showCO2InItinerarySummary: true,
  showNearYouButtons: true,
  allowLogin: false,
  routeNotifications: [],
  analyticsScript: '',
});
