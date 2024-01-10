/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';
import { BIKEAVL_WITHMAX } from '../util/vehicleRentalUtils';

const CONFIG = 'tampere';
const APP_TITLE = 'Nyssen reittiopas';
const APP_DESCRIPTION = 'Nyssen reittiopas';

const walttiConfig = require('./config.waltti').default;
const tampereTimetables = require('./timetableConfigUtils').default.tampere;

const minLat = 61.16;
const maxLat = 62.31;
const minLon = 22.68;
const maxLon = 24.9;

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
        url: '/assets/geojson/tre_zone_lines_20210622.geojson',
        isOffByDefault: true,
      },
    ],
  },

  itinerary: {
    // Number of days to include to the service time range from the future (DT-3175)
    serviceTimeRange: 60,
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
  showTicketInformation: true,

  useTicketIcons: true,

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

  // mapping fareId from OTP fare identifiers to human readable form
  fareMapping: function mapFareId(fareId) {
    return fareId && fareId.substring
      ? fareId.substring(fareId.indexOf(':') + 1)
      : '';
  },

  searchParams: {
    'boundary.rect.min_lat': minLat,
    'boundary.rect.max_lat': maxLat,
    'boundary.rect.min_lon': minLon,
    'boundary.rect.max_lon': maxLon,
  },

  areaPolygon: [
    [minLon, minLat],
    [minLon, maxLat],
    [maxLon, maxLat],
    [maxLon, minLat],
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
      seatcode_tampere: {
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

  // modes that should not coexist with BICYCLE mode
  // boarding a long distance train with bicycle costs extra
  modesWithNoBike: ['BICYCLE_RENT', 'WALK', 'RAIL'],

  showTenWeeksOnRouteSchedule: true,
});
