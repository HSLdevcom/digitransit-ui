/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'mikkeli';
const APP_TITLE = 'Mikkelin Reittiopas';
const APP_DESCRIPTION = 'Mikkelin julkisen liikenteen reittiopas';

const walttiConfig = require('./config.waltti').default;

const minLat = 61.65922;
const maxLat = 61.717372;
const minLon = 27.155849;
const maxLon = 27.384367;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: {
    name: 'Mikkelin joukkoliikenne',
    href: 'https://mikkeli.kunta-api.fi/sisalto/palvelut/joukkoliikenne-2',
  },

  colors: {
    primary: '#52B9E9',
    iconColors: {
      'mode-bus': '#52B9E9',
    },
  },
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
      nearYouLabel: {
        fi: 'Lähipysäkit kartalla',
        sv: 'Hållplatser på kartan',
        en: 'Nearby stops on map',
      },
    },
  },
  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    twitter: {
      site: '@MikkelinK',
    },
  },

  title: APP_TITLE,

  textLogo: true, // title text instead of logo img

  feedIds: ['Mikkeli'],

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
    address: 'Hallitustori',
    lat: 61.687904,
    lon: 27.273215,
  },

  menu: {
    copyright: { label: `© Mikkeli ${walttiConfig.YEAR}` },
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
          'Tämän palvelun tarjoaa Mikkelin kaupunki reittisuunnittelua varten Mikkelin alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Mikkeli för reseplanering inom Mikkeli region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Mikkeli city for route planning in Mikkeli region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
  zoneIdMapping: {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E',
  },
  zones: {
    stops: true,
    itinerary: true,
  },

  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnSummaryPage: true,
});
