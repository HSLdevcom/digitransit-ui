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
    [27.947, 60.71],
    [28.944, 61.209],
    [28.859, 61.275],
  ],

  defaultEndpoint: {
    address: 'Oleksin ja Koulukadun risteys',
    lat: 61.059097,
    lon: 28.18572,
  },

  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnItineraryPage: true,

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
        url: '/assets/geojson/lpr_zone_lines_20250515.geojson',
      },
    ],
  },
});
