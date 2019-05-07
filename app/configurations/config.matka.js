/* eslint-disable prefer-template */
const CONFIG = 'matka';
const APP_DESCRIPTION = 'Matka.fi–palvelu.';
const APP_TITLE = 'Matka.fi';
const YEAR = 1900 + new Date().getYear();

// route timetable data needs to be up-to-date before this is enabled
// const HSLRouteTimetable = require('./timetableConfigUtils').default.HSLRoutes;

export default {
  CONFIG,
  OTPTimeout: process.env.OTP_TIMEOUT || 30000,

  contactName: {
    sv: 'Livin',
    fi: 'Livin',
    default: "FTA's",
  },

  availableLanguages: ['fi', 'sv', 'en'],
  defaultLanguage: 'fi',

  appBarLink: {
    name: 'Traficom',
    href: 'https://www.traficom.fi/fi/joukkoliikenteen-informaatiopalvelut',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    locale: 'fi_FI',
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'matka/matka-logo.png',

  favicon: './app/configurations/images/hsl/icon_favicon-matkafi.svg',

  feedIds: ['MATKA', 'HSL', 'tampere', 'LINKKI', 'lautta', 'OULU'],

  meta: {
    description: APP_DESCRIPTION,
    keywords: 'reitti,reitit,opas,reittiopas,joukkoliikenne',
  },

  routeTimetables: {
    // route timetable data needs to be up-to-date before this is enabled
    //  HSL: HSLRouteTimetable,
  },

  footer: {
    content: [
      { label: `© Traficom ${YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href:
          'http://www.liikennevirasto.fi/liikennejarjestelma/henkiloliikenne/joukkoliikenteen-palvelut/informaatiopalvelut/liikkujan-infopalvelut/matka.fi-palautesivu',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        href: 'https://www.traficom.fi/fi/joukkoliikenteen-informaatiopalvelut',
        icon: 'icon-icon_info',
      },
    ],
  },

  redirectReittiopasParams: true,

  cityBike: {
    showCityBikes: true,
    networks: {
      samocat: {
        icon: 'scooter',
        name: {
          fi: 'Vuosaari',
          sv: 'Nordsjö',
          en: 'Vuosaari',
        },
        type: 'scooter',
        url: {
          fi: 'https://www.hsl.fi/potkulaudat',
          sv: 'https://www.hsl.fi/sv/stadssparkcyklar',
          en: 'https://www.hsl.fi/en/cityscooters',
        },
      },
      smoove: {
        icon: 'citybike',
        name: {
          fi: 'Helsinki ja Espoo',
          sv: 'Helsingfors och Esbo',
          en: 'Helsinki and Espoo',
        },
        type: 'citybike',
        url: {
          fi: 'https://www.hsl.fi/kaupunkipyorat',
          sv: 'https://www.hsl.fi/sv/stadscyklar',
          en: 'https://www.hsl.fi/en/citybikes',
        },
      },
      /*
      vantaa: {
        icon: 'citybike-secondary',
        name: {
          fi: 'Vantaa',
          sv: 'Vanda',
          en: 'Vantaa',
        },
        type: 'citybike',
        url: {
          fi: 'https://www.hsl.fi/kaupunkipyorat',
          sv: 'https://www.hsl.fi/sv/stadscyklar',
          en: 'https://www.hsl.fi/en/citybikes',
        },
      },
      */
    },
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tämän palvelun tarjoaa Traficomin joukkoliikenteen reittisuunnittelua varten koko Suomen alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan. Reittiehdotukset perustuvat arvioituihin ajoaikoihin. Ehdotetun yhteyden toteutumista ei voida kuitenkaan taata. Kulkuyhteyden toteutumatta jäämisestä mahdollisesti aiheutuvia vahinkoja ei korvata.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Traficom för reseplanering inom hela Finland. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Traficom for journey planning and information in Finland. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
  staticMessagesUrl: 'https://beta.vayla.fi/joukkoliikenne/yleisviesti/',
};
