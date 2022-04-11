/* eslint-disable prefer-template */
import { BIKEAVL_BIKES, BIKEAVL_WITHMAX } from '../util/citybikes';
import HSLConfig from './config.hsl';
import TurkuConfig from './config.turku';
import LappeenrantaConfig from './config.lappeenranta';
import KuopioConfig from './config.kuopio';

const CONFIG = 'matka';
const APP_DESCRIPTION = 'Matka.fi–palvelu.';
const APP_TITLE = 'Matka.fi';
const YEAR = 1900 + new Date().getYear();

// route timetable data needs to be up-to-date before this is enabled
// const HSLRouteTimetable = require('./timetableConfigUtils').default.HSLRoutes;

export default {
  CONFIG,
  OTPTimeout: process.env.OTP_TIMEOUT || 30000,
  URL: {
    FONT:
      'https://digitransit-prod-cdn-origin.azureedge.net/matka-fonts/roboto/roboto+montserrat.css',
  },

  mainMenu: {
    stopMonitor: {
      show: true,
      url: 'https://matkamonitori.digitransit.fi/createview',
    },
  },

  contactName: {
    sv: 'Livin',
    fi: 'Livin',
    default: "FTA's",
  },

  availableLanguages: ['fi', 'sv', 'en'],
  defaultLanguage: 'fi',

  appBarLink: {
    name: 'Traficom',
    href:
      'https://www.traficom.fi/fi/liikenne/liikennejarjestelma/joukkoliikenteen-informaatiopalvelut',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    locale: 'fi_FI',
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'matka/matka-logo.svg',

  favicon: './app/configurations/images/matka/favicon.svg',

  colors: {
    primary: '#026273',
    iconColors: {
      'mode-airplane': '#0046AD',
      'mode-bus': '#007ac9',
      'mode-tram': '#5E7921',
      'mode-metro': '#CA4000',
      'mode-rail': '#8E5EA0',
      'mode-ferry': '#247C7B',
      'mode-ferry-pier': '#666666',
      'mode-citybike': '#FCBC19',
    },
  },
  feedIds: [
    'MATKA',
    'HSL',
    'LINKKI',
    'tampere',
    'lautta',
    'OULU',
    'MatkahuoltoKainuu',
    'MatkahuoltoSavo',
    'MatkahuoltoKanta',
    'MatkahuoltoKarjala',
    'MatkahuoltoKeski',
    'MatkahuoltoKyme',
    'MatkahuoltoLappi',
    'MatkahuoltoPohjanmaa',
    'MatkahuoltoSatakunta',
    'MatkahuoltoVakka',
    'MatkahuoltoVantaa',
    'MatkahuoltoVarsinais',
    'digitraffic',
  ],

  meta: {
    description: APP_DESCRIPTION,
    keywords: `reitti,reitit,opas,reittiopas,joukkoliikenne`,
  },

  routeTimetables: {
    // route timetable data needs to be up-to-date before this is enabled
    //  HSL: HSLRouteTimetable,
  },

  menu: {
    copyright: { label: `© Matka.fi ${YEAR}` },
    content: [
      {
        name: 'about-service-feedback',
        href: 'http://www.matka.fi',
      },
      {
        name: 'accessibility-statement',
        href:
          'https://www.traficom.fi/fi/asioi-kanssamme/reittiopas/matkafi-reittioppaan-saavutettavuusseloste',
      },
      {
        name: 'about-these-pages',
        href: 'https://traficom.fi/fi/tietoa-matkafi-sivustosta',
      },
    ],
  },

  redirectReittiopasParams: true,
  map: { minZoom: 5 },
  suggestBikeMaxDistance: 2000000,

  cityBike: {
    networks: {
      smoove: {
        enabled: HSLConfig.cityBike.networks.smoove.enabled,
        season: HSLConfig.cityBike.networks.smoove.season,
        capacity: BIKEAVL_WITHMAX,
        icon: 'citybike',
        name: {
          fi: 'Helsinki ja Espoo',
          sv: 'Helsingfors och Esbo',
          en: 'Helsinki and Espoo',
        },
        type: 'citybike',
        url: {
          fi: 'https://www.hsl.fi/kaupunkipyorat/helsinki',
          sv: 'https://www.hsl.fi/sv/stadscyklar/helsingfors',
          en: 'https://www.hsl.fi/en/citybikes/helsinki',
        },
      },
      vantaa: {
        enabled: HSLConfig.cityBike.networks.vantaa.enabled,
        season: HSLConfig.cityBike.networks.vantaa.season,
        capacity: BIKEAVL_WITHMAX,
        icon: 'citybike-secondary',
        name: {
          fi: 'Vantaa',
          sv: 'Vanda',
          en: 'Vantaa',
        },
        type: 'citybike',
        url: {
          fi: 'https://www.hsl.fi/kaupunkipyorat/vantaa',
          sv: 'https://www.hsl.fi/sv/stadscyklar/vantaa',
          en: 'https://www.hsl.fi/en/citybikes/vantaa',
        },
      },
      turku: {
        enabled: TurkuConfig.cityBike.networks.turku.enabled,
        season: TurkuConfig.cityBike.networks.turku.season,
        capacity: BIKEAVL_WITHMAX,
        icon: 'citybike',
        name: {
          fi: 'Turku',
          sv: 'Åbo',
          en: 'Turku',
        },
        type: 'citybike',
        url: {
          fi: 'https://www.foli.fi/kaupunkipyorat',
          sv: 'https://www.foli.fi/sv/stadscyklar',
          en: 'https://www.foli.fi/en/citybikes',
        },
      },
      vilkku: {
        enabled: KuopioConfig.cityBike.networks.vilkku.enabled,
        season: KuopioConfig.cityBike.networks.vilkku.season,
        capacity: BIKEAVL_BIKES,
        icon: 'citybike',
        name: {
          fi: 'Vilkku',
          sv: 'Vilkku',
          en: 'Vilkku',
        },
        type: 'citybike',
        url: {
          fi: 'https://kaupunkipyorat.kuopio.fi/',
          sv: 'https://kaupunkipyorat.kuopio.fi/?lang=2',
          en: 'https://kaupunkipyorat.kuopio.fi/?lang=2',
        },
      },
      donkey_lappeenranta: {
        enabled:
          LappeenrantaConfig.cityBike.networks.donkey_lappeenranta.enabled,
        season: LappeenrantaConfig.cityBike.networks.donkey_lappeenranta.season,
        capacity: BIKEAVL_WITHMAX,
        icon: 'citybike',
        name: {
          fi: 'Lappeenranta',
          sv: 'Vilmanstrand',
          en: 'Lappeenranta',
        },
        type: 'citybike',
        url: {
          fi: 'https://kaakau.fi/lappeenranta/',
          sv: 'https://kaakau.fi/lappeenranta/?lang=sv',
          en: 'https://kaakau.fi/lappeenranta/?lang=en',
        },
      },
    },
  },

  transportModes: {
    citybike: {
      availableForSelection: true,
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
  staticMessagesUrl: process.env.STATIC_MESSAGE_URL,

  showNearYouButtons: true,
  nearYouModes: [
    'bus',
    'tram',
    'subway',
    'rail',
    'ferry',
    'citybike',
    'airplane',
  ],
  useAlternativeNameForModes: ['rail'],
  includeCarSuggestions: true,

  sourceForAlertsAndDisruptions: {
    HSL: {
      fi: 'Helsingin seutu',
      sv: 'Helsingforsregion',
      en: 'Helsinki region',
    },
    tampere: {
      fi: 'Tampereen seutu',
      sv: 'Tammerforsregion',
      en: 'Tampere region',
    },
    LINKKI: {
      fi: 'Jyväskylän seutu',
      sv: 'Jyväskyläregion',
      en: 'Jyväskylä region',
    },
    lautta: {
      fi: 'Lautat',
      sv: 'Färja',
      en: 'Ferries',
    },
    OULU: {
      fi: 'Oulu',
      sv: 'Uleåborg',
      en: 'Oulu',
    },
  },
};
