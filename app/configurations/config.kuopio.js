/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';
import { BIKEAVL_BIKES } from '../util/vehicleRentalUtils';

const CONFIG = 'kuopio';
const APP_TITLE = 'Reittiopas Kuopio';
const APP_DESCRIPTION = 'Reittiopas Kuopio';
const walttiConfig = require('./config.waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Vilkku', href: 'https://vilkku.kuopio.fi/' },

  colors: {
    primary: '#0ab1c8',
    iconColors: {
      'mode-bus': '#724f9f',
      'mode-rail': '#0E7F3C',
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  favicon: './app/configurations/images/kuopio/kuopio-favicon.png',

  // Navbar logo
  logo: 'kuopio/logo.png',
  secondaryLogo: 'kuopio/secondary-logo.png',

  feedIds: ['Kuopio', 'digitraffic'],

  useTicketIcons: true,
  showTicketPrice: true,
  showTicketInformation: true,
  primaryAgencyName: 'Kuopion seudun joukkoliikenne',

  ticketLink: 'https://vilkku.kuopio.fi/lipputyypit-hinnat/lippujen-hinnat',

  searchParams: {
    'boundary.rect.min_lat': 62.454915,
    'boundary.rect.max_lat': 63.469325,
    'boundary.rect.min_lon': 26.163918,
    'boundary.rect.max_lon': 29.013261,
  },

  areaPolygon: [
    [26.163918, 62.454915],
    [26.163918, 63.469325],
    [29.013261, 63.469325],
    [29.013261, 62.454915],
  ],

  defaultEndpoint: {
    address: 'Kuopion tori',
    lat: 62.892511,
    lon: 27.678136,
  },

  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnItineraryPage: true,

  vehicleRental: {
    networks: {
      freebike_kuopio: {
        enabled: true,
        season: {
          start: '29.4',
          end: '31.10',
        },
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
    },
  },

  transportModes: {
    citybike: {
      availableForSelection: true,
    },
    rail: {
      availableForSelection: true,
      defaultValue: true,
    },
  },

  menu: {
    copyright: { label: `© Kuopio ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'menu-feedback',
        href: {
          fi: 'https://palaute.kuopio.fi/fi#!/palautelomake/27050/27054',
          sv: 'https://palaute.kuopio.fi/fi#!/palautelomake/27050/27054',
          en: 'https://palaute.kuopio.fi/en#!/palautelomake/27050/27054',
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
          'Tämän palvelun tarjoaa Kuopion seudun joukkoliikenne reittisuunnittelua varten Kuopion ja Siilinjärven alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Kuopion seudun joukkoliikenne för reseplanering inom Kuopio och Siilinjärvi region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Kuopion seudun joukkoliikenne for route planning in Kuopio and Siilinjärvi region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
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
        url: '/assets/geojson/kuopio_zone_lines_20240508.geojson',
      },
    ],
  },
  zoneIdMapping: {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E',
    6: 'F',
  },
  zones: {
    stops: true,
    itinerary: true,
  },

  modeDisclaimers: {
    RAIL: {
      fi: {
        disclaimer: 'Vilkun liput eivät käy junaliikenteessä. Junaliput: ',
        link: 'http://vr.fi',
        text: 'http://vr.fi',
      },
      sv: {
        disclaimer: 'Vilkku biljetter är inte giltiga på tåg. Tågbiljetter: ',
        link: 'http://vr.fi/sv',
        text: 'http://vr.fi/sv',
      },
      en: {
        disclaimer: 'Vilkku tickets are not valid on trains. Train tickets: ',
        link: 'http://vr.fi/en',
        text: 'http://vr.fi/en',
      },
    },
  },
  devAnalytics: true,
});
