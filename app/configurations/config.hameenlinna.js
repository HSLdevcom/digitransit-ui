/* eslint-disable */
import mergeWith from 'lodash/mergeWith';

const CONFIG = process.env.CONFIG || 'hameenlinna';
const APP_TITLE = 'reittiopas.hameenlinna.fi';
const APP_DESCRIPTION = '';

const walttiConfig = require('./waltti').default;

export default mergeWith({}, walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Hameenlinna', href: 'http://www.hameenlinna.fi/joukkoliikenne/' },

  colors: {
    primary: '#F76013',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    twitter: {
      site: '@hmlkaupunki',
    }
  },

  title: APP_TITLE,

  textLogo: true, // title text instead of logo img

  favicon: './sass/themes/hameenlinna/favicon.png',

  feedIds: ['Hameenlinna', 'HameenlinnaEly'],

  searchParams: {
    'boundary.rect.min_lat': 60.75705,
    'boundary.rect.max_lat': 61.30156,
    'boundary.rect.min_lon': 23.73155,
    'boundary.rect.max_lon': 25.28315,
  },

  areaPolygon: [[23.73155, 60.75705], [23.73155, 61.30156], [25.28315, 61.30156], [25.28315, 60.75705]],

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
      { name: 'footer-feedback', nameEn: 'Send feedback', type: 'feedback', icon: 'icon-icon_speech-bubble' },
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  aboutThisService: {
    fi: {
      about: 'Tämän palvelun tarjoaa Hämeenlinnan seudun joukkoliikenne reittisuunnittelua varten Hattulan, Hämeenlinnan ja Janakkalan alueella. Palvelu sisältää paikallisen ja seudullisen joukkoliikenteen reitit ja aikataulut. Palvelu perustuu Digitransit palvelualustaan.',
      digitransit: 'Digitransit palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin reititystuote. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä.',
      datasources: 'Kartat, kadut, rakennukset, pysäkkisijainnit ym. tiedot tarjoaa © OpenStreetMap contributors ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan VRK:n rakennustietorekisteristä ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan HSL:n dev.hsl.fi/gtfs palvelimelta.',
    },

    sv: {
      about: 'This is a test service for Hameenlinna area route planning. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },

    en: {
      about: 'This is a test service for Hameenlinna area route planning. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },
  },

}, (objValue, srcValue) => {
  if (Array.isArray(srcValue)) { return srcValue; }
  if (Array.isArray(objValue)) { return objValue; }
  return undefined; // default merge
});
