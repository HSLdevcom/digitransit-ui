/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'vaasa';
const APP_TITLE = 'Vaasan reittiopas';
const APP_DESCRIPTION = '';

const walttiConfig = require('./config.waltti').default;

const minLat = 63.005;
const maxLat = 63.152;
const minLon = 21.527;
const maxLon = 22.170;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Vaasa', href: 'https://www.vaasa.fi/' },

  colors: {
    primary: '#000a8c',
    iconColors: {
      'mode-bus': '#000a8c',
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,

    twitter: {
      site: '@vaasavasa',
    },
  },

  title: APP_TITLE,

  textLogo: false,

  logo: 'vaasa/vaasa_vasa_rgb_nega_v01.png',

  feedIds: ['Vaasa'],

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
    address: 'Kauppatori',
    lat: 63.096,
    lon: 21.616,
  },

  menu: {
    copyright: { label: `© Vaasa ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'menu-feedback',
        nameEn: 'Submit feedback',
        href: 'https://kartta.vaasa.fi/eFeedback',
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
          'Tämän palvelun tarjoaa Vaasa reittisuunnittelua varten Vaasa alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Vaasa för reseplanering inom Vaasa region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Vaasa for route planning in Vaasa region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },

  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnSummaryPage: true,
});
