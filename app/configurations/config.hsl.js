/* eslint-disable prefer-template */
import { BIKEAVL_WITHMAX } from '../util/citybikes';

const CONFIG = 'hsl';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const MAP_PATH_PREFIX = process.env.MAP_PATH_PREFIX || '';
const APP_DESCRIPTION = 'Helsingin seudun liikenteen Reittiopas.';

const HSLTimetables = require('./timetableConfigUtils').default.HSL;

const rootLink = process.env.ROOTLINK || 'https://dev.hslfi.hsldev.com';
const BANNER_URL = 'https://content.hsl.fi/api/v1/banners?site=JourneyPlanner';
// 'https://test-api.hslfi.hsldev.com/api/v1/banners?site=JourneyPlanner';

export default {
  CONFIG,

  URL: {
    OTP: process.env.OTP_URL || `${API_URL}/routing/v1/routers/hsl/`,
    STOP_MAP: `${MAP_URL}/map/v1/${MAP_PATH_PREFIX}hsl-stop-map/`,
    PARK_AND_RIDE_MAP: `${MAP_URL}/map/v1/${MAP_PATH_PREFIX}hsl-parkandride-map/`,
    FONT: 'https://cloud.typography.com/6364294/7432412/css/fonts.css',
    CITYBIKE_MAP: `${MAP_URL}/map/v1/${MAP_PATH_PREFIX}hsl-citybike-map/`,
    ROOTLINK: rootLink,
    BANNERS: BANNER_URL,
    HSL_FI_SUGGESTIONS: 'https://content.hsl.fi/api/v1/search/suggestions',
  },

  indexPath: 'etusivu',

  contactName: {
    sv: 'HSR',
    fi: 'HSL',
    default: 'HSL',
  },

  title: 'Reittiopas',

  availableLanguages: ['fi', 'sv', 'en'],
  defaultLanguage: 'fi',
  passLanguageToRootLink: true,

  favicon: './app/configurations/images/hsl/favicon.png',

  // Navbar logo
  logo: 'hsl/reittiopas-logo.svg',

  feedIds: ['HSL', 'HSLlautta'],

  showHSLTracking: false,
  allowLogin: true,
  allowFavouritesFromLocalstorage: !process.env.OIDC_CLIENT_ID,

  nearbyRoutes: {
    radius: 500,
    bucketSize: 100,
  },

  omitNonPickups: true,

  maxWalkDistance: 2500,
  itineraryFiltering: 2.5, // drops 40% worse routes

  parkAndRide: {
    showParkAndRide: true,
    parkAndRideMinZoom: 14,
  },

  showDisclaimer: true,

  stopsMinZoom: 14,
  mergeStopsByCode: true,

  colors: {
    primary: '#007ac9',
    hover: '#0062a1',
    iconColors: {
      'mode-bus': '#007ac9',
      'mode-rail': '#8c4799',
      'mode-tram': '#008151',
      'mode-ferry': '#007A97',
      'mode-metro': '#CA4000',
      'mode-citybike': '#f2b62d',
      'mode-citybike-secondary': '#333333',
    },
  },

  fontWeights: {
    medium: 500,
  },

  sprites: 'assets/svg-sprite.hsl.svg',

  appBarStyle: 'hsl',

  nationalServiceLink: { name: 'matka.fi', href: 'https://opas.matka.fi/' },

  agency: {
    show: false,
  },

  socialMedia: {
    title: 'Reittiopas',
    description: APP_DESCRIPTION,

    image: {
      url: '/img/hsl-social-share.png',
      width: 400,
      height: 400,
    },

    twitter: {
      card: 'summary',
      site: '@HSL_HRT',
    },
  },

  meta: {
    description: APP_DESCRIPTION,
  },

  transportModes: {
    citybike: {
      availableForSelection: true,
    },
    airplane: {
      availableForSelection: false,
      defaultValue: false,
    },
  },

  search: {
    /* identify searches for route numbers/labels: bus | train | metro */
    lineRegexp: new RegExp(
      '(^[0-9]+[a-z]?$|^[yuleapinkrtdz]$|(^m[12]?b?$))',
      'i',
    ),
  },

  // modes that should not coexist with BICYCLE mode
  modesWithNoBike: ['BICYCLE_RENT', 'WALK', 'BUS', 'TRAM', 'FERRY'],

  useSearchPolygon: true,

  areaPolygon: [
    [25.5345, 60.2592],
    [25.3881, 60.1693],
    [25.3559, 60.103],
    [25.3293, 59.9371],
    [24.2831, 59.78402],
    [24.2721, 59.95501],
    [24.2899, 60.00895],
    [24.3087, 60.01947],
    [24.1994, 60.12753],
    [24.1362, 60.1114],
    [24.1305, 60.12847],
    [24.099, 60.1405],
    [24.0179, 60.1512],
    [24.0049, 60.1901],
    [24.0445, 60.1918],
    [24.0373, 60.2036],
    [24.0796, 60.2298],
    [24.1652, 60.2428],
    [24.3095, 60.2965],
    [24.3455, 60.2488],
    [24.428, 60.3002],
    [24.5015, 60.2872],
    [24.4888, 60.3306],
    [24.5625, 60.3142],
    [24.5957, 60.3242],
    [24.6264, 60.3597],
    [24.666, 60.3638],
    [24.7436, 60.3441],
    [24.9291, 60.4523],
    [24.974, 60.5253],
    [24.9355, 60.5131],
    [24.8971, 60.562],
    [25.0388, 60.5806],
    [25.1508, 60.5167],
    [25.2242, 60.5016],
    [25.3661, 60.4118],
    [25.3652, 60.3756],
  ],

  // If certain mode(s) only exist in limited number of areas, that are unwanted or unlikely places for transfers,
  // listing the areas as a list of polygons for selected mode key will remove the mode(s) from queries if no coordinates
  // in the query are within the polygon(s). This reduces complexity in finding routes for the query.
  modePolygons: {
    FERRY: [
      [
        [24.63006, 60.074576],
        [24.660625, 60.113425],
        [24.69124, 60.107706],
        [24.715029, 60.097581],
        [24.755061, 60.110121],
        [24.7684, 60.12747],
        [24.741944, 60.137888],
        [24.766268, 60.149167],
        [24.79965, 60.153677],
        [24.825623, 60.150484],
        [24.847359, 60.14129],
        [24.878784, 60.135211],
        [24.925075, 60.144717],
        [24.932484, 60.151908],
        [24.951109, 60.154663],
        [24.957653, 60.152834],
        [24.965618, 60.155976],
        [24.959649, 60.161454],
        [24.968876, 60.162671],
        [24.981462, 60.167184],
        [24.975605, 60.175104],
        [24.981962, 60.177926],
        [24.993498, 60.17687],
        [24.997357, 60.161094],
        [25.020459, 60.161442],
        [25.030537, 60.158628],
        [25.020867, 60.143668],
        [25.028754, 60.133249],
        [25.043732, 60.125569],
        [25.065996, 60.12853],
        [25.089449, 60.133809],
        [25.098075, 60.14447],
        [25.103441, 60.165948],
        [25.086419, 60.174593],
        [25.068493, 60.175979],
        [25.064752, 60.183954],
        [25.070873, 60.192076],
        [25.083312, 60.196155],
        [25.100825, 60.189909],
        [25.104737, 60.188276],
        [25.137785, 60.186437],
        [25.159803, 60.179311],
        [25.183815, 60.182462],
        [25.198859, 60.199072],
        [25.206376, 60.221731],
        [25.218456, 60.236505],
        [25.246769, 60.246879],
        [25.294546, 60.250321],
        [25.322258, 60.252981],
        [25.339717, 60.254482],
        [25.350696, 60.261796],
        [25.363947, 60.265035],
        [25.372362, 60.261807],
        [25.377763, 60.246494],
        [25.389704, 60.234336],
        [25.403708, 60.221946],
        [25.428855, 60.213275],
        [25.463838, 60.225219],
        [25.486258, 60.24188],
        [25.510785, 60.258049],
        [25.53992, 60.264011],
        [25.567193, 60.2538],
        [25.587328, 60.217364],
        [25.547057, 60.126195],
        [25.516869, 59.979617],
        [24.637799, 59.885142],
      ],
    ],
  },
  menu: {},

  defaultEndpoint: {
    address: 'Rautatieasema, Helsinki',
    lat: 60.1710688,
    lon: 24.9414841,
  },

  redirectReittiopasParams: true,
  queryMaxAgeDays: 14, // to drop too old route request times from entry url

  timetables: {
    HSL: HSLTimetables,
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tervetuloa Reittioppaaseen! Reittiopas kertoo, miten pääset nopeasti ja helposti perille joukkoliikenteellä Helsingissä, Espoossa, Vantaalla, Kauniaisissa, Keravalla, Kirkkonummella, Sipoossa, Siuntiossa ja Tuusulassa. Reittiopas etsii nopeat reitit myös kävelyyn ja pyöräilyyn sekä rajatusti myös yksityisautoiluun. Reittiopas-palvelun tarjoaa HSL Helsingin seudun liikenne, ja se perustuu Digitransit-palvelualustaan.',
        ],
      },
      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut perustuvat HSL:n JORE-aineistoon.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av HRT för reseplanering inom huvudstadsregionen (Helsingfors, Esbo, Vanda, Grankulla, Kervo, Kyrkslätt, Sibbo, Sjundeå och Tusby). Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
      {
        header: 'Datakällor',
        paragraphs: [
          'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller är baserade på HRT:s JORE data.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'Welcome to the Journey Planner! The Journey Planner shows you how to get to your destination fast and easy by public transport in Helsinki, Espoo, Vantaa, Kauniainen, Kerava, Kirkkonummi, Sipoo, Siuntio and Tuusula. You can also use the planner to find fast walking and cycling routes, and to an extent, for driving directions. The Journey Planner is provided by HSL Helsinki Region Transport and it is based on the Digitransit service platform.',
        ],
      },
      {
        header: 'Data sources',
        paragraphs: [
          'Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is retrieved from the Building and Dwelling Register of the Finnish Population Register Center. Public transport routes and timetables are based on JORE data of HSL.',
        ],
      },
    ],
  },

  hideExternalOperator: agency => agency.name === 'Helsingin seudun liikenne',
  showTicketInformation: true,
  ticketInformation: {
    primaryAgencyName: 'HSL',
  },

  maxNearbyStopAmount: 5,
  maxNearbyStopDistance: {
    favorite: 100000,
    bus: 30000,
    tram: 100000,
    subway: 100000,
    rail: 50000,
    ferry: 100000,
    citybike: 100000,
  },

  prioritizedStopsNearYou: {
    ferry: ['HSL:1030701'],
  },

  showTicketSelector: true,

  staticMessages: [
    // {
    //   id: '2',
    //   priority: -1,
    //   content: {
    //     fi: [
    //       {
    //         type: 'text',
    //         content:
    //           'Käytämme evästeitä palveluidemme kehitykseen. Käyttämällä sivustoa hyväksyt evästeiden käytön. Lue lisää: ',
    //       },
    //       {
    //         type: 'a',
    //         content: 'Käyttöehdot',
    //         href: 'https://www.hsl.fi/kayttoehdot',
    //       },
    //       {
    //         type: 'a',
    //         content: 'Tietosuojaseloste',
    //         href: 'https://www.hsl.fi/tietosuojaseloste',
    //       },
    //     ],
    //     en: [
    //       {
    //         type: 'text',
    //         content:
    //           'We use cookies to improve our services. By using this site, you agree to its use of cookies. Read more: ',
    //       },
    //       {
    //         type: 'a',
    //         content: 'Terms of use',
    //         href: 'https://www.hsl.fi/en/terms-of-use',
    //       },
    //       {
    //         type: 'a',
    //         content: 'Privacy Statement',
    //         href: 'https://www.hsl.fi/en/description-of-the-file',
    //       },
    //     ],
    //     sv: [
    //       {
    //         type: 'text',
    //         content:
    //           'Vi använder cookies för att utveckla våra tjänster. Genom att använda webbplatsen godkänner du att vi använder cookies. Läs mer: ',
    //       },
    //       {
    //         type: 'a',
    //         content: 'Användarvillkor',
    //         href: 'https://www.hsl.fi/sv/anvandarvillkor',
    //       },
    //       {
    //         type: 'a',
    //         content: 'Dataskyddsbeskrivning',
    //         href: 'https://www.hsl.fi/sv/dataskyddsbeskrivning',
    //       },
    //     ],
    //   },
    // },
  ],
  geoJson: {
    layers: [
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/hsl_zone_lines_20190508.geojson',
      },
    ],
  },

  // mapping fareId from OTP fare identifiers to human readable form
  // in the new HSL zone model, just strip off the prefix 'HSL:'
  fareMapping: function mapHslFareId(fareId) {
    return fareId && fareId.substring
      ? fareId.substring(fareId.indexOf(':') + 1)
      : '';
  },

  unknownZones: ['Ei HSL'],

  showTicketPrice: true,

  map: {
    showZoomControl: true, // DT-3470, DT-3397
    showLayerSelector: false, // DT-3470
    showStopMarkerPopupOnMobile: false, // DT-3470
    showScaleBar: true, // DT-3470, DT-3397
    attribution:
      '<a tabindex="-1" href="http://osm.org/copyright">© OpenStreetMap</a>', // DT-3470, DT-3397
  },

  useTicketIcons: true,
  trafficNowLink: {
    fi: 'matkustaminen/liikenne',
    en: 'travelling/services-now',
    sv: 'att-resa/Trafiken-just-nu',
  },

  localStorageEmitter: rootLink + '/local-storage-emitter',
  localStorageTarget: rootLink,

  cityBike: {
    minZoomStopsNearYou: 10,
    showFullInfo: true,
    networks: {
      smoove: {
        enabled: true,
        season: {
          // 1.4. - 31.10.
          start: new Date(new Date().getFullYear(), 3, 1),
          end: new Date(new Date().getFullYear(), 10, 1),
        },
        capacity: BIKEAVL_WITHMAX,
        icon: 'citybike',
        name: {
          fi: 'Helsinki ja Espoo',
          sv: 'Helsingfors och Esbo',
          en: 'Helsinki and Espoo',
        },
        type: 'citybike',
        url: {
          fi:
            'https://www.hsl.fi/kaupunkipyorat?utm_campaign=kaupunkipyorat-omat&utm_source=reittiopas&utm_medium=referral#block-28474',
          sv:
            'https://www.hsl.fi/sv/stadscyklar?utm_campaign=kaupunkipyorat-omat&utm_source=reittiopas&utm_medium=referral#block-28474',
          en:
            'https://www.hsl.fi/en/citybikes?utm_campaign=kaupunkipyorat-omat&utm_source=reittiopas&utm_medium=referral#block-28474',
        },
        returnInstructions: {
          fi: 'https://www.hsl.fi/kaupunkipyorat/helsinki/kayttoohje#palauta',
          sv:
            'https://www.hsl.fi/sv/stadscyklar/helsingfors/anvisningar#aterlamna',
          en: 'https://www.hsl.fi/en/citybikes/helsinki/instructions#return',
        },
        // Shown if citybike leg duration exceeds timeBeforeSurcharge
        durationInstructions: {
          fi: 'https://www.hsl.fi/kaupunkipyorat/helsinki/kayttoohje#aja',
          sv: 'https://www.hsl.fi/sv/stadscyklar/helsingfors/anvisningar#cykla',
          en: 'https://www.hsl.fi/en/citybikes/helsinki/instructions#ride',
        },
        timeBeforeSurcharge: 30 * 60,
      },
      vantaa: {
        enabled: true,
        season: {
          // 1.4. - 31.10.
          start: new Date(new Date().getFullYear(), 3, 1),
          end: new Date(new Date().getFullYear(), 10, 1),
        },
        capacity: BIKEAVL_WITHMAX,
        icon: 'citybike-secondary',
        name: {
          fi: 'Vantaa',
          sv: 'Vanda',
          en: 'Vantaa',
        },
        type: 'citybike',
        url: {
          fi:
            'https://www.hsl.fi/kaupunkipyorat?utm_campaign=kaupunkipyorat-omat&utm_source=reittiopas&utm_medium=referral#block-28474',
          sv:
            'https://www.hsl.fi/sv/stadscyklar?utm_campaign=kaupunkipyorat-omat&utm_source=reittiopas&utm_medium=referral#block-28474',
          en:
            'https://www.hsl.fi/en/citybikes?utm_campaign=kaupunkipyorat-omat&utm_source=reittiopas&utm_medium=referral#block-28474',
        },
        returnInstructions: {
          fi: 'https://www.hsl.fi/kaupunkipyorat/vantaa/kayttoohje#palauta',
          sv: 'https://www.hsl.fi/sv/stadscyklar/vanda/anvisningar#aterlamna',
          en: 'https://www.hsl.fi/en/citybikes/vantaa/instructions#return',
        },
        durationInstructions: {
          fi: 'https://www.hsl.fi/kaupunkipyorat/vantaa/kayttoohje#aja',
          sv: 'https://www.hsl.fi/sv/stadscyklar/vanda/anvisningar#cykla',
          en: 'https://www.hsl.fi/en/citybikes/vantaa/instructions#ride',
        },
        timeBeforeSurcharge: 60 * 60,
      },
    },
    buyUrl: {
      fi:
        'https://www.hsl.fi/kaupunkipyorat?utm_campaign=kaupunkipyorat-omat&utm_source=reittiopas&utm_medium=referral#block-28474',
      sv:
        'https://www.hsl.fi/sv/stadscyklar?utm_campaign=kaupunkipyorat-omat&utm_source=reittiopas&utm_medium=referral#block-28474',
      en:
        'https://www.hsl.fi/en/citybikes?utm_campaign=kaupunkipyorat-omat&utm_source=reittiopas&utm_medium=referral#block-28474',
    },
  },

  // DT-3611
  showVehiclesOnSummaryPage: true,
  showBikeAndPublicItineraries: true,
  showBikeAndParkItineraries: true,

  includeCarSuggestions: false,
  includeParkAndRideSuggestions: false,

  showNearYouButtons: true,
  nearYouModes: [
    'favorite',
    'bus',
    'tram',
    'subway',
    'rail',
    'ferry',
    'citybike',
  ],

  hostnames: [
    // DEV hostnames
    'https://next-dev.digitransit.fi',
    'https://dev.reittiopas.fi',
    // PROD hostnames
    'https://reittiopas.hsl.fi',
  ],
  zones: {
    stops: true,
    itinerary: true,
  },

  showSimilarRoutesOnRouteDropDown: true,
};
