/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'varely';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const APP_TITLE = 'Seutu+ reittiopas';
const APP_DESCRIPTION = 'Varsinais-Suomen ELY-keskuksen reittiopas';
const OTP_URL =
  process.env.DEV_OTP_URL || `${API_URL}/routing/v2/routers/varely/`;

const walttiConfig = require('./config.waltti').default;

const colorPrimary = '#008161';

export default configMerger(walttiConfig, {
  CONFIG,

  URL: {
    OTP: OTP_URL,

    // read stops and stations OTP2 vector map tile server
    STOP_MAP: `${OTP_URL}vectorTiles/stops,stations/`,
  },

  feedIds: ['VARELY'],

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

  transportModes: {
    bus: {
      availableForSelection: true,
      color: colorPrimary,
    },
  },

  // Varsinais-Suomi (acquired from: https://github.com/varmais/maakunnat/blob/master/maakunnat.geojson?short_path=81dbd20#L184)
  areaPolygon: [
    [23.8444924814847, 60.5564234608289],
    [23.8718498390061, 60.5079343177639],
    [23.7374861102945, 60.4903694526805],
    [23.7392107783752, 60.4570280608957],
    [23.7841403962846, 60.4501860171273],
    [23.7904872761377, 60.3878252264493],
    [23.7231724470293, 60.3687558640532],
    [23.7288802547616, 60.3289928175809],
    [23.5863215757807, 60.2588404740135],
    [23.620482993615, 60.1941330971222],
    [23.5536157331398, 60.2022045336664],
    [23.3629375270082, 60.1498987832029],
    [23.3059107088599, 60.1886601005766],
    [23.1486497235852, 60.1004406461065],
    [22.9873523781496, 60.0955386567522],
    [22.9535259481759, 59.9994616038113],
    [22.8532644170828, 60.0130474595162],
    [22.8013167173145, 60.0253749161876],
    [22.814285694378, 59.8775819084241],
    [22.6589214998962, 59.6110037650124],
    [22.3965363353683, 59.5130927645348],
    [22.0980873617657, 59.5010738787032],
    [21.4966655585993, 59.4756414613716],
    [21.179719972206, 59.4992051495534],
    [21.2690988046715, 59.7491787395336],
    [21.3456450630018, 59.8855653028753],
    [21.171384977304, 59.9501568792385],
    [21.1333489281079, 60.0444555649669],
    [21.0630070233876, 60.1039681002603],
    [21.0238299636455, 60.1239329302762],
    [21.0895789318686, 60.2579079092491],
    [21.1513410937851, 60.4986621677466],
    [21.1238560312089, 60.5702681432357],
    [20.9699293698138, 60.7129001915919],
    [20.7300062601649, 60.7231042606544],
    [20.377530566665, 60.8766383898234],
    [20.4375585336477, 60.9018089858616],
    [20.7714473222996, 61.1269082829326],
    [20.7731306640216, 61.1334820093468],
    [21.3160314289992, 61.1035621481416],
    [21.4385434764992, 61.0253588258809],
    [21.588694266309, 61.017852664261],
    [21.6211639976073, 61.0517897613424],
    [21.6655923529297, 60.9963322265321],
    [21.7757521875132, 61.0341121822396],
    [21.8441098825992, 61.0094022869855],
    [21.9513651886671, 60.9769360921387],
    [21.9852143271888, 60.9010017908562],
    [22.1284673358999, 60.9042053748535],
    [22.1603136298974, 60.872005742252],
    [22.2636319137678, 60.9268634929992],
    [22.5862395363871, 60.9387902842212],
    [22.5224658599489, 60.9764011486595],
    [22.7015444833562, 60.9869355213992],
    [22.8159330500711, 60.9934086959638],
    [22.8239105462591, 61.1014353230567],
    [22.9685045911258, 61.0432543592972],
    [23.1480763911579, 61.0314112728734],
    [23.1953659337831, 61.0012198061957],
    [23.2939289650869, 60.9546973502472],
    [23.2666648001427, 60.8891094973244],
    [23.1356381158651, 60.8835184432551],
    [23.1425818545095, 60.8375029516263],
    [23.2300696798524, 60.8254067720859],
    [23.1546153515598, 60.774168236997],
    [23.277278877002, 60.7110753927394],
    [23.4086239807213, 60.7397738005781],
    [23.5021368978366, 60.74398925754],
    [23.6841473311603, 60.6572412734499],
    [23.9005068090951, 60.649756842486],
    [23.9205490912796, 60.606087320827],
    [23.8444924814847, 60.5564234608289],
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
          'Den här tjänsten erbjuds av HRT för reseplanering inom huvudstadsregionen (Åbo, Aura, Masku, Mynämäki, Nousis, Pemar and Pargas). Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
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

  staticMessages: [],

  showNearYouButtons: true,
  allowLogin: false,
});
