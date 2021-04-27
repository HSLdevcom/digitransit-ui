/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';
import { BIKEAVL_BIKES } from '../util/citybikes';

const CONFIG = 'kuopio';
const APP_TITLE = 'Reittiopas Kuopio';
const APP_DESCRIPTION = 'Reittiopas Kuopio';

const walttiConfig = require('./config.waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  devHostName: 'https://next-dev-kuopio.digitransit.fi',
  prodHostName: 'https://kuopio.digitransit.fi',

  appBarLink: { name: 'Kuopio', href: 'https://vilkku.kuopio.fi/' },

  colors: {
    primary: '#0ab1c8',
    iconColors: {
      'mode-bus': '#724f9f',
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  textLogo: false, // title text instead of logo img

  favicon: './app/configurations/images/kuopio/favicon.png',

  // Navbar logo
  logo: 'kuopio/logo.png',

  mapLayers: {
    tooltip: {
      fi: 'Uutta! Saat nyt lähellä olevat bussit kartalle asetuksista.',
      en: 'New! You can now get nearby busses on the map from the settings.',
      sv:
        'Nytt! I inställningarna kan du nu välja att se närliggande bussar på kartan.',
    },
  },

  feedIds: ['Kuopio', 'KuopioEly'],

  showTicketInformation: true,

  useTicketIcons: true,

  ticketInformation: {
    primaryAgencyName: 'Kuopion seudun joukkoliikenne',
  },

  ticketLink: 'https://vilkku.kuopio.fi/lipputyypit-hinnat/lippujen-hinnat',

  // mapping fareId from OTP fare identifiers to human readable form
  fareMapping: function mapFareId(fareId) {
    return fareId && fareId.substring
      ? fareId.substring(fareId.indexOf(':') + 1)
      : '';
  },
  showTicketPrice: true,
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

  showAllBusses: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnSummaryPage: true,

  cityBike: {
    showCityBikes: true,
    capacity: BIKEAVL_BIKES,
    networks: {
      vilkku: {
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
  },

  menu: {
    copyright: { label: `© Kuopio ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'menu-feedback',
        nameEn: 'Submit feedback',
        href: 'https://palaute.kuopio.fi/fi#!/palautelomake/27050/27054',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
      {
        name: 'accessibility-statement',
        nameEn: 'Accessibility statement',
        href:
          'https://kauppa.waltti.fi/media/authority/154/files/Saavutettavuusseloste_Waltti-reittiopas_JyQfJhC.htm',
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
      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut perustuvat Kuopion tuottamaan GTFS-aineistoon.',
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
      {
        header: 'Datakällor',
        paragraphs: [
          'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller är baserad på GTFS data från Kuopio.',
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
      {
        header: 'Data sources',
        paragraphs: [
          'Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is retrieved from the Building and Dwelling Register of the Finnish Population Register Center. Public transport routes and timetables are based on GTFS data produced by Kuopio.',
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
        url: '/assets/geojson/kuopio_zone_lines_20210222.geojson',
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
  itinerary: {
    showZoneLimits: true,
  },
  stopCard: {
    header: {
      showZone: true,
    },
  },
});
