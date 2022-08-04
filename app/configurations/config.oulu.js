/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'oulu';
const APP_DESCRIPTION = 'Oulun seudun uusi reittiopas';
const APP_TITLE = 'Reittiopas';

const walttiConfig = require('./config.waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  feedIds: ['OULU'],

  appBarLink: {
    name: 'Oulun joukkoliikenne',
    href: 'http://www.oulunjoukkoliikenne.fi',
  },

  colors: {
    primary: '#e10069',
    iconColors: {
      'mode-bus': '#e10069',
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    twitter: {
      site: '@oulunkaupunki',
    },
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'oulu/oulu-logo.png',
  secondaryLogo: 'oulu/secondary-oulu-logo.png',

  cityBike: {
    networks: {
      oulu: {
        enabled: false,
        icon: 'citybike',
        name: {
          fi: 'Oulu',
          sv: 'Uleåborg',
          en: 'Oulu',
        },
        type: 'citybike',
        url: {
          fi: 'https://kaupunkipyorat.ouka.fi/',
          sv: 'https://kaupunkipyorat.ouka.fi/home',
          en: 'https://kaupunkipyorat.ouka.fi/home',
        },
      },
    },
  },

  searchParams: {
    'boundary.rect.min_lat': 64.71,
    'boundary.rect.max_lat': 65.38,
    'boundary.rect.min_lon': 24.37,
    'boundary.rect.max_lon': 26.61,
  },

  transportModes: {
    citybike: {
      availableForSelection: false,
    },
  },

  areaPolygon: [
    [24.37, 64.71],
    [24.37, 65.38],
    [26.61, 65.38],
    [26.61, 64.71],
  ],

  defaultEndpoint: {
    address: 'Keskusta',
    lat: 65.0118,
    lon: 25.4702,
  },

  defaultSettings: {
    walkBoardCost: 900,
  },

  menu: {
    copyright: { label: `© Oulu ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'menu-feedback',
        href: {
          fi: 'http://www.oulunjoukkoliikenne.fi/palautteet',
          sv: 'http://www.oulunjoukkoliikenne.fi/palautteet',
          en: 'https://www.ouka.fi/oulu/public-transport/customer-service',
        },
      },
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

  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnSummaryPage: true,

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tämän palvelun tarjoaa Oulun joukkoliikenne joukkoliikenteen reittisuunnittelua varten Oulun, Iin, Kempeleen, Limingan, Lumijoen, Muhoksen ja Tyrnävän alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Oulun joukkoliikenne för reseplanering inom Oulu, Ii, Kempele, Liminka, Lumijoki, Muhos och Tyrnävä region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Oulun joukkoliikenne for route planning in Oulu, Ii, Kempele, Liminka, Lumijoki, Muhos and Tyrnävä region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
  zoneIdMapping: {
    1: 'A-city',
    2: 'A',
    3: 'B',
    4: 'C',
    5: 'D',
  },
  zones: {
    stops: true,
    itinerary: true,
  },

  // DT-4802 Toggling this off shows the alert bodytext instead of the header
  showAlertHeader: false,
});
