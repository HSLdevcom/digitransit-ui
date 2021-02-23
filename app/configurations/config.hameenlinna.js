/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'hameenlinna';
const APP_TITLE = 'reittiopas.hameenlinna.fi';
const APP_DESCRIPTION = '';

const walttiConfig = require('./config.waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: {
    name: 'Hämeenlinna',
    href: 'http://www.hameenlinna.fi/joukkoliikenne/',
  },

  colors: {
    primary: '#F76013',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    twitter: {
      site: '@hmlkaupunki',
    },
  },

  title: APP_TITLE,

  favicon: './app/configurations/images/hameenlinna/favicon.png',

  // Navbar logo
  logo: 'hameenlinna/logo.png',

  feedIds: ['Hameenlinna', 'HameenlinnaEly'],

  geoJson: {
    layers: [
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/hml_zone_lines_20210222.geojson',
      },
    ],
  },

  mapLayers: {
    tooltip: {
      fi: 'Uutta! Saat nyt lähellä olevat bussit kartalle asetuksista.',
      en: 'New! You can now get nearby busses on the map from the settings.',
      sv:
        'Nytt! I inställningarna kan du nu välja att se närliggande bussar på kartan.',
    },
  },

  searchParams: {
    'boundary.rect.min_lat': 60.75705,
    'boundary.rect.max_lat': 61.30156,
    'boundary.rect.min_lon': 23.73155,
    'boundary.rect.max_lon': 25.28315,
  },

  areaPolygon: [
    [23.73155, 60.75705],
    [23.73155, 61.30156],
    [25.28315, 61.30156],
    [25.28315, 60.75705],
  ],

  defaultEndpoint: {
    address: 'Hämeenlinnan linja-autoasema',
    lat: 60.9952717075545,
    lon: 24.4662911533486,
  },

  defaultSettings: {
    minTransferTime: 60,
  },

  defaultOrigins: [
    {
      icon: 'icon-icon_bus',
      label: 'Hämeenlinnan linja-autoasema',
      lat: 60.9952717075545,
      lon: 24.4662911533486,
    },
    {
      icon: 'icon-icon_rail',
      label: 'Hämeenlinnan rautatieasema',
      lat: 61.002179,
      lon: 24.478192,
    },
  ],

  footer: {
    content: [
      { label: `© Hameenlinna ${walttiConfig.YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href:
          'http://kartta.hameenlinna.fi/eFeedback/fi/Feedback/35-Joukkoliikenne',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
      {
        name: 'accessibility-statement',
        nameEn: 'Accessibility statement',
        href:
          'https://kauppa.waltti.fi/media/authority/154/files/Saavutettavuusseloste_Waltti-reittiopas_JyQfJhC.htm',
      },
    ],
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tämän palvelun tarjoaa Hämeenlinnan seudun joukkoliikenne reittisuunnittelua varten Hattulan, Hämeenlinnan ja Janakkalan alueella. Palvelu sisältää paikallisen ja seudullisen joukkoliikenteen reitit ja aikataulut. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Hämeenlinnan seudun joukkoliikenne för reseplanering inom Hattula, Hämeenlinna och Janakkala region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Hämeenlinnan seudun joukkoliikenne for route planning in Hattula, Hämeenlinna and Janakkala region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
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
    6: 'F',
    7: 'G',
    8: 'H',
    9: 'I',
  },
  zoneIdFontSize: {
    'G/H': '14px',
  },
  stopCard: {
    header: {
      showZone: true,
    },
  },

  showAllBusses: true,
  showVehiclesOnStopPage: true,
});
