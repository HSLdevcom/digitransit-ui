import configMerger from '../util/configMerger';
import walttiConfig from './config.waltti';

const CONFIG = 'oulu';
const APP_DESCRIPTION = 'Oulun seudun reittiopas';
const APP_TITLE = 'Reittiopas';

const IS_DEV =
  process.env.RUN_ENV === 'development' ||
  process.env.NODE_ENV !== 'production';

const virtualMonitorBaseUrl = IS_DEV
  ? 'https://dev-oulumonitori.digitransit.fi'
  : 'https://pysakkinaytto.osl.fi';

export default configMerger(walttiConfig, {
  CONFIG,

  feedIds: ['OULU'],

  appBarLink: {
    name: 'Oulun seudun liikenne',
    href: 'https://www.osl.fi/',
  },

  colors: {
    primary: '#e10669',
    iconColors: {
      'mode-bus': '#e10669',
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    twitter: {
      site: '@oulunkaupunki',
    },
    image: {
      url: 'img/social-share-oulu.png',
      width: 1181,
      height: 472,
    },
  },

  title: APP_TITLE,

  favicon: './app/configurations/images/oulu/oulu-favicon.png',

  // Navbar logo
  logo: 'oulu/oulu-logo.png',
  secondaryLogo: 'oulu/secondary-oulu-logo.png',

  transportModes: {
    citybike: {
      availableForSelection: false,
    },
  },

  useSearchPolygon: true,

  areaPolygon: [
    [24.362, 64.682],
    [24.934, 64.67],
    [25.912, 64.443],
    [26.409, 64.453],
    [26.836, 64.879],
    [26.836, 65.089],
    [26.603, 65.324],
    [26.414, 65.395],
    [26.189, 65.833],
    [25.022, 65.671],
    [24.362, 65.246],
  ],

  defaultEndpoint: {
    address: 'Keskusta',
    lat: 65.0118,
    lon: 25.4702,
  },

  menu: {
    copyright: { label: `© Oulu ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'menu-feedback',
        href: {
          fi: 'https://www.osl.fi/asiakaspalvelu/#palaute',
          sv: 'https://www.osl.fi/asiakaspalvelu/#palaute',
          en: 'https://www.osl.fi/asiakaspalvelu/#palaute',
        },
      },
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

  geoJson: {
    layers: [
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/oulu_zone_lines_20241011.geojson',
      },
    ],
  },

  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnItineraryPage: true,

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tämän palvelun tarjoaa Oulun seudun liikenne joukkoliikenteen reittisuunnittelua varten Oulun, Iin, Kempeleen, Limingan, Lumijoen, Muhoksen ja Tyrnävän alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Uleåborgregionens trafik för reseplanering inom Oulu, Ii, Kempele, Liminka, Lumijoki, Muhos och Tyrnävä region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Oulu Region Transport for route planning in Oulu, Ii, Kempele, Liminka, Lumijoki, Muhos and Tyrnävä region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
  zoneIdMapping: {
    1: 'OSL',
  },
  zones: {
    stops: true,
    itinerary: true,
  },
  stopCard: {
    header: {
      virtualMonitorBaseUrl,
    },
  },

  mainMenu: {
    stopMonitor: {
      show: true,
      url: `${virtualMonitorBaseUrl}/createview`,
    },
  },

  showTicketInformation: true,
  useTicketIcons: true,
  ticketLink: {
    fi: 'https://www.osl.fi/liput-ja-hinnat/osl-sovellus/',
    sv: 'https://www.osl.fi/en/tickets-and-fares/osl-app/',
    en: 'https://www.osl.fi/en/tickets-and-fares/osl-app/',
  },
  showTicketPrice: true,
  ticketLinkOperatorCode: 50229,
  appName: 'oslapp',
});
