import configMerger from '../util/configMerger';
import { BIKEAVL_WITHMAX } from '../util/vehicleRentalUtils';
import walttiConfig from './config.waltti';

const CONFIG = 'lappeenranta';
const APP_TITLE = 'reittiopas.lappeenranta.fi';
const APP_DESCRIPTION = '';

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Lappeenranta', href: 'http://www.lappeenranta.fi/' },

  colors: {
    primary: '#d4007a',
    iconColors: {
      'mode-bus': '#d4007a',
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    image: {
      url: 'img/social-share-lappeenranta.jpg',
      width: 591,
      height: 591,
    },
  },

  title: APP_TITLE,

  logo: 'lappeenranta/logo.png',
  secondaryLogo: 'lappeenranta/secondary-logo.png',

  favicon: './app/configurations/images/lappeenranta/lappeenranta-favicon.jpg',

  vehicleRental: {
    networks: {
      donkey_lappeenranta: {
        enabled: true,
        season: {
          start: '1.4',
          end: '30.11',
        },
        capacity: BIKEAVL_WITHMAX,
        icon: 'citybike',
        name: {
          fi: 'Lappeenranta',
          sv: 'Vilmanstrand',
          en: 'Lappeenranta',
        },
        type: 'citybike',
        url: {
          fi: 'https://kaakau.fi/lappeenranta/',
          sv: 'https://kaakau.fi/lappeenranta/?lang=sv',
          en: 'https://kaakau.fi/lappeenranta/?lang=en',
        },
      },
    },
  },

  transportModes: {
    citybike: {
      availableForSelection: true,
    },
  },

  nearYouModes: ['bus', 'citybike'],

  feedIds: ['Lappeenranta'],

  useSearchPolygon: true,

  areaPolygon: [
    [27.804, 61.061],
    [27.702, 60.796],
    [27.717, 60.759],
    [27.951, 60.6627],
    [27.99, 60.6687],
    [27.9953, 60.6714],
    [27.998, 60.6706],
    [28.0172, 60.6812],
    [28.0144, 60.6825],
    [28.0888, 60.7208],
    [28.1353, 60.7409],
    [28.1738, 60.7789],
    [28.2204, 60.7829],
    [28.2554, 60.8101],
    [28.3115, 60.8414],
    [28.3176, 60.8496],
    [28.3241, 60.8582],
    [28.3363, 60.8551],
    [28.3928, 60.8848],
    [28.3974, 60.8837],
    [28.3998, 60.8857],
    [28.3973, 60.8877],
    [28.4653, 60.9235],
    [28.4741, 60.9244],
    [28.4836, 60.9258],
    [28.4831, 60.9267],
    [28.482, 60.9278],
    [28.4832, 60.9289],
    [28.4832, 60.9295],
    [28.492, 60.9352],
    [28.4929, 60.9373],
    [28.4952, 60.9374],
    [28.5246, 60.9572],
    [28.5276, 60.955],
    [28.53, 60.9549],
    [28.5374, 60.9566],
    [28.539, 60.9564],
    [28.542, 60.9562],
    [28.5453, 60.9554],
    [28.5526, 60.9551],
    [28.573, 60.9519],
    [28.6149, 60.9555],
    [28.6492, 60.9481],
    [28.6504, 60.9485],
    [28.6548, 60.9495],
    [28.6577, 60.9512],
    [28.6694, 60.9638],
    [28.6837, 60.979],
    [28.6886, 60.988],
    [28.6904, 60.9906],
    [28.695, 60.999],
    [28.7096, 61.027],
    [28.7134, 61.0445],
    [28.7766, 61.0793],
    [28.8007, 61.0928],
    [28.8041, 61.0936],
    [28.8077, 61.0966],
    [28.8188, 61.1217],
    [28.8366, 61.1263],
    [28.8726, 61.1357],
    [28.8834, 61.1426],
    [28.9027, 61.1447],
    [28.915, 61.1435],
    [28.9261, 61.146],
    [28.9441, 61.1483],
    [28.9514, 61.1519],
    [28.9566, 61.1517],
    [28.9855, 61.1739],
    [29.0113, 61.1845],
    [29.022, 61.1885],
    [28.925, 61.2873],
    [28.3844, 61.2929],
  ],

  defaultEndpoint: {
    address: 'Oleksin ja Koulukadun risteys',
    lat: 61.059097,
    lon: 28.18572,
  },

  menu: {
    copyright: { label: `© Lappeenranta ${walttiConfig.YEAR}` },
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
          'Tämän palvelun tarjoaa Lappeenrannan seudun joukkoliikenne joukkoliikenteen reittisuunnittelua varten Lappeenrannan paikallisliikenteen alueella. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Lappeenrannan seudun joukkoliikenne för lokal reseplanering inom Lappeenranta region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Lappeenrannan seudun joukkoliikenne for local route planning in Lappenranta region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
  zoneIdMapping: {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
  },
  zones: {
    stops: true,
    itinerary: true,
  },
  geoJson: {
    layers: [
      {
        name: {
          fi: 'Pyöräilyreitit',
          sv: 'Cykelrutter',
          en: 'Bike routes',
        },
        url: 'https://ckanlpr.meitademo.fi/geojson/pyorailyreitit_lpr.geojson',
        isOffByDefault: true,
      },
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/lpr_zone_lines_20251009.geojson',
      },
    ],
  },
});
