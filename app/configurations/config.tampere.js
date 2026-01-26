import configMerger from '../util/configMerger';
import { BIKEAVL_WITHMAX } from '../util/vehicleRentalUtils';
import walttiConfig from './config.waltti';
import ttConfig from './timetableConfigUtils';

const tampereTimetables = ttConfig.tampere;
const CONFIG = 'tampere';
const APP_TITLE = 'Nyssen reittiopas';
const APP_DESCRIPTION = 'Nyssen reittiopas';
const CDN_URL = process.env.MAP_URL || 'https://dev-cdn.digitransit.fi';

const IS_DEV =
  process.env.RUN_ENV === 'development' ||
  process.env.NODE_ENV !== 'production';

const virtualMonitorBaseUrl = IS_DEV
  ? 'https://dev-tremonitori.digitransit.fi'
  : 'https://tremonitori.digitransit.fi';

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Nysse', href: 'https://www.nysse.fi/' },

  colors: {
    primary: '#1c57cf',
    bus: '#1A4A8F',
    rail: '#0E7F3C',
    tram: '#DA2128',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    image: {
      url: 'img/social-share-tampere.png',
      width: 400,
      height: 400,
    },
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'tampere/tampere-logo.png',

  favicon: './app/configurations/images/tampere/tampere-favicon.png',

  feedIds: ['tampere', 'digitraffic', 'tampereDRT'],

  geoJson: {
    layers: [
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/tre_zone_lines_20250606.geojson',
        isOffByDefault: true,
      },
      {
        name: {
          fi: 'Myyntipisteet',
          sv: 'Servicekontorer',
          en: 'Service points',
        },
        url: `${CDN_URL}/waltti-assets/v1/salespoints/salespoints_tampere.geojson`,
      },
    ],
  },

  stopCard: {
    header: {
      virtualMonitorBaseUrl,
    },
  },
  zones: {
    stops: true,
    itinerary: true,
  },

  appName: 'nysseapp',

  useTicketIcons: true,
  showTicketInformation: true,
  primaryAgencyName: 'Tampereen seudun joukkoliikenne',

  ticketLink: {
    fi: 'https://www.nysse.fi/liput-ja-hinnat.html',
    sv: 'https://www.nysse.fi/en/tickets-and-fares.html',
    en: 'https://www.nysse.fi/en/tickets-and-fares.html',
  },

  showTicketLinkOnlyWhenTesting: true,
  showTicketPrice: false,
  ticketLinkOperatorCode: 50245,

  callAgencyInfo: {
    fi: {
      callAgencyInfoLink: 'https://nysse.fi/kutsuliikenne',
      callAgencyInfoLinkText: 'https://nysse.fi/kutsuliikenne',
    },
    sv: {
      callAgencyInfoLink: 'https://nysse.fi/kutsuliikenne',
      callAgencyInfoLinkText: 'https://nysse.fi/kutsuliikenne',
    },
    en: {
      callAgencyInfoLink: 'https://nysse.fi/drt',
      callAgencyInfoLinkText: 'https://nysse.fi/drt',
    },
  },

  modeDisclaimers: {
    RAIL: {
      fi: {
        disclaimer:
          'Nyssen liput käyvät Nysse-alueen junaliikenteessä rajoitetusti. Lue lisää ',
        link: 'https://www.nysse.fi/junat',
        text: 'nysse.fi/junat',
      },
      sv: {
        disclaimer:
          'Nysse-biljetter är giltiga på tåg i Nysse-området, med vissa begränsningar. Läs mer på ',
        link: 'https://www.nysse.fi/en/ways-to-get-around/train',
        text: 'Trains in the Nysse area - Nysse, Tampere regional transport',
      },
      en: {
        disclaimer:
          'Nysse tickets are valid on trains in the Nysse area with some limitations. Read more on ',
        link: 'https://www.nysse.fi/en/ways-to-get-around/train',
        text: 'Trains in the Nysse area - Nysse, Tampere regional transport',
      },
    },
  },

  useSearchPolygon: true,

  areaPolygon: [
    [23.3371, 61.6345],
    [23.45, 61.6573],
    [23.4876, 61.5863],
    [23.4374, 61.5743],
    [23.3781, 61.5224],
    [23.1928, 61.5372],
    [23.1968, 61.4754],
    [23.131, 61.4679],
    [23.1664, 61.4361],
    [23.2135, 61.3274],
    [23.2788, 61.2389],
    [23.3907, 61.1987],
    [23.5705, 61.1967],
    [23.6945, 61.2137],
    [23.7405, 61.2498],
    [23.7952, 61.2152],
    [23.9492, 61.1795],
    [23.9165, 61.1301],
    [23.9401, 61.0974],
    [24.2374, 61.1323],
    [24.297, 61.1913],
    [24.2914, 61.2412],
    [24.088, 61.3303],
    [24.3062, 61.3972],
    [24.2959, 61.4312],
    [24.4514, 61.4118],
    [24.6227, 61.4287],
    [24.7328, 61.4427],
    [24.7997, 61.4612],
    [24.7826, 61.4908],
    [24.972, 61.4507],
    [24.9286, 61.492],
    [25.1823, 61.5154],
    [25.2403, 61.5758],
    [25.1609, 61.5939],
    [24.837, 61.5557],
    [24.8237, 61.5892],
    [24.7839, 61.622],
    [24.8556, 61.6727],
    [24.7472, 61.704],
    [24.756, 61.7238],
    [24.7228, 61.7619],
    [24.8179, 61.7521],
    [24.8324, 61.7679],
    [24.6667, 61.863],
    [24.6278, 61.8475],
    [24.5469, 61.7292],
    [24.3127, 61.8118],
    [24.2266, 61.8244],
    [23.8972, 61.8171],
    [23.8343, 61.8427],
    [23.8867, 61.8672],
    [23.8488, 61.9492],
    [23.6861, 62.0859],
    [23.4253, 62.163],
    [23.3713, 62.1691],
    [23.2755, 62.1015],
    [23.3013, 62.067],
    [23.3536, 62.0665],
    [23.2912, 61.9559],
    [23.4388, 61.87],
    [23.5863, 61.8248],
    [23.4167, 61.8162],
    [23.2578, 61.7594],
    [23.2049, 61.7351],
    [23.2074, 61.6546],
  ],

  defaultEndpoint: {
    address: 'Keskustori, Tampere',
    lat: 61.4980944,
    lon: 23.7606972,
  },

  mainMenu: {
    stopMonitor: {
      show: true,
      url: `${virtualMonitorBaseUrl}/createview`,
    },
  },

  menu: {
    copyright: { label: `© Tampere ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'menu-feedback',
        href: {
          fi: 'https://www.nysse.fi/palaute.html',
          sv: 'https://www.nysse.fi/palaute.html',
          en: 'https://www.nysse.fi/en/feedback.html',
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

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tervetuloa reittioppaaseen! Tämän palvelun tarjoaa Tampereen seudun joukkoliikenne (Nysse) reittisuunnittelua varten Tampereen kaupunkiseudun alueella (Kangasala, Lempäälä, Nokia, Orivesi, Pirkkala, Tampere, Vesilahti ja Ylöjärvi). Palvelu perustuu Digitransit-palvelualustaan.',
        ],
        link: 'https://www.nysse.fi/reittiopas-ohje.html',
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Tampereen seudun joukkoliikenne (Nysse) för reseplanering inom Tampere region (Kangasala, Lempäälä, Nokia, Orivesi, Pirkkala, Tampere, Vesilahti ja Ylöjärvi). Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Tampereen seudun Joukkoliikenne (Nysse) for route planning in Tampere region (Kangasala, Lempäälä, Nokia, Orivesi, Pirkkala, Tampere, Vesilahti ja Ylöjärvi). Service is built on Digitransit platform.',
        ],
        link: 'https://www.nysse.fi/en/journey-planner-manual.html',
      },
    ],
  },
  timetables: {
    tampere: tampereTimetables,
  },

  vehicleRental: {
    networks: {
      inurba_tampere: {
        capacity: BIKEAVL_WITHMAX,
        enabled: true,
        season: {
          start: '15.4',
          end: '31.10',
        },
        icon: 'citybike',
        name: {
          fi: 'Tampere',
          sv: 'Tammerfors',
          en: 'Tampere',
        },
        type: 'citybike',
        // Shown if citybike leg duration exceeds timeBeforeSurcharge
        durationInstructions: {
          fi: 'https://www.nysse.fi/kaupunkipyorat',
          sv: 'https://www.nysse.fi/en/city-bikes.html',
          en: 'https://www.nysse.fi/en/city-bikes.html',
        },
        timeBeforeSurcharge: 60 * 60,
      },
    },
    buyUrl: {
      fi: 'https://www.nysse.fi/kaupunkipyorat',
      sv: 'https://www.nysse.fi/en/city-bikes.html',
      en: 'https://www.nysse.fi/en/city-bikes.html',
    },
    buyInstructions: {
      fi: 'Osta yksittäinen matka kertamaksulla tai pidempi käyttöoikeus päiväksi, kuukaudeksi tai koko kaudeksi.',
      sv: 'Köp en enkelresa eller abonnemang för en dag, en månad eller för en hel säsong.',
      en: 'Buy a single trip or a daily, monthly or seasonal pass.',
    },
  },

  // enable train routing for Tampere
  transportModes: {
    rail: {
      availableForSelection: true,
      defaultValue: true,
    },
    tram: {
      availableForSelection: true,
      defaultValue: true,
    },
    citybike: {
      availableForSelection: true,
    },
  },

  nearYouModes: ['bus', 'tram', 'rail', 'citybike'],

  bikeBoardingModes: {
    RAIL: { showNotification: true },
    TRAM: { showNotification: true },
  },

  showTenWeeksOnRouteSchedule: true,

  parkAndRide: {
    showParkAndRide: true,
    showParkAndRideForBikes: true,
  },
});
