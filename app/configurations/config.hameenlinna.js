import configMerger from '../util/configMerger';

const CONFIG = 'hameenlinna';
const APP_TITLE = 'reittiopas.hameenlinna.fi';
const APP_DESCRIPTION = '';

const walttiConfig = require('./waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Hämeenlinna', href: 'http://www.hameenlinna.fi/joukkoliikenne/' },

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

  favicon: './sass/themes/hameenlinna/favicon.png',

  feedIds: ['Hameenlinna', 'HameenlinnaEly'],

  searchParams: {
    'boundary.rect.min_lat': 60.75705,
    'boundary.rect.max_lat': 61.30156,
    'boundary.rect.min_lon': 23.73155,
    'boundary.rect.max_lon': 25.28315,
  },

  areaPolygon: [[23.73155, 60.75705],
                [23.73155, 61.30156],
                [25.28315, 61.30156],
                [25.28315, 60.75705]],

  defaultEndpoint: {
    address: 'Hämeenlinnan linja-autoasema',
    lat: 60.9952717075545,
    lon: 24.4662911533486,
  },

  defaultOrigins: [
    { icon: 'icon-icon_bus', label: 'Hämeenlinnan linja-autoasema', lat: 60.9952717075545, lon: 24.4662911533486 },
    { icon: 'icon-icon_rail', label: 'Hämeenlinnan rautatieasema', lat: 61.002179, lon: 24.478192 },
  ],

  footer: {
    content: [
      { label: (function () { return `© Hameenlinna ${(1900 + new Date().getYear())}`; }()) },
      {},
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: ['Tämän palvelun tarjoaa Hämeenlinnan seudun joukkoliikenne reittisuunnittelua varten Hattulan, Hämeenlinnan ja Janakkalan alueella. Palvelu sisältää paikallisen ja seudullisen joukkoliikenteen reitit ja aikataulut. Palvelu perustuu Digitransit palvelualustaan.'],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: ['Den här tjänsten erbjuds av Hämeenlinnan seudun joukkoliikenne för reseplanering inom Hattula, Hämeenlinna och Janakkala region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.'],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: ['This service is provided by Hämeenlinnan seudun joukkoliikenne for route planning in Hattula, Hämeenlinna and Janakkala region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.'],
      },
    ],
  },

});
