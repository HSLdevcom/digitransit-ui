const CONFIG = 'matka';
const APP_DESCRIPTION = 'Matka.fi–palvelu.';
const APP_TITLE = 'Matka.fi';
const YEAR = 1900 + new Date().getYear();

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
  staticMessagesUrl:
    'https://beta.liikennevirasto.fi/joukkoliikenne/yleisviesti/',
};
