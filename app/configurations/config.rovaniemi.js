/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'rovaniemi';
const APP_TITLE = 'Rovaniemen reittiopas';
const APP_DESCRIPTION = 'Rovaniemen uusi reittiopas';

const walttiConfig = require('./config.waltti').default;

const minLat = 66.147037;
const maxLat = 67.180128;
const minLon = 24.634987;
const maxLon = 27.373531;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Rovaniemi', href: 'http://www.rovaniemi.fi/' },

  colors: {
    primary: '#34B233',
    iconColors: {
      'mode-bus': '#34B233',
    },
  },
  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,
  favicon: './app/configurations/images/rovaniemi/rovaniemi-favicon.png',
  // Navbar logo
  logo: 'rovaniemi/rovaniemi-logo.svg',
  feedIds: ['Rovaniemi'],

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
    address: 'Rovaniemi',
    lat: 66.500855,
    lon: 25.723734,
  },

  menu: {
    copyright: { label: `© Rovaniemi ${walttiConfig.YEAR}` },
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

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tämän palvelun tarjoaa Rovaniemen kaupungin joukkoliikenne reittisuunnittelua varten Rovaniemen alueella. ',
        ],
      },
    ],
  },
  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnSummaryPage: true,
  zoneIdMapping: {
    1: 'A',
    2: 'B',
  },
  zones: {
    stops: true,
    itinerary: true,
  },
});
