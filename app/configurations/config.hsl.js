const CONFIG = 'hsl';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';
const APP_DESCRIPTION = 'Helsingin seudun liikenteen uusi Reittiopas.';
const YEAR = 1900 + new Date().getYear();

export default {
  CONFIG,

  URL: {
    OTP: process.env.OTP_URL || `${API_URL}/routing/v1/routers/hsl/`,
    STOP_MAP: `${MAP_URL}/map/v1/hsl-stop-map/`,
    CITYBIKE_MAP: `${MAP_URL}/map/v1/hsl-citybike-map/`,
    PARK_AND_RIDE_MAP: `${MAP_URL}/map/v1/hsl-parkandride-map/`,
    TICKET_SALES_MAP: `${MAP_URL}/map/v1/hsl-ticket-sales-map/`,
    FONT: 'https://cloud.typography.com/6364294/7572592/css/fonts.css',
  },

  contactName: {
    sv: 'HSR',
    fi: 'HSL',
    default: 'HSL',
  },

  title: 'Reittiopas',

  availableLanguages: ['fi', 'sv', 'en'],
  defaultLanguage: 'fi',

  favicon: './app/configurations/images/hsl/icon_favicon-reittiopas.svg',

  // Navbar logo
  logo: 'hsl/reittiopas-logo.svg',

  feedIds: ['HSL', 'HSLlautta'],

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
  itineraryFiltering: 2.5, // drops 40% worse routes

  parkAndRide: {
    showParkAndRide: true,
    parkAndRideMinZoom: 14,
  },

  ticketSales: {
    showTicketSales: true,
    ticketSalesMinZoom: 16,
  },

  showDisclaimer: true,

  stopsMinZoom: 14,

  colors: {
    primary: '#007ac9',
  },

  sprites: 'svg-sprite.hsl.svg',

  appBarLink: {
    name: 'HSL.fi',
    href: 'https://www.hsl.fi/uudetvy%C3%B6hykkeet',
  },

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

  useTicketIcons: true,

  transportModes: {
    airplane: {
      availableForSelection: false,
      defaultValue: false,
    },
  },

  streetModes: {
    bicycle: {
      availableForSelection: true,
      defaultValue: false,
      icon: 'biking',
    },

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

  search: {
    /* identify searches for route numbers/labels: bus | train | metro */
    lineRegexp: new RegExp(
      '(^[0-9]+[a-z]?$|^[yuleapinkrtdz]$|(^m[12]?b?$))',
      'i',
    ),
  },

  modesWithNoBike: ['BUS', 'TRAM'],

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
    [25.1312, 60.4938],
    [25.0385, 60.512],
    [25.057, 60.4897],
    [25.0612, 60.4485],
    [25.1221, 60.4474],
    [25.1188, 60.4583],
    [25.149, 60.4621],
    [25.1693, 60.5062],
    [25.2242, 60.5016],
    [25.3661, 60.4118],
    [25.3652, 60.3756],
    [25.5345, 60.2592],
  ],

  // If certain mode(s) only exist in limited number of areas, that are unwanted or unlikely places for transfers,
  // listing the areas as a list of polygons for selected mode key will remove the mode(s) from queries if no coordinates
  // in the query are within the polygon(s). This reduces complexity in finding routes for the query.
  modePolygons: {
    FERRY: [
      [
        [24.622249603271484, 60.07229224676235],
        [24.637884830688503, 59.88505587135504],
        [25.5169548306885, 59.97953111631855],
        [25.5471428306885, 60.12610949684163],
        [25.5874138306885, 60.217278733802786],
        [25.567278830688505, 60.253714828565585],
        [25.540005830688504, 60.26392585512848],
        [25.510870830688503, 60.257963839618654],
        [25.486343830688504, 60.2417947975602],
        [25.463923830688504, 60.22513375422919],
        [25.428940830688504, 60.21318972317029],
        [25.403793830688507, 60.221860745717784],
        [25.3897898306885, 60.23425077793933],
        [25.377848830688507, 60.2464088095613],
        [25.3724478306885, 60.26172184939482],
        [25.3640328306885, 60.264949857792516],
        [25.350781830688504, 60.261710849366196],
        [25.345287322998047, 60.2571037693223],
        [25.337905883789062, 60.25608180061736],
        [25.322113037109375, 60.25442103343004],
        [25.30726432800293, 60.25322863580357],
        [25.295162200927734, 60.25156772388639],
        [25.246854830688502, 60.24679381056279],
        [25.228986740112305, 60.24517881593554],
        [25.2185418306885, 60.236419783580416],
        [25.206461830688504, 60.2216457451587],
        [25.198944830688504, 60.19898668624201],
        [25.1839008306885, 60.18237664306198],
        [25.1598888306885, 60.17922563487137],
        [25.137870830688502, 60.18635165339491],
        [25.1048228306885, 60.1881906581755],
        [25.08831024169922, 60.184550027412534],
        [25.087108612060547, 60.191249428687115],
        [25.079126358032227, 60.194193319111065],
        [25.072174072265643, 60.18928668838159],
        [25.066852569580092, 60.1866837430631],
        [25.0648378306885, 60.1838686469404],
        [25.065479278564453, 60.180452904644355],
        [25.06959915161133, 60.178532202365126],
        [25.06857883068851, 60.175893626210524],
        [25.086504830688504, 60.17450762260796],
        [25.104188919067397, 60.16384578852122],
        [25.09114265441896, 60.15658554346332],
        [25.08788108825685, 60.14428217380287],
        [25.089534830688496, 60.13372351662316],
        [25.0660818306885, 60.12844450290783],
        [25.043817830688496, 60.12548349521532],
        [25.028839830688504, 60.13316351516825],
        [25.027112960815458, 60.138086026326405],
        [25.020952830688497, 60.143582542239656],
        [25.022649765014677, 60.15244221438077],
        [25.01569747924808, 60.15726892901616],
        [24.997442830688502, 60.1610085875235],
        [25.003166198730497, 60.171317895077564],
        [24.995956420898462, 60.176227211347644],
        [24.982051849365266, 60.17793462763434],
        [24.97673034667972, 60.174306261926006],
        [24.98445510864261, 60.16764610077333],
        [24.97776031494144, 60.162393867811595],
        [24.970167830688506, 60.15334956761956],
        [24.962139129638704, 60.15325383543087],
        [24.956517219543485, 60.1530829695065],
        [24.953899383544957, 60.15370235425736],
        [24.95128154754642, 60.1537664278759],
        [24.948835372924837, 60.15340334238628],
        [24.939479827880884, 60.1529548194804],
        [24.931068420410185, 60.14423944574835],
        [24.91484642028811, 60.142914848525194],
        [24.88111495971682, 60.13915441089104],
        [24.855966567993196, 60.14577762073669],
        [24.834337234497095, 60.158464819546865],
        [24.815797805786154, 60.163290649942105],
        [24.801979064941406, 60.15773874834221],
        [24.79528427124026, 60.15491973165539],
        [24.76816177368164, 60.148212917336885],
        [24.75614547729492, 60.146119427630715],
        [24.742029830688498, 60.137802527221275],
        [24.747304916381836, 60.128127013324765],
        [24.740781784057614, 60.11730973540785],
        [24.732112884521484, 60.110894650782555],
        [24.708337783813477, 60.1035799296882],
        [24.69675064086914, 60.10345158674782],
        [24.68155860900879, 60.10477777301953],
        [24.672889709472656, 60.116668283185575],
        [24.665164947509766, 60.11949057948517],
        [24.660710830688497, 60.1133394636678],
        [24.652118682861328, 60.100371206166294],
        [24.638729095458984, 60.08761878984714],
        [24.622249603271484, 60.07229224676235],
      ],
    ],
  },

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

  showTicketInformation: true,
  ticketLink: 'https://www.hsl.fi/uudetvyöhykkeet',
  showTicketSelector: true,

  fares: [
    'HSL:AB',
    'HSL:BC',
    'HSL:CD',
    'HSL:D',
    'HSL:ABC',
    'HSL:BCD',
    'HSL:ABCD',
  ],

  // mapping (string, lang) from OTP fare identifiers to human readable form
  // in the new HSL zone model, just strip off the prefix 'HSL:'
  fareMapping: function mapHslFareId(fareId) {
    return fareId && fareId.substring
      ? fareId.substring(fareId.indexOf(':') + 1)
      : '';
  },

  staticMessages: [
    {
      id: '2',
      content: {
        fi: [
          {
            type: 'text',
            content:
              'Käytämme evästeitä palveluidemme kehitykseen. Käyttämällä sivustoa hyväksyt evästeiden käytön. Lue lisää: ',
          },
          {
            type: 'a',
            content: 'Evästeet',
            href: 'https://www.hsl.fi/asiakaspalvelu/hsln-tietosuoja/evasteet',
          },
          {
            type: 'a',
            content: 'Tietosuojaseloste',
            href: 'https://www.hsl.fi/tietosuojaseloste',
          },
        ],
        en: [
          {
            type: 'text',
            content:
              'We use cookies to improve our services. By using this site, you agree to its use of cookies. Read more: ',
          },
          {
            type: 'a',
            content: 'Terms of use',
            href: 'https://www.hsl.fi/en/terms-of-use',
          },
          {
            type: 'a',
            content: 'Privacy Statement',
            href: 'https://www.hsl.fi/en/description-of-the-file',
          },
        ],
        sv: [
          {
            type: 'text',
            content:
              'Vi använder cookies för att utveckla våra tjänster. Genom att använda webbplatsen godkänner du att vi använder cookies. Läs mer: ',
          },
          {
            type: 'a',
            content: 'Cookies',
            href:
              'https://www.hsl.fi/sv/information/hrt-dataskydd/kakor-cookies',
          },
          {
            type: 'a',
            content: 'Dataskyddsbeskrivning',
            href: 'https://www.hsl.fi/sv/dataskyddsbeskrivning',
          },
        ],
      },
    },
  ],
  staticMessagesUrl: 'https://yleisviesti.hsldev.com/',
  geoJson: {
    layers: [
      {
        name: {
          fi: 'Maksuvyöhykkeet',
          sv: 'Resezoner',
          en: 'Ticket zones',
        },
        url: '/hsl_zone_lines.json',
      },
    ],
    zones: {
      url: '/hsl_zone_areas.json',
    },
  },
  mapLayers: {
    featureMapping: {
      ticketSales: {
        Palvelupiste: 'servicePoint',
        'HSL Automaatti MNL': 'ticketMachine',
        'HSL Automaatti KL': 'ticketMachine',
        Myyntipiste: 'salesPoint',
        'R-kioski': 'salesPoint',
      },
    },
  },
  stopCard: {
    header: {
      showZone: true,
    },
  },
};
