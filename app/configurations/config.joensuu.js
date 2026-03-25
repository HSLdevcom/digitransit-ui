import configMerger from '../util/configMerger';
import walttiConfig from './config.waltti';

const CONFIG = 'joensuu';
const APP_TITLE = 'Joensuun reittiopas';
const APP_DESCRIPTION = 'Joensuun uusi reittiopas';

export default configMerger(walttiConfig, {
  CONFIG,

  feedIds: ['Joensuu'],

  appBarLink: { name: 'Joensuun kaupunki', href: 'http://www.joensuu.fi/' },

  title: APP_TITLE,

  favicon: './app/configurations/images/joensuu/joensuu-favicon.png',

  // Navbar logo
  logo: 'joensuu/jojo-logo.png',

  colors: {
    primary: '#5c4696',
    bus: '#009fe3',
    rail: '#64be14',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    image: {
      url: 'img/social-share-joensuu.png',
      width: 346,
      height: 80,
    },
  },

  useSearchPolygon: true,
  areaPolygon: [
    [28.6075, 61.6392],
    [28.7672, 61.6107],
    [28.841, 61.5608],
    [29.0027, 61.5242],
    [29.2628, 61.5562],
    [29.3818, 61.6356],
    [29.5534, 61.6782],
    [29.5774, 61.718],
    [30.1342, 61.8545],
    [30.1948, 61.8823],
    [30.1929, 61.8916],
    [30.2108, 61.8931],
    [30.2733, 61.9344],
    [30.3, 61.9358],
    [30.3112, 61.9447],
    [30.3032, 61.9628],
    [30.3098, 61.9679],
    [30.3275, 61.9734],
    [30.3376, 61.9737],
    [30.3518, 61.9805],
    [30.3763, 61.9997],
    [30.422, 62.0236],
    [30.5585, 62.1169],
    [30.5998, 62.1428],
    [30.6327, 62.1734],
    [30.627, 62.189],
    [30.6571, 62.2094],
    [30.6863, 62.2109],
    [30.72, 62.2092],
    [30.7446, 62.2269],
    [30.765, 62.2352],
    [30.7879, 62.2507],
    [30.807, 62.2608],
    [30.8087, 62.2695],
    [30.8104, 62.2709],
    [30.8334, 62.2762],
    [30.9042, 62.3113],
    [30.9434, 62.3065],
    [30.9603, 62.3273],
    [30.9402, 62.3329],
    [31.141, 62.4467],
    [31.1813, 62.4947],
    [31.2184, 62.5],
    [31.3454, 62.6436],
    [31.3673, 62.6488],
    [31.3745, 62.6569],
    [31.3744, 62.6717],
    [31.3804, 62.6752],
    [31.3842, 62.676],
    [31.384, 62.6819],
    [31.3788, 62.6899],
    [31.4362, 62.786],
    [31.5838, 62.908],
    [31.568, 62.9179],
    [31.4986, 62.9937],
    [31.4426, 63.0043],
    [31.4573, 63.0238],
    [31.3869, 63.0471],
    [31.3603, 63.0691],
    [31.2675, 63.1034],
    [31.2333, 63.1881],
    [31.2321, 63.2156],
    [30.9704, 63.3038],
    [30.9275, 63.3516],
    [30.8456, 63.3637],
    [30.7845, 63.4015],
    [30.4819, 63.4658],
    [30.3797, 63.5424],
    [30.2526, 63.5833],
    [30.2408, 63.6063],
    [30.0789, 63.6881],
    [29.9645, 63.7573],
    [29.8698, 63.7518],
    [29.6542, 63.6856],
    [29.4919, 63.6019],
    [29.4903, 63.3685],
    [29.1733, 63.4718],
    [28.7382, 63.3968],
    [28.5886, 63.204],
    [28.8081, 63.0615],
    [28.9917, 62.9873],
    [28.6345, 62.7653],
    [28.389, 62.5793],
    [28.2184, 62.428],
    [28.3411, 62.3135],
    [28.377, 62.1181],
    [28.3461, 61.9213],
  ],

  menu: {
    copyright: { label: `© Joensuun kaupunki ${walttiConfig.YEAR}` },
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

  geoJson: {
    layers: [
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/joensuu_zone_lines_20250402.geojson',
      },
    ],
  },

  defaultEndpoint: {
    address: 'Keskusta, Joensuu',
    lat: 62.6024263,
    lon: 29.7569847,
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tämän palvelun tarjoaa Joensuun kaupunki joukkoliikenteen reittisuunnittelua varten Joensuun alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Joensuu för reseplanering inom Joensuu region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Joensuu city for local route planning in Joensuu region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
  zoneIdMapping: {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
  },
  zones: {
    stops: true,
    itinerary: true,
  },

  showTicketInformation: true,
  useTicketIcons: true,
  ticketLink: {
    fi: 'https://jojo.joensuu.fi/liput-ja-hinnat',
    sv: 'https://jojo.joensuu.fi/web/jojo-english/tickets',
    en: 'https://jojo.joensuu.fi/web/jojo-english/tickets',
  },
  showTicketPrice: false,
  ticketLinkOperatorCode: 50207,
  externalFareRouteIds: ['401'],
});
