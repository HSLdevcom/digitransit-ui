/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';
import { BIKEAVL_WITHMAX } from '../util/citybikes';

const CONFIG = 'kotka';
const APP_TITLE = 'Kotkan seudun reittiopas';
const APP_DESCRIPTION = 'Kotkan seudun reittiopas';

const walttiConfig = require('./config.waltti').default;

const minLat = 60.423693;
const maxLat = 60.688566;
const minLon = 26.422982;
const maxLon = 27.739367;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: {
    name: 'Kotkan seudun joukkoliikenne',
    href: 'http://www.kotka.fi/asukkaalle/kartat_ja_liikenne/joukkoliikenne',
  },

  colors: {
    primary: '#0001FF',
    iconColors: {
      'mode-bus': '#0001FF',
      'mode-citybike': '#f2b62d',
      'mode-citybike-secondary': '#333333',
    },
  },
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
      nearYouLabel: {
        fi: 'Lähipysäkit kartalla',
        sv: 'Hållplatser på kartan',
        en: 'Nearby stops on map',
      },
    },
    citybike: {
      availableForSelection: true,
    },
  },

  cityBike: {
    networks: {
      donkey_kotka: {
        enabled: true,
        season: {
          // 14.4. - 31.10.
          start: new Date(new Date().getFullYear(), 3, 14),
          end: new Date(new Date().getFullYear(), 10, 1),
        },
        capacity: BIKEAVL_WITHMAX,
        icon: 'citybike',
        name: {
          fi: 'Kotka',
          sv: 'Kotka',
          en: 'Kotka',
        },
        type: 'citybike',
        url: {
          fi: 'https://kaakau.fi/kotka/',
          sv: 'https://kaakau.fi/kotka/?lang=sv',
          en: 'https://kaakau.fi/kotka/?lang=en',
        },
      },
      donkey_hamina: {
        enabled: true,
        season: {
          // 14.4. - 31.10.
          start: new Date(new Date().getFullYear(), 3, 14),
          end: new Date(new Date().getFullYear(), 10, 1),
        },
        capacity: BIKEAVL_WITHMAX,
        icon: 'citybike-secondary',
        name: {
          fi: 'Hamina',
          sv: 'Hamina',
          en: 'Hamina',
        },
        type: 'citybike',
        url: {
          fi: 'https://kaakau.fi/hamina/',
          sv: 'https://kaakau.fi/hamina/?lang=sv',
          en: 'https://kaakau.fi/hamina/?lang=en',
        },
      },
    },
  },

  getAutoSuggestIcons: {
    citybikes: station => {
      if (station.properties.source === 'citybikesdonkey_hamina') {
        return ['citybike-stop-digitransit-secondary', '#f2b62d'];
      }
      return ['citybike-stop-digitransit', '#f2b62d'];
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'kotka/kotka.png',

  feedIds: ['Kotka'],

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
    address: 'Kotkan kauppatori',
    lat: 60.467348,
    lon: 26.945758,
  },

  menu: {
    copyright: { label: `© Kotka ${walttiConfig.YEAR}` },
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
          'Kotkan seudun joukkoliikenne tarjoaa tämän palvelun joukkoliikenteen reittisuunnittelua varten Kotkan, Haminan ja Pyhtään alueella. Palvelu kattaa joukkoliikenteen, kävelyn ja pyöräilyn rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Kotkan seudun joukkoliikenne erbjuder denna tjänst för ruttplanering av kollektivtrafiken i områden i Kotka, Fredrikshamn och Pyttis. Tjänsten omfattar kollektivtrafik, gång och cykling avgränsad fråga. Tjänsten är baserad på Digitransit tjänsteplattform.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'Kotkan seudun joukkoliikenne offers this service for route planning of public transport in areas of Kotka, Hamina and Pyhtää. The service covers public transport, walking and cycling demarcated regard. The service is based on Digitransit service platform.',
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
  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnSummaryPage: true,
  zones: {
    stops: true,
    itinerary: true,
  },
});
