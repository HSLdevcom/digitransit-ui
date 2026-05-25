import configMerger from '../util/configMerger';
import walttiConfig from './config.waltti';

const CONFIG = 'walttiOpas';
const APP_TITLE = 'Waltti-opas';
const APP_DESCRIPTION = 'Uusi Reittiopas - Waltti-opas';

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: {
    name: 'Waltti',
    href: 'https://waltti.fi/',
    altLink: {
      sv: {
        name: 'Waltti',
        href: 'https://waltti.fi/sv/',
      },
      en: {
        name: 'Waltti',
        href: 'https://waltti.fi/en/',
      },
    },
  },

  colors: {
    primary: '#5959a8',
    topBarColor: '#17083b',
    bus: '#5959a8',
  },
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    image: {
      url: 'img/social-share-waltti.png',
      width: 1795,
      height: 1313,
    },
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
    },
  },

  useSearchPolygon: true,

  areaPolygon: [
    // Kajaani:
    [28.29, 63.65],
    [29.19, 63.84],
    [29.27, 63.99],
    [28.5, 64.5],
    [26.6, 64.5],
    [26.7, 64.0],
    [27.6, 63.9],
    [28.29, 63.65],
    // Salo:
    [23.11, 60.58],
    [22.83, 60.52],
    [22.81, 60.37],
    [22.86, 60.3],
    [22.85, 60.25],
    [22.89, 60.24],
    [22.84, 60.19],
    [22.88, 60.13],
    [22.79, 60.06],
    [22.79, 60.02],
    [22.84, 60.02],
    [22.85, 59.99],
    [22.96, 59.99],
    [23.01, 60.07],
    [23.66, 60.2],
    [23.65, 60.27],
    [23.74, 60.31],
    [23.8, 60.39],
    [23.8, 60.45],
    [23.72, 60.46],
    [23.74, 60.49],
    [23.71, 60.5],
    [23.65, 60.48],
    [23.61, 60.5],
    [23.51, 60.54],
    [23.52, 60.6],
    [23.49, 60.6],
    [23.39, 60.55],
    [23.3, 60.59],
    [23.21, 60.59],
    [23.11, 60.58],
  ],

  map: {
    minZoom: 6,
  },

  showDisclaimer: true,
});
