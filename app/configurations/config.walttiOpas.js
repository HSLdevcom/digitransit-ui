/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'walttiOpas';
const APP_TITLE = 'Waltti-opas';
const APP_DESCRIPTION = 'Uusi Reittiopas - Waltti-opas';

const walttiConfig = require('./config.waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Waltti', href: 'https://waltti.fi/' },

  colors: {
    primary: '#5959a8',
    topBarColor: '#17083b',
    iconColors: {
      'mode-bus': '#5959a8',
    },
  },
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
      nearYouLabel: {
        fi: 'Bussit ja lähipysäkit kartalla',
        sv: 'Bussar och hållplatser på kartan',
        en: 'Buses and nearby stops on map',
      },
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'walttiOpas/waltti-logo.png',
  secondaryLogo: 'walttiOpas/waltti-logo-secondary.png',
  favicon: './app/configurations/images/walttiOpas/walttiOpas-favicon.png',

  feedIds: ['Salo', 'Kajaani'],

  defaultEndpoint: {
    address: 'Helsinki-Vantaan Lentoasema',
    lat: 60.317429,
    lon: 24.9690395,
  },

  menu: {
    copyright: { label: `© Waltti Solutions Oy ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'about-this-service',
        route: '/tietoja-palvelusta',
      },
      {
        name: 'accessibility-statement',
        href: {
          fi: 'https://www.digitransit.fi/accessibility',
          sv: 'https://www.digitransit.fi/accessibility',
          en: 'https://www.digitransit.fi/en/accessibility',
        },
      },
    ],
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Waltti-reittiopas on Waltti Solutions Oy:n tarjoama kansallisen tason reittiopaspalvelu. Palvelu paikantaa sinulle sijainnin ja kertoo lähimmät linjat, pysäkit, reitit ja aikataulutiedot. Se suodattaa tarpeettoman tiedon ja kertoo, miten sujuvimmin pääset perille. Reittiopas-palvelu toimii kaikilla päätelaitteilla, mutta on tehty palvelemaan erityisen hyvin mobiilikäyttäjiä. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Waltti-rutguide är en nationell reseplanera som erbjuds av Waltti Solutions Oy. Tjänsten lokaliserar din plats och visar de närmsta linjerna och hållplatserna samt rutter och tidtabeller. Tjänsten filtrerar onödig information och anger hur du lättast kommer dit du ska. Ruttguidetjänsten fungerar på alla dataterminaler men är särskilt ägnad att betjäna dem som använder mobilenheter. Tjänsten är baserad på Digitransit, som är riksomfattande serviceplattform för reseplanerare.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'Waltti Journey planner is a national journey planner offered by Waltti Solutions Oy. The service finds your location and tells you the closest lines, stops, routes and timetables. It filters out unnecessary information and tells you the smoothest way to get to your destination. The Journey planner service works on all devices but is designed to best serve mobile users. Service is built on Digitransit platform.',
        ],
      },
    ],
  },

  viaPointsEnabled: false,
  showVehiclesOnStopPage: true,
  showVehiclesOnItineraryPage: true,

  sourceForAlertsAndDisruptions: {
    Kajaani: {
      fi: 'Kajaani',
      sv: 'Kajana',
      en: 'Kajaani',
    },
    Salo: {
      fi: 'Salo',
      sv: 'Salo',
      en: 'Salo',
    }
  },

  useSearchPolygon: true,

  areaPolygon: [
    // Kajaani:
    [28.1, 63.8],
    [27.6, 63.9],
    [26.7, 64],
    [26.6, 64.5],
    [28.5, 64.5],
    [29.2, 64.1],
    [28.7, 63.9],
    [28.1, 63.8],
    // Salo:
    [22.84642, 60.51062],
    [23.11638, 60.57683],
    [23.20982, 60.58773],
    [23.30092, 60.58191],
    [23.39604, 60.54652],
    [23.49232, 60.59485],
    [23.51872, 60.59876],
    [23.49816, 60.53506],
    [23.66099, 60.47649],
    [23.71290, 60.49915],
    [23.73738, 60.49040],
    [23.71043, 60.45022],
    [23.79146, 60.45072],
    [23.78940, 60.38666],
    [23.72554, 60.30751],
    [23.63147, 60.25338],
    [23.65001, 60.20087],
    [23.36093, 60.14931],
    [23.14807, 60.10005],
    [22.98465, 60.06032],
    [22.95306, 59.99961],
    [22.85213, 59.99755],
    [22.84320, 60.02878],
    [22.79994, 60.02535],
    [22.78964, 60.05724],
    [22.83427, 60.06032],
    [22.88852, 60.14042],
    [22.85487, 60.17800],
    [22.90088, 60.24316],
    [22.85350, 60.26224],
    [22.87637, 60.30244],
    [22.84144, 60.33840],
    [22.81850, 60.37199],
    [22.84642, 60.51062]
  ],

  map: {
    minZoom: 6,
  },

  showDisclaimer: true,

});
