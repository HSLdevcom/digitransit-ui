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
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'kotka/ksjl.png',

  textLogo: false, // title text instead of logo img

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

  defaultOrigins: [
    {
      icon: 'icon-icon_bus',
      label: 'Kotkan kauppatori',
      lat: 60.467348,
      lon: 26.945758,
    },
    {
      icon: 'icon-icon_bus',
      label: 'Haminan linja-autoasema',
      lat: 60.569196,
      lon: 27.188172,
    },
    {
      icon: 'icon-icon_bus',
      label: 'Karhulan linja-autoasema',
      lat: 60.515502,
      lon: 26.935416,
    },
  ],

  footer: {
    content: [
      { label: `© Kotka ${walttiConfig.YEAR}` },
      {},
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
  stopCard: {
    header: {
      showZone: true,
    },
  },
});
