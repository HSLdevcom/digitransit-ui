const CONFIG = 'hsl';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const APP_DESCRIPTION = 'Helsingin seudun liikenteen uusi Reittiopas.';
const YEAR = 1900 + new Date().getYear();

export default {
  CONFIG,

  URL: {
    OTP: `${API_URL}/routing/v1/routers/hsl/`,
    STOP_MAP: `${MAP_URL}/map/v1/hsl-stop-map/`,
    CITYBIKE_MAP: `${MAP_URL}/map/v1/hsl-citybike-map/`,
    PARK_AND_RIDE_MAP: `${MAP_URL}/map/v1/hsl-parkandride-map/`,
    TICKET_SALES_MAP: `${MAP_URL}/map/v1/hsl-ticket-sales-map/`,
    FONT: 'https://cloud.typography.com/6364294/6653152/css/fonts.css',
  },

  contactName: {
    sv: 'HSR',
    fi: 'HSL',
    default: 'HSL',
  },

  title: 'Reittiopas',

  availableLanguages: ['fi', 'sv', 'en'],
  defaultLanguage: 'fi',

  favicon: './sass/themes/hsl/icon_favicon-reittiopas.svg',

  feedIds: ['HSL'],

  preferredAgency: 'HSL',
  showHSLTracking: true,

  defaultMapCenter: {
    lat: 60.1710688,
    lon: 24.9414841,
  },

  nearbyRoutes: {
    radius: 2000,
    bucketSize: 100,
  },

  maxWalkDistance: 2500,
  parkAndRide: {
    showParkAndRide: true,
    parkAndRideMinZoom: 14,
  },

  ticketSales: {
    showTicketSales: true,
    ticketSalesMinZoom: 16,
  },

  stopsMinZoom: 14,

  colors: {
    primary: '#007ac9',
  },

  sprites: 'svg-sprite.hsl.svg',

  appBarLink: { name: 'HSL.fi', href: 'https://www.hsl.fi/' },

  nationalServiceLink: { name: 'matka.fi', href: 'https://opas.matka.fi/' },

  agency: {
    show: false,
  },

  socialMedia: {
    title: 'Uusi Reittiopas',
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

  showTicketInformation: true,
  ticketLink: 'https://www.hsl.fi/liput-ja-hinnat',

  transportModes: {
    airplane: {
      availableForSelection: false,
      defaultValue: false,
    },
  },

  streetModes: {
    car_park: {
      availableForSelection: true,
      defaultValue: false,
      icon: 'car-withoutBox',
    },

    car: {
      availableForSelection: false,
      defaultValue: false,
      icon: 'car_park-withoutBox',
    },
  },

  useSearchPolygon: true,

  areaPolygon: [
    [24.2647, 60.178],
    [24.3097, 60.2537],
    [24.3903, 60.3058],
    [24.4683, 60.3123],
    [24.4918, 60.3438],
    [24.5685, 60.3371],
    [24.6128, 60.3755],
    [24.739, 60.3642],
    [24.8046, 60.4071],
    [24.8684, 60.4192],
    [24.9694, 60.3508],
    [24.9992, 60.3524],
    [24.9865, 60.3732],
    [25.0452, 60.391],
    [25.0411, 60.4251],
    [25.1126, 60.4522],
    [25.162, 60.5238],
    [25.2438, 60.5168],
    [25.3261, 60.4666],
    [25.444, 60.3445],
    [25.5622, 60.2691],
    [25.4213, 60.1613],
    [25.3479, 59.9218],
    [24.94, 59.904],
    [24.5041, 59.801],
    [24.2785, 59.7737],
    [24.246, 59.791],
    [24.2367, 59.9579],
    [24.2579, 60.017],
    [24.3257, 60.0729],
    [24.2647, 60.178],
  ],

  footer: {
    content: [
      { label: `© HSL ${YEAR}` },
      {},
      {
        name: 'footer-faq',
        nameEn: 'FAQ',
        href: 'https://www.hsl.fi/ohjeita-ja-tietoja/reittiopas',
      },
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href: 'https://www.hsl.fi/palaute',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About the service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
      {
        name: 'footer-link-to-privacy-policy',
        nameEn: 'Privacy policy',
        href: 'https://www.hsl.fi/tietoa-sivustosta',
      },
    ],
  },

  defaultEndpoint: {
    address: 'Rautatieasema, Helsinki',
    lat: 60.1710688,
    lon: 24.9414841,
  },

  defaultOrigins: [
    {
      icon: 'icon-icon_rail',
      label: 'Rautatieasema, Helsinki',
      lat: 60.1710688,
      lon: 24.9414841,
    },
    {
      icon: 'icon-icon_airplane',
      label: 'Lentoasema, Vantaa',
      lat: 60.317429,
      lon: 24.9690395,
    },
    {
      icon: 'icon-icon_bus',
      label: 'Kampin bussiterminaali, Helsinki',
      lat: 60.16902,
      lon: 24.931702,
    },
  ],

  redirectReittiopasParams: true,
  queryMaxAgeDays: 14, // to drop too old route request times from entry url

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tervetuloa Reittioppaaseen! Reittiopas kertoo, miten pääset nopeasti ja helposti perille joukkoliikenteellä Helsingissä, Espoossa, Vantaalla, Kauniaisissa, Keravalla, Kirkkonummella ja Sipoossa. Reittiopas etsii nopeat reitit myös kävelyyn ja pyöräilyyn sekä rajatusti myös yksityisautoiluun. Reittiopas-palvelun tarjoaa HSL Helsingin seudun liikenne, ja se perustuu Digitransit-palvelualustaan.',
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
          'Den här tjänsten erbjuds av HRT för reseplanering inom huvudstadsregionen (Helsingfors, Esbo, Vanda, Grankulla, Kervo, Kyrkslätt och Sibbo). Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
      {
        header: 'Datakällor',
        paragraphs: [
          'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller är baserad på HRT:s JORE data.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'Welcome to the Journey Planner! The Journey Planner shows you how to get to your destination fast and easy by public transport in Helsinki, Espoo, Vantaa, Kauniainen, Kerava, Kirkkonummi and Sipoo. You can also use the planner to find fast walking and cycling routes, and to an extent, for driving directions. The Journey Planner is provided by HSL Helsinki Region Transport and it is based on the Digitransit service platform.',
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

  fareMapping: {
    'HSL:hki': 'HSL:hki',
    'HSL:esp': 'HSL:esp',
    'HSL:van': 'HSL:van',
    'HSL:ker': 'HSL:ker',
    'HSL:kir': 'HSL:kir',
    'HSL:seu': 'HSL:seu',
    'HSL:seu2': 'HSL:seu',
    'HSL:seu3': 'HSL:seu',
    'HSL:seu4': 'HSL:seu',
    'HSL:lse': 'HSL:lse2',
    'HSL:lse2': 'HSL:lse2',
    'HSL:lse3': 'HSL:lse2',
    'HSL:lse4': 'HSL:lse2',
    'HSL:lse5': 'HSL:lse2',
    'HSL:kse': 'HSL:lse3',
    'HSL:kse2': 'HSL:lse3',
    'HSL:kse3': 'HSL:lse3',
    'HSL:kse4': 'HSL:lse3',
    'HSL:kse5': 'HSL:lse3',
    'HSL:kse6': 'HSL:lse3',
    'HSL:kse7': 'HSL:lse3',
    'HSL:kse8': 'HSL:lse3',
  },
  staticMessagesUrl: 'https://yleisviesti.hsldev.com/',
};
