const CONFIG = process.env.CONFIG || 'matka';
const APP_DESCRIPTION = 'Liikenneviraston Matka.fi–palvelu.';

export default {
  CONFIG,

  title: 'Reittiopas',

  contactName: {
    sv: 'Livin',
    fi: 'Livin',
    default: "FTA's",
  },

  availableLanguages: ['fi', 'sv', 'en'],
  defaultLanguage: 'fi',

  appBarLink: { name: 'Liikennevirasto', href: 'http://www.liikennevirasto.fi/liikennejarjestelma/henkiloliikenne/joukkoliikenteen-palvelut/informaatiopalvelut/liikkujan-infopalvelut' },

  socialMedia: {
    title: 'Matka.fi',
    description: APP_DESCRIPTION,
    locale: 'fi_FI',

    twitter: {
      site: '@hsldevcom',
    },
  },

  meta: {
    description: APP_DESCRIPTION,
    keywords: 'reitti,reitit,opas,reittiopas,joukkoliikenne',
  },

  footer: {
    content: [
      { label: (function () { return `© Liikennevirasto ${(1900 + new Date().getYear())}`; }()) },
      {},
      { name: 'footer-feedback', nameEn: 'Send feedback', href: 'http://www.liikennevirasto.fi/liikennejarjestelma/henkiloliikenne/joukkoliikenteen-palvelut/informaatiopalvelut/liikkujan-infopalvelut/matka.fi-palautesivu', icon: 'icon-icon_speech-bubble' },
      { name: 'about-this-service', nameEn: 'About this service', href: 'http://www.liikennevirasto.fi/liikennejarjestelma/henkiloliikenne/joukkoliikenteen-palvelut/informaatiopalvelut/liikkujan-infopalvelut/tietoja-matka.fi-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  shouldShowIntro: true,

  /* eslint-disable max-len*/
  aboutThisService: {
    fi: {
      about: 'Tämän palvelun tarjoaa Liikennevirasto joukkoliikenteen reittisuunnittelua varten koko Suomen alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan. Reittiehdotukset perustuvat arvioituihin ajoaikoihin. Ehdotetun yhteyden toteutumista ei voida kuitenkaan taata. Liikennevirasto ei korvaa kulkuyhteyden toteutumatta jäämisestä mahdollisesti aiheutuvia vahinkoja.',
      digitransit: 'Digitransit palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin ratkaisu, jonka taustalla toimii mm. OpenTripPlanner. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä.',
      datasources: 'Kartat, kadut, rakennukset, pysäkkisijainnit ym. tiedot tarjoaa © OpenStreetMap contributors ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan VRK:n rakennustietorekisteristä ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan mm. Liikenneviraston valtakunnallisesta joukkoliikenteen tietokannasta.',
    },

    sv: {
      about: 'Den här tjänsten erbjuds av Trafikverket för reseplanering inom hela Finland. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
      digitransit: 'Digitransit-plattformen är en öppen programvara utvecklad av HRT och Trafikverket, som bl.a. stödjer sig på OpenTripPlanner. Källkoden distribueras under EUPL v1.2 och AGPLv3 licenserna.',
      datasources: 'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors och laddas ned från Geofabrik-tjänsten. Addressinformation hämtas från BRC:s byggnadsinformationsregister och laddas ned från OpenAddresses-tjänsten. Kollektivtrafikens rutter och tidtabeller hämtas bl.a. från Trafikverkets landsomfattande kollektivtrafiksdatabas.',
    },

    en: {
      about: 'This service is provided by Finnish Transport Agency for journey planning and information in Finland. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL and Finnish Transport Agency, built on top of e.g. OpenTripPlanner. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from Finnish Transport Agency's national public transit database.",
    },
  },
  /* eslint-enable max-len*/

  staticMessages: [],
};
