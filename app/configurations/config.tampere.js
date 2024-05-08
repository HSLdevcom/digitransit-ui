/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';
import { BIKEAVL_WITHMAX } from '../util/vehicleRentalUtils';

const CONFIG = 'tampere';
const APP_TITLE = 'Nyssen reittiopas';
const APP_DESCRIPTION = 'Nyssen reittiopas';

const walttiConfig = require('./config.waltti').default;
const tampereTimetables = require('./timetableConfigUtils').default.tampere;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Nysse', href: 'https://www.nysse.fi/' },

  colors: {
    primary: '#1c57cf',
    iconColors: {
      'mode-bus': '#1A4A8F',
      'mode-rail': '#0E7F3C',
      'mode-tram': '#DA2128',
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
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
        url: '/assets/geojson/tre_zone_lines_20240108.geojson',
        isOffByDefault: true,
      },
    ],
  },

  stopCard: {
    header: {
      virtualMonitorBaseUrl: 'https://tremonitori.digitransit.fi/',
    },
  },
  zones: {
    stops: true,
    itinerary: true,
  },

  useTicketIcons: true,
  showTicketInformation: true,
  ticketInformation: {
    primaryAgencyName: 'Tampereen seudun joukkoliikenne',
  },
  ticketLink: 'https://www.nysse.fi/liput-ja-hinnat.html',

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
          'Nyssen liput käyvät junaliikenteessä rajoitetusti vain Nysse-alueella. Lue lisää ',
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
    [23.33685, 61.63721],
    [23.4547, 61.66004],
    [23.49304, 61.58569],
    [23.38259, 61.51959],
    [23.19278, 61.5372],
    [23.20269, 61.47284],
    [23.13709, 61.46593],
    [23.20483, 61.45408],
    [23.27882, 61.23892],
    [23.5689, 61.20008],
    [23.74499, 61.25923],
    [23.95899, 61.18411],
    [23.9587, 61.10186],
    [24.29702, 61.19127],
    [24.07982, 61.33006],
    [24.30211, 61.39897],
    [24.28287, 61.43758],
    [24.6227, 61.42868],
    [24.78261, 61.49082],
    [24.97205, 61.45072],
    [24.92861, 61.49204],
    [25.1823, 61.51541],
    [25.24034, 61.57576],
    [24.83695, 61.55567],
    [24.78389, 61.62198],
    [24.85561, 61.6727],
    [24.73655, 61.69435],
    [24.7228, 61.76192],
    [24.82336, 61.76892],
    [24.66667, 61.86303],
    [24.55725, 61.71581],
    [24.2266, 61.82436],
    [23.89718, 61.81708],
    [23.83426, 61.84271],
    [23.88669, 61.86715],
    [23.84536, 61.94907],
    [23.68161, 62.08377],
    [23.37378, 62.16425],
    [23.29287, 62.10854],
    [23.36569, 62.0713],
    [23.30253, 61.9601],
    [23.59453, 61.81945],
    [23.21133, 61.73389],
    [23.21056, 61.65544],
  ],

  defaultEndpoint: {
    address: 'Keskustori, Tampere',
    lat: 61.4980944,
    lon: 23.7606972,
  },

  mainMenu: {
    stopMonitor: {
      show: true,
      url: 'https://tremonitori.digitransit.fi/createview',
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

  staticMessages: [],

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
  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnItineraryPage: true,
  timetables: {
    tampere: tampereTimetables,
  },

  cityBike: {
    networks: {
      inurba_tampere: {
        capacity: BIKEAVL_WITHMAX,
        enabled: true,
        season: {
          // 15.4. - 31.10.
          start: new Date(new Date().getFullYear(), 3, 15),
          end: new Date(new Date().getFullYear(), 10, 1),
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
      fi: 'Osta käyttöoikeutta päiväksi, kuukaudeksi tai koko kaudeksi.',
      sv: 'Köp ett abonnemang för en dag, en månad eller en hel säsong.',
      en: 'Buy licenses for a day, a month or an entire season.',
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

  bikeBoardingModes: {
    RAIL: { showNotification: true },
    TRAM: { showNotification: true },
  },

  showTenWeeksOnRouteSchedule: true,
});
