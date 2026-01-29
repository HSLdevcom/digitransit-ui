import configMerger from '../util/configMerger';
import walttiConfig from './config.waltti';

const CONFIG = 'mikkeli';
const APP_TITLE = 'Mikkelin Reittiopas';
const APP_DESCRIPTION = 'Mikkelin julkisen liikenteen reittiopas';

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: {
    name: 'Mikkelin joukkoliikenne',
    href: 'https://mikkeli.kunta-api.fi/sisalto/palvelut/joukkoliikenne-2',
  },

  colors: {
    primary: '#167CAC',
    bus: '#167CAC',
  },
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
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
  logo: null,

  feedIds: ['Mikkeli'],

  useSearchPolygon: true,

  areaPolygon: [
    [26.94, 61.5],
    [27.02, 61.41],
    [26.93, 61.34],
    [27.18, 61.3],
    [27.36, 61.19],
    [27.77, 61.32],
    [28.24, 61.54],
    [28.12, 61.77],
    [27.86, 61.92],
    [27.48, 61.95],
    [27.38, 62.04],
    [27.15, 62.21],
    [26.99, 62.19],
    [26.84, 62.13],
    [26.63, 62.01],
    [26.43, 61.76],
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

  geoJson: {
    layers: [
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/mikkeli_zone_lines_20260122.geojson',
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
});
