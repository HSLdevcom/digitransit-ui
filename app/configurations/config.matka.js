/* eslint-disable prefer-template */
import { BIKEAVL_WITHMAX, BIKEAVL_BIKES } from '../util/citybikes';
import HSLConfig from './config.hsl';
import TurkuConfig from './config.turku';
import LappeenrantaConfig from './config.lappeenranta';
import TampereConfig from './config.tampere';
import KuopioConfig from './config.kuopio';

const CONFIG = 'matka';
const APP_DESCRIPTION = 'Matka.fi–palvelu.';
const APP_TITLE = 'Matka.fi';
const YEAR = 1900 + new Date().getYear();

const HSLParkAndRideUtils = require('../util/ParkAndRideUtils').default.HSL;

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
    countrySelection: ['estonia'],
  },

  contactName: {
    sv: 'Livin',
    fi: 'Livin',
    default: "FTA's",
  },

  availableLanguages: ['fi', 'sv', 'en'],
  defaultLanguage: 'fi',
  hideAppBarLink: true,

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    locale: 'fi_FI',
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'matka/matka-logo.svg',

  favicon: './app/configurations/images/matka/matka-favicon.svg',

  colors: {
    primary: '#002c74',
    iconColors: {
      'mode-airplane': '#0046AD',
      'mode-bus': '#007ac9',
      'mode-tram': '#5E7921',
      'mode-metro': '#CA4000',
      'mode-rail': '#8E5EA0',
      'mode-ferry': '#247C7B',
      'mode-ferry-pier': '#666666',
      'mode-citybike': '#FCBC19',
      'mode-citybike-secondary': '#333333',
    },
  },
  feedIds: [
    'MATKA',
    'HSL',
    'LINKKI',
    'tampere',
    'OULU',
    'digitraffic',
    'Rauma',
    'Hameenlinna',
    'Kotka',
    'Kouvola',
    'Lappeenranta',
    'Mikkeli',
    'Vaasa',
    'Joensuu',
    'FOLI',
    'Lahti',
    'Kuopio',
    'Rovaniemi',
    'Kajaani',
    'Salo',
    'Pori',
    'Raasepori',
    'VARELY',
  ],

  additionalFeedIds: {
    estonia: ['Vikingline', 'Viro'],
  },

  additionalSearchParams: {
    default: {
      'boundary.country': 'FIN',
    },
    estonia: {
      'boundary.country': 'EST',
    },
  },

  feedIdFiltering: true,

  stopSearchFilter: stop => {
    const props = stop.properties;
    if (
      props?.id?.includes('GTFS:HSL') &&
      props?.addendum?.GTFS?.modes?.includes('RAIL')
    ) {
      return false;
    }
    return true;
  },

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
        name: 'traficom',
        href:
          'https://www.traficom.fi/fi/liikenne/liikennejarjestelma/joukkoliikenteen-informaatiopalvelut',
      },
      {
        name: 'about-service-feedback',
        href: 'http://www.matka.fi',
      },
      {
        name: 'accessibility-statement',
        href: {
          fi: 'https://www.digitransit.fi/accessibility',
          sv: 'https://www.digitransit.fi/accessibility',
          en: 'https://www.digitransit.fi/en/accessibility',
        },
      },
      {
        name: 'about-these-pages',
        href: 'https://traficom.fi/fi/tietoa-matkafi-sivustosta',
      },
    ],
  },

  redirectReittiopasParams: true,
  map: {
    minZoom: 5,
    areaBounds: {
      corner1: [70.25, 32.25],
      corner2: [55.99, 17.75],
    },
  },
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
      seatcode_tampere: {
        capacity: BIKEAVL_WITHMAX,
        enabled: true,
        season: TampereConfig.cityBike.networks.seatcode_tampere.season,
        icon: 'citybike',
        name: {
          fi: 'Tampere',
          sv: 'Tammerfors',
          en: 'Tampere',
        },
        type: 'citybike',
        url: {
          fi: 'https://www.nysse.fi/kaupunkipyorat',
          sv: 'https://www.nysse.fi/en/city-bikes.html',
          en: 'https://www.nysse.fi/en/city-bikes.html',
        },
      },
      turku: {
        enabled: TurkuConfig.cityBike.networks.donkey_turku.enabled,
        season: TurkuConfig.cityBike.networks.donkey_turku.season,
        capacity: BIKEAVL_WITHMAX,
        icon: 'citybike',
        name: {
          fi: 'Turku',
          sv: 'Åbo',
          en: 'Turku',
        },
        type: 'citybike',
        url: {
          fi: 'https://www.foli.fi/fi/aikataulut-ja-reitit/fölifillarit',
          sv: 'https://www.foli.fi/sv/fölicyklar',
          en: 'https://www.foli.fi/en/föli-bikes',
        },
      },
      freebike_kuopio: {
        enabled: KuopioConfig.cityBike.networks.freebike_kuopio.enabled,
        season: KuopioConfig.cityBike.networks.freebike_kuopio.season,
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
      donkey_kotka: {
        enabled: true,
        season: {
          // 14.4. - 31.10.
          start: new Date(new Date().getFullYear(), 3, 14),
          end: new Date(new Date().getFullYear(), 10, 1),
        },
        capacity: BIKEAVL_WITHMAX,
        icon: 'citybike',
        name: {
          fi: 'Kotkan-Haminan seutu',
          sv: 'Kotka-Fredrikshamnsregionen',
          en: 'Kotka-Hamina region',
        },
        type: 'citybike',
        url: {
          fi: 'https://kaakau.fi/kotka/',
          sv: 'https://kaakau.fi/kotka/?lang=sv',
          en: 'https://kaakau.fi/kotka/?lang=en',
        },
        returnInstructions: {
          fi: 'https://kaakau.fi/ohjeet/pyoran-palauttaminen/',
          sv: 'https://kaakau.fi/ohjeet/pyoran-palauttaminen/',
          en: 'https://kaakau.fi/ohjeet/pyoran-palauttaminen/',
        },
      },
      donkey_kouvola: {
        enabled: true,
        season: {
          // 20.4. - 31.10.
          start: new Date(new Date().getFullYear(), 3, 20),
          end: new Date(new Date().getFullYear(), 10, 1),
        },
        capacity: BIKEAVL_WITHMAX,
        icon: 'citybike',
        name: {
          fi: 'Kouvola',
          sv: 'Kouvola',
          en: 'Kouvola',
        },
        type: 'citybike',
        url: {
          fi: 'https://kaakau.fi/kouvola/',
          sv: 'https://kaakau.fi/kouvola/?lang=sv',
          en: 'https://kaakau.fi/kouvola/?lang=en',
        },
        returnInstructions: {
          fi: 'https://kaakau.fi/ohjeet/pyoran-palauttaminen/',
          sv: 'https://kaakau.fi/ohjeet/pyoran-palauttaminen/',
          en: 'https://kaakau.fi/ohjeet/pyoran-palauttaminen/',
        },
      },
    },
  },

  getAutoSuggestIcons: {
    citybikes: station => {
      if (
        station.properties.source === 'citybikesdonkey_hamina' ||
        station.properties.source === 'vantaa'
      ) {
        return ['citybike-stop-digitransit-secondary', '#FCBC19'];
      }
      return ['citybike-stop-digitransit', '#FCBC19'];
    },
  },

  transportModes: {
    citybike: {
      availableForSelection: true,
    },
  },

  useRealtimeTravellerCapacities: true,

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
  narrowNearYouButtons: true,
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

  showVehiclesOnStopPage: false,
  showVehiclesOnSummaryPage: false,

  includeCarSuggestions: true,
  includeParkAndRideSuggestions: true,
  // Include both bike and park and bike and public
  includePublicWithBikePlan: false,
  // Park and ride and car suggestions separated into two switches
  separatedParkAndRideSwitch: true,
  showBikeAndParkItineraries: true,

  parkingAreaSources: ['liipi'],

  parkAndRide: {
    showParkAndRide: false,
    parkAndRideMinZoom: 13,
    pageContent: {
      default: HSLParkAndRideUtils,
    },
  },

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
    OULU: {
      fi: 'Oulu',
      sv: 'Uleåborg',
      en: 'Oulu',
    },
    Rauma: {
      fi: 'Rauma',
      sv: 'Raumo',
      en: 'Rauma',
    },
    Hameenlinna: {
      fi: 'Hämeenlinna',
      sv: 'Tavastehus',
      en: 'Hämeenlinna',
    },
    Kotka: {
      fi: 'Kotkan seutu',
      sv: 'Kotkaregion',
      en: 'Kotka region',
    },
    Kouvola: {
      fi: 'Kouvola',
      sv: 'Kouvola',
      en: 'Kouvola',
    },
    Lappeenranta: {
      fi: 'Lappeenranta',
      sv: 'Villmanstrand',
      en: 'Lappeenranta',
    },
    Mikkeli: {
      fi: 'Mikkeli',
      sv: 'S:t Michel',
      en: 'Mikkeli',
    },
    Vaasa: {
      fi: 'Vaasan seutu',
      sv: 'Vasaregion',
      en: 'Vaasa region',
    },
    Joensuu: {
      fi: 'Joensuun seutu',
      sv: 'Joensuuregion',
      en: 'Joensuu region',
    },
    FOLI: {
      fi: 'Turun seutu',
      sv: 'Åboregion',
      en: 'Turku region',
    },
    Lahti: {
      fi: 'Lahden seutu',
      sv: 'Lahtisregion',
      en: 'Lahti region',
    },
    Kuopio: {
      fi: 'Kuopion seutu',
      sv: 'Kuopioregion',
      en: 'Kuopio region',
    },
    Rovaniemi: {
      fi: 'Rovaniemi',
      sv: 'Rovaniemi',
      en: 'Rovaniemi',
    },
    Kajaani: {
      fi: 'Kajaani',
      sv: 'Kajana',
      en: 'Kajaani',
    },
    Salo: {
      fi: 'Salo',
      sv: 'Salo',
      en: 'Salo',
    },
    Pori: {
      fi: 'Pori',
      sv: 'Björneborg',
      en: 'Pori',
    },
    Raasepori: {
      fi: 'Raasepori',
      sv: 'Raseborg',
      en: 'Raasepori',
    },
    VARELY: {
      fi: 'Varsinais-Suomi',
      sv: 'Egentliga Finland',
      en: 'Varsinais-Suomi',
    },
  },
  stopCard: {
    header: {
      virtualMonitorBaseUrl: 'https://matkamonitori.digitransit.fi/',
    },
  },
  // Notice! Turning on this setting forces the search for car routes.
  showCO2InItinerarySummary: true,
};
