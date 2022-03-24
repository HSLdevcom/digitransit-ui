/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'kotka';
const APP_TITLE = 'Uusi Reittiopas';
const APP_DESCRIPTION = 'Uusi Reittiopas - kotka';

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
    primary: '#118ddd',
    iconColors: {
      'mode-bus': '#118ddd',
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
  },
  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'kotka/ksjl.png',

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
  zones: {
    stops: true,
    itinerary: true,
  },
});
