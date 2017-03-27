/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = '__theme__';
const APP_TITLE = 'Uusi Reittiopas';
const APP_DESCRIPTION = 'Uusi Reittiopas - __theme__';

const walttiConfig = require('./waltti').default;

const minLat = 60;
const maxLat = 70;
const minLon = 20;
const maxLon = 31;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: '__Theme__', href: 'http://www.__theme__.fi/' },

  colors: {
    primary: '__color__',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  textLogo: __textlogo__, // title text instead of logo img

  feedIds: ['__Theme__'],

  searchParams: {
    'boundary.rect.min_lat': minLat,
    'boundary.rect.max_lat': maxLat,
    'boundary.rect.min_lon': minLon,
    'boundary.rect.max_lon': maxLon,
  },

  areaPolygon: [[minLon, minLat], [minLon, maxLat], [maxLon, maxLat], [maxLon, minLat]],

  defaultEndpoint: {
    address: '__Theme__',
    lat: 0.5 * (minLat + maxLat),
    lon: 0.5 * (minLon + maxLon),
  },

  defaultOrigins: [
    { icon: 'icon-icon_bus', label: 'Linja-autoasema, __Theme__', lat: 63, lon: 27 },
  ],

  footer: {
    content: [
      { label: (function () { return `© __Theme__ ${(1900 + new Date().getYear())}`; }()) },
      {},
      { name: 'footer-feedback', nameEn: 'Send feedback', type: 'feedback', icon: 'icon-icon_speech-bubble' },
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: ['Tämän palvelun tarjoaa __Theme__ reittisuunnittelua varten __Theme__ alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.'],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: ['Den här tjänsten erbjuds av __Theme__ för reseplanering inom __Theme__ region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.'],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: ['This service is provided by __Theme__ for route planning in __Theme__ region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.'],
      },
    ],
  },

});
