/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'pori';
const APP_DESCRIPTION = 'Porin joukkoliikenne';
const APP_TITLE = 'Reittiopas';

const walttiConfig = require('./config.waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  feedIds: ['Pori'],

  appBarLink: {
    name: 'Porin joukkoliikenne',
    href: 'http://www.pori.fi/pjl',
  },

  colors: {
    primary: '#1f1f66',
    iconColors: {
      'mode-bus': '#1f1f66',
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  favicon: './app/configurations/images/pori/pori-favicon.png',

  // Navbar logo
  logo: 'pori/pori_logo.svg',

  searchParams: {
    'boundary.rect.min_lat': 61.38,
    'boundary.rect.max_lat': 61.68,
    'boundary.rect.min_lon': 21.37,
    'boundary.rect.max_lon': 21.93,
  },

  transportModes: {
    citybike: {
      availableForSelection: false,
    },
  },

  areaPolygon: [
    [21.37, 61.68],
    [21.37, 61.38],
    [21.93, 61.38],
    [21.93, 61.68],
  ],

  defaultEndpoint: {
    address: 'Porin kauppatori',
    lat: 61.4868,
    lon: 21.7958,
  },

  menu: {
    copyright: { label: `© Pori ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'menu-feedback',
        href: {
          fi: 'mailto:joukkoliikenne@pori.fi',
          sv: 'mailto:joukkoliikenne@pori.fi',
          en: 'mailto:joukkoliikenne@pori.fi',
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

  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnItineraryPage: true,

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Reittiopas helpottaa matkan suunnittelua, kun haluat matkustaa joukkoliikenteellä Porissa ja Ulvilassa. Aikataulut ja reitit sekä tietoa lipputuotteista löytyy myös verkkosivulta https://www.pori.fi/pjl.',
          'Reittiopas näyttää linja-autojen paikannuksen perusteella ajantasaista tietoa linja-autojen sijainneista. Aikataulutiedot ovat sekä aikataulusuunnitelmaan että paikannukseen perustuvia ennusteita pysäkin ohitusajasta. Ennuste ja sijaintitieto tuovat varmuutta matkustukseen, mutta ole silti pysäkillä ajoissa, jotta ehdit haluamaasi vuoroon.',
          'Reittiopas-palvelun tarjoaa Porin joukkoliikenne, ja se perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här reseplaneringen hjälper man att använda kollektivtrafik i Björneborg och Ulvsby. Tidtabeller, rutter och  biljettprodukter finns också på webbplatsen https://www.pori.fi/pjl.',
          'Tidtabellsinformation är baserat på både tidtabeller och GPS-spårning, men det lönar sig att vara på hållplatsen i tid.',
          'Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'The journey planner makes it easier when you want to travel by public transport in Pori and Ulvila. Timetables, routes and ticket prices can also be found on the website https://www.pori.fi/pjl.',
          'The journey planner shows real-time information about the locations of the buses based on GPS. The stop passing time is based on both the timetable and GPS. Go to the bus stop before the time so you can catch the bus you want.',
          'The journey planner service is provided by Pori public transportation authority and is based on the Digitransit service platform.',
        ],
      },
    ],
  },
  zoneIdMapping: {
    1: 'CITY',
    2: 'A',
  },
  zones: {
    stops: true,
    itinerary: true,
  },

  showTicketInformation: true,
  useTicketIcons: true,
  ticketLink: 'https://pjl.pori.fi/etusivu/liput-ja-hinnat/',
  showTicketPrice: true,
  showTicketLinkOnlyWhenTesting: true,
  ticketLinkOperatorCode: 50231,
});
