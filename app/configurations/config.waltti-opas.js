/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'waltti-opas';
const APP_TITLE = 'Uusi Reittiopas';
const APP_DESCRIPTION = 'Uusi Reittiopas - waltti-opas';

const walttiConfig = require('./config.waltti').default;

const minLat = 60.356;
const maxLat = 61.103;
const minLon = 26.041;
const maxLon = 27.661;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Waltti', href: 'https://waltti.fi/' },

  colors: {
    primary: '#FFC439',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'waltti-opas/waltti-logo.png',

  textLogo: false, // title text instead of logo img

  feedIds: ['Kotka', 'Kouvola'],

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
    address: 'Helsinki-Vantaan Lentoasema',
    lat: 60.317429,
    lon: 24.9690395,
  },

  defaultOrigins: [
    {
      icon: 'icon-icon_bus',
      label: 'Matkakeskus, Kouvola',
      lat: 60.866251,
      lon: 26.705328,
    },
    {
      icon: 'icon-icon_bus',
      label: 'Kotkan kauppatori',
      lat: 60.467348,
      lon: 26.945758,
    },
  ],

  footer: {
    content: [
      { label: `© Waltti ${walttiConfig.YEAR}` },
      {},
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
    ],
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tämän palvelun tarjoaa Waltti-opas reittisuunnittelua varten Waltti-opas alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Waltti-opas för reseplanering inom Waltti-opas region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Waltti-opas for route planning in Waltti-opas region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
});
