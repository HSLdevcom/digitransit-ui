/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'joensuu';
const APP_TITLE = 'Joensuun reittiopas';
const APP_DESCRIPTION = 'Joensuun uusi reittiopas';

const walttiConfig = require('./config.waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  feedIds: ['Joensuu', 'JoensuuEly'],

  searchParams: {
    'boundary.rect.min_lat': 61.6,
    'boundary.rect.max_lat': 63.6,
    'boundary.rect.min_lon': 27.1,
    'boundary.rect.max_lon': 31,
  },

  appBarLink: { name: 'Joensuun kaupunki', href: 'http://www.joensuu.fi/' },

  title: APP_TITLE,

  // Navbar logo
  logo: 'joensuu/jojo-logo.png',

  colors: {
    primary: '#5c4696',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  mapLayers: {
    tooltip: {
      fi: 'Uutta! Saat nyt lähellä olevat bussit kartalle asetuksista.',
      en: 'New! You can now get nearby busses on the map from the settings.',
      sv:
        'Nytt! I inställningarna kan du nu välja att se närliggande bussar på kartan.',
    },
  },

  transportModes: {
    ferry: {
      availableForSelection: true,
      defaultValue: true,
    },
  },

  areaPolygon: [
    [29.2154, 62.2692],
    [29.2154, 62.9964],
    [31.0931, 62.9964],
    [31.0931, 62.2692],
  ],

  footer: {
    content: [
      { label: `© Joensuun kaupunki ${walttiConfig.YEAR}` },
      {},
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

  defaultEndpoint: {
    address: 'Keskusta, Joensuu',
    lat: 62.6024263,
    lon: 29.7569847,
  },
  defaultOrigins: [
    {
      icon: 'icon-icon_bus',
      label: 'Keskusta, Joensuu',
      lat: 62.6024263,
      lon: 29.7569847,
    },
    {
      icon: 'icon-icon_rail',
      label: 'Rautatieasema, Joensuu',
      lat: 62.5998886,
      lon: 29.77629661560059,
    },
    {
      icon: 'icon-icon_airplane',
      label: 'Lentoasema, Joensuu',
      lat: 62.65764959350609,
      lon: 29.61371183395386,
    },
  ],

  showAllBusses: true,
  showVehiclesOnStopPage: true,

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tämän palvelun tarjoaa Joensuun kaupunki joukkoliikenteen reittisuunnittelua varten Joensuun alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Joensuu för reseplanering inom Joensuu region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Joensuu city for local route planning in Joensuu region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
  zoneIdMapping: {
    1: 'A',
    2: 'B',
    3: 'C',
  },
  stopCard: {
    header: {
      showZone: true,
    },
  },
});
