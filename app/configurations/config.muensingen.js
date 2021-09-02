/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'rt';
const APP_TITLE = 'landstadtmobil Münsingen';
const APP_DESCRIPTION = 'Gemeinsam Mobilität neu denken - die intermodale Verbindungssuche mit offenen, lokalen Daten';
const API_URL = process.env.API_URL || 'https://api.stadtnavi.de';
const MAP_URL = process.env.MAP_URL || 'https://tiles.stadtnavi.eu/streets/{z}/{x}/{y}{r}.png';
const SEMI_TRANSPARENT_MAP_URL = process.env.SEMITRANSPARENT_MAP_URL || "https://tiles.stadtnavi.eu/satellite-overlay/{z}/{x}/{y}{r}.png";
const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || "https://photon.stadtnavi.eu/pelias/v1";
const YEAR = 1901 + new Date().getYear();
const STATIC_MESSAGE_URL =
    process.env.STATIC_MESSAGE_URL ||
    '/assets/messages/message.muensingen.json';

const walttiConfig = require('./config.waltti.js').default;

const hostname = new URL(API_URL);

const minLat = 48.6020;
const maxLat = 50.0050;
const minLon = 9.4087;
const maxLon = 10.9014;

export default configMerger(walttiConfig, {
    CONFIG,
    URL: {
        OTP: process.env.OTP_URL || `${API_URL}/routing/v1/router/`,
        MAP: {
            default: MAP_URL,
            satellite: 'https://tiles.stadtnavi.eu/orthophoto/{z}/{x}/{y}.jpg',
            semiTransparent: SEMI_TRANSPARENT_MAP_URL,
            bicycle: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        },
        STOP_MAP: `${API_URL}/routing/v1/router/vectorTiles/stops/`,
        DYNAMICPARKINGLOTS_MAP: `${API_URL}/routing/v1/router/vectorTiles/parking/`,
        ROADWORKS_MAP: `${API_URL}/map/v1/cifs/`,
        CITYBIKE_MAP: `${API_URL}/routing/v1/router/vectorTiles/citybikes/`,
        BIKE_PARKS_MAP: `${API_URL}/routing/v1/router/vectorTiles/parking/`,
        CHARGING_STATIONS_MAP: `${API_URL}/tiles/charging-stations/`,
        PELIAS: `${process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL}/search`,
        PELIAS_REVERSE_GEOCODER: `${
            process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
        }/reverse`,
        PELIAS_PLACE: `${
            process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
        }/place`,
        FONT: '' // Do not use Google fonts.
    },

    mainMenu: {
        showDisruptions: false,
    },

    themeMap: {
        muensingen: 'muensingen'
    },

    availableLanguages: ['de', 'en'],
    defaultLanguage: 'de',

    transportModes: {
        rail: {
            availableForSelection: true,
            defaultValue: true,
        },
        subway: {
            availableForSelection: true,
            defaultValue: true,
        },
    },
    /* disable the "next" column of the Route panel as it can be confusing sometimes: https://github.com/stadtnavi/digitransit-ui/issues/167 */
    displayNextDeparture: false,
    maxWalkDistance: 15000,

    optimize: "TRIANGLE",

    defaultSettings: {
        optimize: "TRIANGLE",
        safetyFactor: 0.4,
        slopeFactor: 0.3,
        timeFactor: 0.3,
    },

    defaultOptions: {
        walkSpeed: [0.83, 1.38, 1.94],
    },

    itinerary: {
        delayThreshold: 60,
    },

    appBarLink: {
        name: 'Feedback',
        href: 'https://stadtnavi.de/feedback',
        target: '_blank'
    },

  colors: {
    primary: '#bcce17',
    secondary: '#00792d'
  },
    contactName: {
        de: 'transportkollektiv',
        default: 'transportkollektiv',
    },

    sprites: 'assets/svg-sprite.hb.svg',

    bikeParks: {
        show: true,
        smallIconZoom: 14,
        minZoom: 14
    },

    cityBike: {
        minZoomStopsNearYou: 10,
        showStationId: false,
        useSpacesAvailable: false,
        showCityBikes: true,
        networks: {
            regiorad: {
                icon: 'regiorad',
                name: {
                    de: 'RegioRad',
                    en: 'RegioRad',
                },
                type: 'citybike',
                url: {
                    de: 'https://www.regioradstuttgart.de/de',
                    en: 'https://www.regioradstuttgart.de/',
                },
                visibleInSettingsUi: false,
            },
            tier_reutlingen: {
                icon: 'tier-reutlingen',
                name: {
                    de: 'TIER Reutlingen',
                    en: 'TIER Reutlingen',
                },
                type: 'citybike',
                url: {
                    de: 'https://www.tier.app/de',
                    en: 'https://www.tier.app/',
                },
                visibleInSettingsUi: true,
            }
        }
    },

    mergeStopsByCode: true,

    title: APP_TITLE,

    favicon: './app/configurations/images/hbnext/favicon.png',

    meta: {
        description: APP_DESCRIPTION,
    },

    modeToOTP: {
        carpool: 'CARPOOL',
    },

    logo: 'hbnext/stadtnavi-logo.svg',

    GTMid: '',

    // get newest version from: https://github.com/moment/moment-timezone/blame/develop/data/packed/latest.json
    timezoneData: 'Europe/Berlin|CET CEST CEMT|-10 -20 -30|01010101010101210101210101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-2aFe0 11d0 1iO0 11A0 1o00 11A0 Qrc0 6i00 WM0 1fA0 1cM0 1cM0 1cM0 kL0 Nc0 m10 WM0 1ao0 1cp0 dX0 jz0 Dd0 1io0 17c0 1fA0 1a00 1ehA0 1a00 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|41e5',

    map: {
        useRetinaTiles: true,
        tileSize: 256,
        zoomOffset: 0,

        showZoomControl: true, // DT-3470, DT-3397
        showStreetModeSelector: false, // DT-3470
        showLayerSelector: true, // DT-3470
        showStopMarkerPopupOnMobile: false, // DT-3470
        showScaleBar: true, // DT-3470, DT-3397
        genericMarker: {
            popup: {
                offset: [0,0],
                maxWidth: 250,
                minWidth: 250,
            }
        },
        attribution: {
            'default': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a>, <a tabindex=-1 href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>Datensätze der NVBW GmbH</a> und <a tabindex=-1 href=https://www.openvvs.de/dataset/gtfs-daten>VVS GmbH</a>',
            'satellite': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a>, © <a tabindex=-1 href="https://www.lgl-bw.de/">LGL BW</a>, <a tabindex=-1 href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>Datensätze der NVBW GmbH</a> und <a tabindex=-1 href=https://www.openvvs.de/dataset/gtfs-daten>VVS GmbH</a>',
            'bicycle': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a>, © <a tabindex=-1 href=https://www.cyclosm.org/#map=12/52.3728/4.8936/cyclosmx>CyclOSM</a>, © <a tabindex=-1 href="https://www.openstreetmap.fr/">OSM-FR</a>, <a tabindex=-1 href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>Datensätze der NVBW GmbH</a> und <a tabindex=-1 href=https://www.openvvs.de/dataset/gtfs-daten>VVS GmbH</a>',
        },
    },

    feedIds: ['hbg'],

    searchSources: ['oa', 'osm'],

    searchParams: {
        'boundary.rect.min_lat': 48.34164,
        'boundary.rect.max_lat': 48.97661,
        'boundary.rect.min_lon': 9.95635,
        'boundary.rect.max_lon': 8.530883,
        'focus.point.lat': 48.4128,
        'focus.point.lon': 9.4947
    },

    areaPolygon: [
        [minLon, minLat],
        [minLon, maxLat],
        [maxLon, maxLat],
        [maxLon, minLat],
    ],

    nationalServiceLink: { name: 'Fahrplanauskunft efa-bw', href: 'https://www.efa-bw.de' },

    defaultEndpoint: {
        lat: 48.4128,
        lon: 9.4947,
    },  

    menu: {
        copyright: {
            label: `© Münsingen ${YEAR}`
        },
        content: [
        ],
    },

    aboutThisService: {
        de: [
        ],
        en: [
        ],
    },

    redirectReittiopasParams: true,

    showTicketInformation: false,
    showTicketPrice: false,
    displayFareInfoTop: false,

    showRouteSearch: false,
    showNearYouButtons: false,

    // adding assets/geoJson/hb-layers layers
    geoJson: {
        layers: [
        ],
    },
    staticMessagesUrl: STATIC_MESSAGE_URL,


    suggestCarMinDistance: 800,
    suggestWalkMaxDistance: 3000,
    suggestBikeAndPublicMinDistance: 3000,
    suggestBikeAndParkMinDistance: 3000,

    // live bus locations
    vehicles: false,
    showVehiclesOnSummaryPage: false,
    showVehiclesOnStopPage: false,

    showBikeAndPublicItineraries: true,
    showBikeAndParkItineraries: true,
    showStopAndRouteSearch: false,
    showTimeTableOptions: false,

    viaPointsEnabled: false,
});