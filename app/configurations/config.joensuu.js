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
      about: 'Tämä on Joensuun kaupungin testi uudeksi reittioppaaksi Joensuun alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.',
      digitransit: 'Digitransit palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin reititystuote. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä.',
      datasources: 'Kartat, kadut, rakennukset, pysäkkisijainnit ym. tiedot tarjoaa © OpenStreetMap contributors ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan VRK:n rakennustietorekisteristä ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan HSL:n dev.hsl.fi/gtfs palvelimelta.',
    },

    sv: {
      about: 'This is a test service for Joensuu area route planning. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },

    en: {
      about: 'This is a test service for Joensuu area route planning. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },
  },
}, (objValue, srcValue) => {
  if (Array.isArray(srcValue)) { return srcValue; }
  if (Array.isArray(objValue)) { return objValue; }
  return undefined; // default merge
});
