/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'varely';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const APP_TITLE = 'Seutu+ reittiopas';
const APP_DESCRIPTION = 'Varsinais-Suomen ELY-keskuksen reittiopas';
const OTP_URL =
  process.env.DEV_OTP_URL || `${API_URL}/routing/v2/routers/varely/`;
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const POI_MAP_PREFIX = `${MAP_URL}/map/v3/varely`;

const walttiConfig = require('./config.waltti').default;

const colorPrimary = '#008161';

export default configMerger(walttiConfig, {
  CONFIG,

  URL: {
    OTP: OTP_URL,

    // read stops and stations OTP2 vector map tile server
    STOP_MAP: {
      default: `${POI_MAP_PREFIX}/fi/stops,stations/`,
      sv: `${POI_MAP_PREFIX}/sv/stops,stations/`,
    },
  },

  feedIds: ['VARELY', 'FOLI'],

  searchParams: {
    'boundary.rect.min_lat': 59.475641,
    'boundary.rect.max_lat': 61.133482,
    'boundary.rect.min_lon': 20.377529,
    'boundary.rect.max_lon': 23.920549,
  },

  colors: {
    primary: colorPrimary,
    hover: '#00BF6F',
    iconColors: {
      'mode-bus': colorPrimary,
    },
  },

  appBarLink: { name: 'Seutu+', href: 'https://seutuplus.fi/' },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  meta: {
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'varely/seutuplus-logo-white.svg',
  favicon: './app/configurations/images/varely/favicon.png',

  transportModes: {
    bus: {
      availableForSelection: true,
      color: colorPrimary,
    },
  },

  // Varsinais-Suomi (acquired from: https://github.com/varmais/maakunnat/blob/master/maakunnat.geojson?short_path=81dbd20#L184)
  areaPolygon: [
    [23.8444, 60.5564],
    [23.8718, 60.5079],
    [23.7374, 60.4903],
    [23.7392, 60.457],
    [23.7841, 60.4501],
    [23.7904, 60.3878],
    [23.7231, 60.3687],
    [23.7288, 60.3289],
    [23.5863, 60.2588],
    [23.6204, 60.1941],
    [23.5536, 60.2022],
    [23.3629, 60.1498],
    [23.3059, 60.1886],
    [23.1486, 60.1004],
    [22.9873, 60.0955],
    [22.9535, 59.9994],
    [22.8532, 60.013],
    [22.8013, 60.0253],
    [22.8142, 59.8775],
    [22.6589, 59.611],
    [22.3965, 59.513],
    [22.098, 59.501],
    [21.4966, 59.4756],
    [21.1797, 59.4992],
    [21.269, 59.7491],
    [21.3456, 59.8855],
    [21.1713, 59.9501],
    [21.1333, 60.0444],
    [21.063, 60.1039],
    [21.0238, 60.1239],
    [21.0895, 60.2579],
    [21.1513, 60.4986],
    [21.1238, 60.5702],
    [20.9699, 60.7129],
    [20.73, 60.7231],
    [20.3775, 60.8766],
    [20.4375, 60.9018],
    [20.7714, 61.1269],
    [20.7731, 61.1334],
    [21.316, 61.1035],
    [21.4385, 61.0253],
    [21.5886, 61.0178],
    [21.6211, 61.0517],
    [21.6655, 60.9963],
    [21.7757, 61.0341],
    [21.8441, 61.0094],
    [21.9513, 60.9769],
    [21.9852, 60.901],
    [22.1284, 60.9042],
    [22.1603, 60.872],
    [22.2636, 60.9268],
    [22.5862, 60.9387],
    [22.5224, 60.9764],
    [22.7015, 60.9869],
    [22.8159, 60.9934],
    [22.8239, 61.1014],
    [22.9685, 61.0432],
    [23.148, 61.0314],
    [23.1953, 61.0012],
    [23.2939, 60.9546],
    [23.2666, 60.8891],
    [23.1356, 60.8835],
    [23.1425, 60.8375],
    [23.23, 60.8254],
    [23.1546, 60.7741],
    [23.2772, 60.711],
    [23.4086, 60.7397],
    [23.5021, 60.7439],
    [23.6841, 60.6572],
    [23.9005, 60.6497],
    [23.9205, 60.606],
    [23.8444, 60.5564],
  ],

  menu: {
    copyright: { label: `© Seutu+ ${walttiConfig.YEAR}` },
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

  defaultEndpoint: {
    address: 'Linja-autoasema, Turku',
    lat: 60.4567994,
    lon: 22.2679201,
  },

  /* Enable real-time map layer for vehicle positions */
  vehicles: false,
  viaPointsEnabled: false,
  showVehiclesOnStopPage: false,
  showVehiclesOnSummaryPage: false,

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tervetuloa reittioppaaseen! Reittiopas kertoo, miten pääset nopeasti ja helposti perille joukkoliikenteellä Turussa, Aurassa, Maskussa, Mynämäellä, Nousiaisissa, Paimiossa ja Paraisilla. Reittiopas-palvelun tarjoaa Varsinais-Suomen ELY-keskus, ja se perustuu Digitransit –palvelualustaan.',
        ],
      },
      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa OpenStreetMap contributions. Osoitetiedot tuodaan Digi-ja väestötietoviraston rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut perustuvat Seutu+ tuottamaan GTFS-aineistoon.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten är för reseplanering inom Egentliga Finland (Åbo, Aura, Masku, Mynämäki, Nousis, Pemar and Pargas). Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
      {
        header: 'Datakällor',
        paragraphs: [
          'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller är baserade på Seutu+ data.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'Welcome to the Journey Planner! The Journey Planner shows you how to get to your destination fast and easy by public transport in Turku, Aura, Masku, Mynämäki, Nousiainen, Paimio and Parainen. You can also use the planner to find fast walking and cycling routes, and to an extent, for driving directions. The Journey Planner is provided by Centre for Economic Development, Transport and the Environment of Southwest Finland and it is based on the Digitransit service platform.',
        ],
      },
      {
        header: 'Data sources',
        paragraphs: [
          'Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is retrieved from the Building and Dwelling Register of the Finnish Population Register Center. Public transport routes and timetables are based on GTFS data produced by Seutu+.',
        ],
      },
    ],
  },

  staticMessages: [
    {
      id: '1',
      priority: 0,
      persistence: 'repeat',
      content: {
        fi: [
          {
            type: 'heading',
            content: 'Rauman paikallisliikenne löytyy toistaiseksi palvelusta',
          },
          {
            type: 'a',
            content: 'opas.matka.fi',
            href: 'https://opas.matka.fi',
          },
        ],
        en: [
          {
            type: 'heading',
            content: 'For now, traffic information of Rauma is available at',
          },
          {
            type: 'a',
            content: 'opas.matka.fi',
            href: 'https://opas.matka.fi',
          },
        ],
        sv: [
          {
            type: 'heading',
            content: 'Raumos kollektivtrafik kan för tillfället hittas på',
          },
          {
            type: 'a',
            content: 'opas.matka.fi',
            href: 'https://opas.matka.fi',
          },
        ],
      },
    },
  ],

  showNearYouButtons: true,
  allowLogin: false,
});
