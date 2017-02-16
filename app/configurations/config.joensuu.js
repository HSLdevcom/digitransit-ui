import mergeWith from 'lodash/mergeWith';

const CONFIG = process.env.CONFIG || 'joensuu';
const APP_TITLE = 'Joensuun reittiopas';
const APP_DESCRIPTION = 'Joensuun uusi reittiopas';

const walttiConfig = require('./waltti').default;

export default mergeWith({}, walttiConfig, {
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

  colors: {
    primary: '#5c4696',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  transportModes: {
    ferry: {
      availableForSelection: true,
      defaultValue: true,
    },
  },

  areaPolygon: [[29.2154, 62.2692], [29.2154, 62.9964], [31.0931, 62.9964], [31.0931, 62.2692]],

  footer: {
    content: [
      { label: (function () { return `© Joensuun kaupunki ${(1900 + new Date().getYear())}`; }()) },
      {},
      { name: 'footer-feedback', nameEn: 'Submit feedback', type: 'feedback', icon: 'icon-icon_speech-bubble' },
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  defaultEndpoint: {
    address: 'Keskusta, Joensuu',
    lat: 62.6024263,
    lon: 29.7569847,
  },
  defaultOrigins: [
    { icon: 'icon-icon_bus', label: 'Keskusta, Joensuu', lat: 62.6024263, lon: 29.7569847 },
    { icon: 'icon-icon_rail', label: 'Rautatieasema, Joensuu', lat: 62.5998886, lon: 29.77629661560059 },
    { icon: 'icon-icon_airplane', label: 'Lentoasema, Joensuu', lat: 62.65764959350609, lon: 29.61371183395386 },
  ],

  aboutThisService: {
    fi: {
      about: 'Tämäm palvelun tarjoaa Joensuun kaupunki joukkoliikenteen reittisuunnittelua varten Joensuun alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.',
    },

    sv: {
      about: 'Den här tjänsten erbjuds av Joensuu för reseplanering inom Joensuu region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
    },

    en: {
      about: 'This service is provided by Joensuu city for local route planning in Joensuu region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
    },
  },
}, (objValue, srcValue) => {
  if (Array.isArray(srcValue)) { return srcValue; }
  if (Array.isArray(objValue)) { return objValue; }
  return undefined; // default merge
});
