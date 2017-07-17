const CONFIG = 'matka';
const APP_DESCRIPTION = 'Liikenneviraston Matka.fi–palvelu.';
const APP_TITLE = 'Matka.fi';

export default {
  CONFIG,

  contactName: {
    sv: 'Livin',
    fi: 'Livin',
    default: "FTA's",
  },

  availableLanguages: ['fi', 'sv', 'en'],
  defaultLanguage: 'fi',

  appBarLink: { name: 'Liikennevirasto', href: 'http://www.liikennevirasto.fi/liikennejarjestelma/henkiloliikenne/joukkoliikenteen-palvelut/informaatiopalvelut/liikkujan-infopalvelut' },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    locale: 'fi_FI',
  },

  title: APP_TITLE,

  favicon: './sass/themes/hsl/icon_favicon-matkafi.svg',

  sprites: 'svg-sprite.default.svg',

  meta: {
    description: APP_DESCRIPTION,
    keywords: 'reitti,reitit,opas,reittiopas,joukkoliikenne',
  },

  footer: {
    content: [
      { label: (function () { return `© Liikennevirasto ${(1900 + new Date().getYear())}`; }()) },
      {},
      { name: 'footer-feedback', nameEn: 'Submit feedback', href: 'http://www.liikennevirasto.fi/liikennejarjestelma/henkiloliikenne/joukkoliikenteen-palvelut/informaatiopalvelut/liikkujan-infopalvelut/matka.fi-palautesivu', icon: 'icon-icon_speech-bubble' },
      { name: 'about-this-service', nameEn: 'About this service', href: 'http://www.liikennevirasto.fi/liikennejarjestelma/henkiloliikenne/joukkoliikenteen-palvelut/informaatiopalvelut/liikkujan-infopalvelut/tietoja-matka.fi-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  shouldShowIntro: false,
  redirectReittiopasParams: true,

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: ['Tämän palvelun tarjoaa Liikennevirasto joukkoliikenteen reittisuunnittelua varten koko Suomen alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan. Reittiehdotukset perustuvat arvioituihin ajoaikoihin. Ehdotetun yhteyden toteutumista ei voida kuitenkaan taata. Liikennevirasto ei korvaa kulkuyhteyden toteutumatta jäämisestä mahdollisesti aiheutuvia vahinkoja.'],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: ['Den här tjänsten erbjuds av Trafikverket för reseplanering inom hela Finland. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.'],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: ['This service is provided by Finnish Transport Agency for journey planning and information in Finland. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.'],
      },
    ],
  },

  staticMessages: [],
};
