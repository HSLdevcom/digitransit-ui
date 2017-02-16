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
      digitransit: 'Digitransit palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin reititystuote. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä.',
      datasources: 'Kartat, kadut, rakennukset, pysäkkisijainnit ym. tiedot tarjoaa © OpenStreetMap contributors ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan VRK:n rakennustietorekisteristä ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan HSL:n dev.hsl.fi/gtfs palvelimelta.',
    },

    sv: {
      about: 'Den här tjänsten erbjuds av __Theme__ för reseplanering inom __Theme__ region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
      digitransit: 'Digitransit-plattformen är en öppen programvara utvecklad av HRT och Trafikverket. Källkoden distribueras under EUPL v1.2 och AGPLv3 licenserna. Du är välkommen att delta i utvecklandet av plattformen. Mer information hittar du på addressen digitransit.fi.',
      datasources: 'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors och hämtas från Geofabrik-tjänsten. Addressinformation hämtas från BRC:s byggnadsinformationsregister och hämtas från OpenAddresses-tjänsten. Kollektivtrafikens rutter och tidtabeller hämtas från HRT:s tjänst dev.hsl.fi/gtfs.',
    },

    en: {
      about: 'This service is provided by __Theme__ for route planning in __Theme__ region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },
  },

}, (objValue, srcValue) => {
  if (Array.isArray(srcValue)) { return srcValue; }
  if (Array.isArray(objValue)) { return objValue; }
  return undefined; // default merge
});
