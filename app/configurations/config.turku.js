/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';
import { BIKEAVL_WITHMAX } from '../util/citybikes';

const CONFIG = 'turku';
const APP_TITLE = 'Fölin reittiopas';
const APP_DESCRIPTION = 'Turun seudun joukkoliikenteen eli Fölin reittiopas';

const walttiConfig = require('./config.waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  feedIds: ['FOLI'],

  searchParams: {
    'boundary.rect.min_lat': 59.963388,
    'boundary.rect.max_lat': 60.950777,
    'boundary.rect.min_lon': 21.145557,
    'boundary.rect.max_lon': 22.939795,
  },

  colors: {
    primary: '#e8aa27',
    hover: '#a07415',
    iconColors: {
      'mode-bus': '#e8aa27',
      'mode-rail': '#8c4799',
      'mode-ferry': '#35b5b3',
      'mode-ferry-pier': '#666666',
    },
  },

  appBarLink: { name: 'Föli', href: 'http://www.foli.fi/fi' },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,

    twitter: {
      site: '@Turkukaupunki',
    },
  },

  meta: {
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'turku/foli-logo.png',

  cityBike: {
    networks: {
      donkey_turku: {
        capacity: BIKEAVL_WITHMAX,
        enabled: true,
        season: {
          // 1.6. - 30.9.
          start: new Date(new Date().getFullYear(), 5, 1),
          end: new Date(new Date().getFullYear(), 10, 1),
        },
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
    },
  },

  transportModes: {
    bus: {
      color: '#e8aa27',
    },

    ferry: {
      availableForSelection: true,
      defaultValue: true,
      color: '#35b5b3',
    },

    citybike: {
      availableForSelection: true,
      color: '#f2b62d',
    },
  },

  areaPolygon: [
    [21.145557, 59.963388],
    [21.145557, 60.950777],
    [22.939795, 60.950777],
    [22.939795, 59.963388],
  ],

  menu: {
    copyright: { label: `© Turun seudun joukkoliikenne ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'menu-feedback',
        href: {
          fi:
            'https://opaskartta.turku.fi/eFeedback/fi/Feedback/35-Joukkoliikenne%20F%C3%B6li',
          sv:
            'https://opaskartta.turku.fi/eFeedback/sv/Feedback/35-Kollektivtrafiken%20F%C3%B6li',
          en:
            'https://opaskartta.turku.fi/eFeedback/en/Feedback/35-F%C3%96LI%20public%20transport',
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

  defaultEndpoint: {
    address: 'Kauppatori, Turku',
    lat: 60.451159,
    lon: 22.267633,
  },

  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnSummaryPage: true,

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Kuuden kunnan yhdessä järjestämä joukkoliikenne Turun seudulla alkoi 1.7.2014. Turun seudun joukkoliikenteessä eli Fölissä ovat mukana Turku, Kaarina, Raisio, Naantali, Lieto ja Rusko. Seudullisen joukkoliikenteen alkamisen myötä joukkoliikenteen käyttö on helppoa ja edullista riippumatta kuntarajoista.',
        ],
      },
      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Digi- ja väestötietoviraston rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut perustuvat Fölin tuottamaan GTFS-aineistoon.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Kollektivtrafiken i Åboregionen inleds den 1 juli 2014 och ordnas samfällt av sex kommuner. Åbo, S:t Karins, Reso, Nådendal, Lundo och Rusko deltar i Föli, dvs. kollektivtrafiken i Åboregionen. När den regionala kollektivtrafiken startar blir det lätt och förmånligt att använda kollektivtrafiken i regionen kring Åbo stad oberoende av kommungränserna.',
        ],
      },
      {
        header: 'Datakällor',
        paragraphs: [
          'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller är baserad på Fölis GTFS data.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'Public transport organised jointly between six municipalities in the Turku region will start on 1 July 2014. Turku region public transport, under the name of Föli, is a collaboration between Turku, Kaarina, Raisio, Naantali, Lieto, and Rusko. With regional public transport, using the public transport system in Turku city region will be easy and inexpensive, regardless of municipal borders. Public transport service points will be introduced in each of the six municipalities. You can use any of the service points.',
        ],
      },
      {
        header: 'Data sources',
        paragraphs: [
          'Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is retrieved from the Building and Dwelling Register of the Finnish Population Register Center. Public transport routes and timetables are based on GTFS data produced by Föli.',
        ],
      },
    ],
  },

  staticMessages: [],
  geoJson: {
    layerConfigUrl: 'https://data.foli.fi/geojson/reittiopas',
  },

  showNearYouButtons: true,
  allowLogin: false,
});
