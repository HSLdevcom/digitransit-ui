/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'colombiatransit';
const APP_TITLE = 'ColombiaTransit';
const APP_DESCRIPTION = 'Uusi Reittiopas - colombiatransit';

const walttiConfig = require('./config.waltti').default;

const API_URL = process.env.API_URL || 'https://api.colombiatransit.co';
const OTP_URL = process.env.OTP_URL || `${API_URL}/api/otp/v2/`;
const MAP_URL = process.env.MAP_URL || 'https://tileserver.colombiatransit.co';
const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || `${API_URL}/api/pelias`;
const POI_MAP_PREFIX = `${OTP_URL}vectorTiles`;

const rootLink = process.env.ROOTLINK || 'https://digitransit.colombiatransit.co';

const minLat = -4.2316872;
const maxLat = 16.0571269;
const minLon = -82.1243666;
const maxLon = -66.8511907;

export default configMerger(walttiConfig, {
  CONFIG,

  URL: {
    OTP: OTP_URL,
    MAP: {
      default: `${MAP_URL}/styles/osm-bright/`,      
    },
    STOP_MAP: {
      default: `${POI_MAP_PREFIX}/stops,stations/`,      
    },
    RENTAL_STATION_MAP: {
      default: `${POI_MAP_PREFIX}/rentalStations/`,
    },
    REALTIME_RENTAL_STATION_MAP: {
      default: `${POI_MAP_PREFIX}/realtimeRentalStations/`,
    },
    PARK_AND_RIDE_MAP: {
      default: `${POI_MAP_PREFIX}/vehicleParking/`,      
    },
    PARK_AND_RIDE_GROUP_MAP: {
      default: `${POI_MAP_PREFIX}/vehicleParkingGroups/`,
    },    
    ROOTLINK: rootLink,
    PELIAS: `${process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL}/search`,
    PELIAS_REVERSE_GEOCODER: `${
      process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
    }/reverse`,
    PELIAS_PLACE: `${
      process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
    }/place`,  
  },

  appBarLink: { name: 'Colombiatransit', href: 'http://colombiatransit.co/' },

  colors: {
    primary: '#dc0451',
    iconColors: {
      'mode-bus': '#007ac9',
      'mode-bus-express': '#CA4000',
      'mode-bus-local': '#007ac9',
      'mode-rail': '#8c4799',
      'mode-tram': '#008151',
      'mode-ferry': '#007A97',
      'mode-ferry-pier': '#666666',
      'mode-metro': '#CA4000',
      'mode-citybike': '#f2b62d',
      'mode-citybike-secondary': '#333333',
    },
  },

  availableLanguages: ['fi', 'sv', 'en'],
  defaultLanguage: 'fi',

  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
      nearYouLabel: {
        fi: 'Bussit ja lähipysäkit kartalla',
        sv: 'Bussar och hållplatser på kartan',
        en: 'Buses and nearby stops on map',
      },
    },

    rail: {
      availableForSelection: false,
      defaultValue: false,
      nearYouLabel: {
        fi: 'Junat ja lähiasemat kartalla',
        sv: 'Tåg och stationer på kartan',
        en: 'Trains and nearby stations on map',
      },
    },

    tram: {
      availableForSelection: false,
      defaultValue: false,
      nearYouLabel: {
        fi: 'Raitiovaunut ja lähipysäkit kartalla',
        sv: 'Spårvagnar och hållplatser på kartan',
        en: 'Trams and nearby stops on map',
      },
    },

    subway: {
      availableForSelection: true,
      defaultValue: true,
      nearYouLabel: {        
        en: 'Metro and nearby stations on map',
      },
    },

    citybike: {
      availableForSelection: false,
      defaultValue: false,
      nearYouLabel: {        
        en: 'The closest city bike stations',
      },
    },

    airplane: {
      availableForSelection: true,
      defaultValue: true,
      nearYouLabel: {        
        en: 'The closest airports',
      },
    },

    ferry: {
      availableForSelection: true,
      defaultValue: true,
      nearYouLabel: {       
        en: 'The closest ferry piers',
      },
    },

    funicular: {
      availableForSelection: true,
      defaultValue: true,
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  textLogo: true,
  useCookiesPrompt: true,

  feedIds: ["LAN-Taganga","Rápido Duitama","SotrapeÃ±ol","Cootrasana","COSTALINE","Monserrate","Sotramagdalena","112","90","94","10","BERLINAVE","11","12","14","COFLONORTE","18","Cootracegua","19","Exalpa","METROSINU","Expreso Paz de Rio S.A.","Cootranstame","Flotaospina","Autoboy","1","4","6","Expreso cafetero","Lineas del Valle","Coomultransvilla","Transportes Tisquesusa","21","YAMEYA","22","Sotraretiro S.C.A.","25","26","Sotracor","27","Cootrasan","Morichal","Flota huila","Coochoferes","CONTINENTAL","Transporteslusitania","corredordelpacifico","POPAYAN","Transportes Marsol","Expreso Gaviota","Transportes Gomez Hernandez","33","Tebaida","Almirante Padilla S.A.","38","Expreso Sideral","sotrasanvicente","Sotrauraba","RMR","BOG-SB","Concorde","41","FLOTA-GRANADA","44","Taxmeta S.A.","Cootransunidos","Superstar","Flota La Macarena","55","Cootrasaravita","Taxlaferia","VAL-SIVA","transipiales","Lineas Verdes","Transportesjerico","Empresa Arauca","Libertadores","Cooptmotilon","Tax Belalcazar","Tax Central S.A.","Cootranstol","61","63","Cotrasangil","65","Cootrayal","67","Expreso Palmira","Cootranshuila","RÃ¡pido Ochoa","Berlinas del Fonce","Omega","Unitransco","Las Acacias","Flota Occidental","Rapido Tolima","72","EXPRESO-GAITANA","73","75","Taxis Verdes","Cotrans","76","77","Rápido El Carmen","Transportes La Esperanza S.A.","TRANS-LUZ","Berlitur","Cootransmagdalena","102","104","Flota Aguila","81","Sugamuxi","EXPRESO-BELMIRA"],

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
    address: 'Bogotá Eldorado Airport',
    lat: 4.701944,
    lon: -74.147222,
  },

  menu: {
    copyright: { label: `© Colombiatransit ${walttiConfig.YEAR}` },
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

  map: {
    useRetinaTiles: true,
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    maxZoom: 14,
    controls: {
      zoom: {
        // available controls positions: 'topleft', 'topright', 'bottomleft, 'bottomright'
        position: 'bottomright',
      },
      scale: {
        position: 'bottomright',
      },
    },
    genericMarker: {
      // Do not render name markers at zoom levels below this value
      nameMarkerMinZoom: 18,

      popup: {
        offset: [106, 16],
        maxWidth: 250,
        minWidth: 250,
      },
    },

    line: {
      halo: {
        weight: 7,
        thinWeight: 2,
      },

      leg: {
        weight: 6,
        thinWeight: 2,
      },

      passiveColor: '#758993',
    },

    showZoomControl: true, // DT-3470
    showLayerSelector: true, // DT-3470
    showStopMarkerPopupOnMobile: true, // DT-3470
    showScaleBar: true, // DT-3470
    attribution:
      '<a tabIndex="-1" href="http://osm.org/copyright">© OpenStreetMap</a>', // DT-3470, DT-3397

    useModeIconsInNonTileLayer: false,
    // areBounds is for keeping map and user inside given area
    // Finland + Stockholm
    areaBounds: {
      corner1: [16.0571269, -66.8511907], //north east
      corner2: [-4.2316872, -82.1243666], //south west
    },
  },

  stopCard: {
    header: {
      showDescription: true,
      showStopCode: true,
      showDistance: true,
    },
  },

  aboutThisService: {
    
    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Colombiatransit for route planning in Colombiatransit region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
  hostnames: [
    // DEV hostnames    
    'https://digitransit.colombiatransit.co',    
    // PROD hostnames
    'https://colombiatransit.co',
  ],
},
);
