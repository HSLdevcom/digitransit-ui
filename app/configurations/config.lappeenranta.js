/* eslint-disable */
import mergeWith from 'lodash/mergeWith';

const CONFIG = process.env.CONFIG || 'lappeenranta';
const APP_TITLE = 'reittiopas.lappeenranta.fi';
const APP_DESCRIPTION = '';

const walttiConfig = require('./waltti').default;

export default mergeWith({}, walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Lappeenranta', href: 'http://www.lappeenranta.fi/' },

  colors: {
    primary: '#7AB92A',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  textLogo: true, // title text instead of logo img

  favicon: './sass/themes/lappeenranta/bussi_fin.jpeg',

  feedIds: ['Lappeenranta'],

  searchParams: {
    'boundary.rect.min_lat': 61.016901,
    'boundary.rect.max_lat': 61.102794,
    'boundary.rect.min_lon': 28.030938,
    'boundary.rect.max_lon': 28.329905,
  },

  areaPolygon: [[28.031, 61.017], [28.031, 61.1028], [28.33, 61.1028], [28.33, 61.017]],

  defaultEndpoint: {
    address: 'Oleksin ja Koulukadun risteys',
    lat: 61.059097,
    lon: 28.185720,
  },

  defaultOrigins: [
    { icon: 'icon-icon_city', label: 'Oleksi/Koulukatu', lat: 61.059097, lon: 28.185720 },
    { icon: 'icon-icon_rail', label: 'Matkakeskus', lat: 61.0483, lon: 28.1945 },
    { icon: 'icon-icon_school', label: 'Lappeenrannan teknillinen yliopisto', lat: 61.065, lon: 28.0949 },
  ],


  footer: {
    content: [
      { label: (function () { return `© Lappeenranta ${(1900 + new Date().getYear())}`; }()) },
      {},
      { name: 'footer-feedback', nameEn: 'Send feedback', type: 'feedback', icon: 'icon-icon_speech-bubble' },
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  aboutThisService: {
    fi: {
      about: 'Tämän palvelun tarjoaa Lappeenrannan kaupungin joukkoliikenne joukkoliikenteen reittisuunnittelua varten Lappeenrannan paikallisliikenteen alueella. Palvelu perustuu Digitransit palvelualustaan.',
    },

    sv: {
      about: 'Den här tjänsten erbjuds av Lappeenrannan kaupungin joukkoliikenne för lokal reseplanering inom Lappeenranta region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
    },

    en: {
      about: 'This service is provided by Lappeenrannan kaupungin joukkoliikenne for local route planning in Lappenranta region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
    },
  },

}, (objValue, srcValue) => {
  if (Array.isArray(srcValue)) { return srcValue; }
  if (Array.isArray(objValue)) { return objValue; }
  return undefined; // default merge
});
