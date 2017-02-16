/* eslint-disable */
import mergeWith from 'lodash/mergeWith';

const CONFIG = process.env.CONFIG || '__theme__';
const APP_TITLE = 'Uusi Reittiopas';
const APP_DESCRIPTION = 'Uusi Reittiopas - __theme__';

const walttiConfig = require('./waltti').default;

export default mergeWith({}, walttiConfig, {
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

  footer: {
    content: [
      { label: (function () { return `© __Theme__ ${(1900 + new Date().getYear())}`; }()) },
      {},
      { name: 'footer-feedback', nameEn: 'Send feedback', type: 'feedback', icon: 'icon-icon_speech-bubble' },
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  aboutThisService: {
    fi: {
      about: 'Tämän palvelun tarjoaa __Theme__ reittisuunnittelua varten __Theme__ alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.',
    },

    sv: {
      about: 'Den här tjänsten erbjuds av __Theme__ för reseplanering inom __Theme__ region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
    },

    en: {
      about: 'This service is provided by __Theme__ for route planning in __Theme__ region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
    },
  },

}, (objValue, srcValue) => {
  if (Array.isArray(srcValue)) { return srcValue; }
  if (Array.isArray(objValue)) { return objValue; }
  return undefined; // default merge
});
