/* eslint-disable */
import configMerger from '../util/configMerger';
import { MapMode } from '../constants';

const CONFIG = 'stadtnavi';
const APP_TITLE = 'stadtnavi Herrenberg';
const APP_DESCRIPTION = 'Gemeinsam Mobilität neu denken - die intermodale Verbindungssuche mit offenen, lokalen Daten';
const API_URL = process.env.API_URL || 'https://api.stadtnavi.de';
const MAP_URL = process.env.MAP_URL || 'https://tiles-eu.stadtnavi.eu/styles/streets/{z}/{x}/{y}{r}.png';
const BIKE_MAP_URL = process.env.BIKE_MAP_URL ||'https://tiles-eu.stadtnavi.eu/styles/bicycle/{z}/{x}/{y}{r}.png';

const SEMI_TRANSPARENT_MAP_URL = process.env.SEMITRANSPARENT_MAP_URL || "https://tiles-eu.stadtnavi.eu/styles/satellite-overlay/{z}/{x}/{y}{r}.png";
const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || "https://photon-eu.stadtnavi.eu/pelias/v1";
const YEAR = 1900 + new Date().getYear();
const STATIC_MESSAGE_URL = process.env.STATIC_MESSAGE_URL;
const MOBIDATA_BASE_URL = "https://api.mobidata-bw.de/";

const parentConfig = require('./config.waltti.js').default;

const minLat = 47.6020;
const maxLat = 49.0050;
const minLon = 8.4087;
const maxLon = 9.9014;

export default configMerger(parentConfig, {
    CONFIG,
    URL: {
        OTP: process.env.OTP_URL || `${API_URL}/routing/v1/router/`,
        MAP: {
            default: MAP_URL,
            satellite: 'https://tiles-eu.stadtnavi.eu/orthophoto/{z}/{x}/{y}.jpg',
            semiTransparent: SEMI_TRANSPARENT_MAP_URL,
            bicycle: BIKE_MAP_URL
        },
        STOP_MAP: `${API_URL}/routing/v1/router/vectorTiles/stops/`,
        PARK_AND_RIDE_MAP: `${API_URL}/routing/v1/router/vectorTiles/parking/`,
        ROADWORKS_MAP: `${MOBIDATA_BASE_URL}geoserver/gwc/service/tms/1.0.0/MobiData-BW:roadworks@EPSG:900913@pbf/{z}/{x}/{-y}.pbf`,
        RENTAL_STATION_MAP: `${API_URL}/routing/v1/router/vectorTiles/rentalStations/`,
        RENTAL_VEHICLE_MAP: `${API_URL}/routing/v1/router/vectorTiles/rentalVehicles/`,
        REALTIME_RENTAL_STATION_MAP: `${API_URL}/routing/v1/router/vectorTiles/realtimeRentalStations/`,
        WEATHER_STATIONS_MAP: `${API_URL}/map/v1/weather-stations/`,
        CHARGING_STATIONS_MAP: `${API_URL}/tiles/charging-stations/{z}/{x}/{y}.mvt`,
        CHARGING_STATION_DETAILS_API: 'https://api.ocpdb.de/api/ocpi/2.2/location/',
        
        PELIAS: `${process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL}/search`,
        PELIAS_REVERSE_GEOCODER: `${
            process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
        }/reverse`,
        PELIAS_PLACE: `${
            process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
        }/place`,
        FARES: `${API_URL}/fares`,
        FONT: '', // Do not use Google fonts.
        EMBEDDED_SEARCH_GENERATION: '/embeddedSearchGenerator',
    },

    mainMenu: {
        showDisruptions: false,
    },

    availableLanguages: ['de', 'en'],
    defaultLanguage: 'de',
    // issueTrackerUrls define issuetracker URLs per postalCode. In case none matches, issueTrackerUrl is used as falllback
    issueTrackerUrls: {
      '71083': 'https://www.herrenberg.de/tools/mvs/?lat=${lat}&lng=${lon}#mvPagePictures',
      '71634': 'https://www.ludwigsburg.de/,Lde/start/stadt_buerger/maengelmelder.html?uri=/bms/create%3Flat=${lat}%26lon=${lon}',
      '71636': 'https://www.ludwigsburg.de/,Lde/start/stadt_buerger/maengelmelder.html?uri=/bms/create%3Flat=${lat}%26lon=${lon}',
      '71638': 'https://www.ludwigsburg.de/,Lde/start/stadt_buerger/maengelmelder.html?uri=/bms/create%3Flat=${lat}%26lon=${lon}',
      '71640': 'https://www.ludwigsburg.de/,Lde/start/stadt_buerger/maengelmelder.html?uri=/bms/create%3Flat=${lat}%26lon=${lon}',
      '71642': 'https://www.ludwigsburg.de/,Lde/start/stadt_buerger/maengelmelder.html?uri=/bms/create%3Flat=${lat}%26lon=${lon}',
    },

    MATOMO_URL: process.env.MATOMO_URL,

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

    contactName: {
        de: 'systect Holger Bruch',
        default: 'systect Holger Bruch',
    },

    colors: {
        primary: '#9fc727',
        iconColors: {
            'mode-bus': '#ff0000',
            'mode-car': '#007AC9',
            'mode-rail': '#008000',
            'mode-metro': '#0065B0',
            'mode-citybike': '#ff834a',
            'mode-charging-station': '#00b096',
            'mode-bike-park': '#005ab4',
            'mode-carpool': '#9fc727',
            'mode-funicular': '#FFCC00',
        },
    },

    sprites: 'assets/svg-sprite.stadtnavi.svg',
    
    socialMedia: {
        title: APP_TITLE,
        description: APP_DESCRIPTION,

        image: {
            url: '/img/stadtnavi-social-media-card.png',
            width: 600,
            height: 300,
        },

        twitter: {
            card: 'summary_large_image',
            site: '@TUGHerrenberg',
        },
    },

    parkAndRide: {
        show: true,
        smallIconZoom: 14,
        minZoom: 14,
    },

    parkAndRideForBikes: {
        show: true,
        smallIconZoom: 14,
        minZoom: 14
    },

    roadworks: {
        show: true,
        roadworksSmallIconZoom: 16,
        roadworksMinZoom: 10
    },

    covid19: {
        show: false,
        smallIconZoom: 17,
        minZoom: 15
    },


    weatherStations: {
        show: true,
        smallIconZoom: 17,
        minZoom: 15
    },

    chargingStations: {
        show: true,
        smallIconZoom: 14,
        minZoom: 14
    },

    backgroundMaps: [{
        mapMode: MapMode.Default,
        messageId: 'map-type-streets',
        defaultMessage: 'Streets',
        previewImage: '/img/maptype-streets.png',
    }, {
        mapMode: MapMode.Satellite,
        messageId: 'map-type-satellite',
        defaultMessage: 'Satellite',
        previewImage: '/img/maptype-satellite.png',
    }, {
        mapMode: MapMode.Bicycle,
        messageId: 'map-type-bicycle',
        defaultMessage: 'Bicycle',
        previewImage: '/img/maptype-bicycle.png',
    }],

    cityBike: {
        minZoomStopsNearYou: 10,
        showStationId: false,
        useSpacesAvailable: false,
        showCityBikes: true,

        operators : {
          taxi: {
            icon: "brand_taxi",
            name: {
                de: "Taxi"
            },
            colors: {
                background: '#FFCD00'
            }
          },
          deer: {
            icon: "brand_deer",
            name: {
                de: "deer"
            },
            url: {
                de: "https://www.deer-carsharing.de/"
            },
            colors: {
                background: '#3C8325'
            }
          },
           bolt: {
             icon: "brand_bolt",
             name: {
               de: "bolt"
             },
             colors: {
              background: '#30D287'
             },
           },
           voi: {
             icon: "brand_voi",
             name: {
               de: "VOI"
             },
             colors: {
               background: '#F26961'
             },
           },
           
            regiorad: {
             icon: "brand_regiorad",
             name: {
               de: "RegioRad"
             },
             colors: {
               background: '#009fe4'
             },
            },
            stadtmobil: {
             icon: "brand_stadtmobil",
             name: {
               de: "stadtmobil"
             },
             colors: {
               background: '#FF8A36'
             },
            },
            zeus: {
             icon: "brand_zeus",
             name: {
               de: "ZEUS Scooters",
               en: "ZEUS Scooters"
             },
             colors: {
               background: '#F75118'
             },
            },
          other: {
             icon: "brand_other",
             name: {
               de: "Weitere Anbieter"
             },
             colors: {
               background: '#C84674'
             },
          }
        },

        networks: {
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

    logo: 'herrenberg/stadtnavi-herrenberg-logo.svg',

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

        areaBounds: {
            // large buffer around Germany
            corner1: [58, 21.2],
            corner2: [46.5, 3.6],
        },
    },

    feedIds: ['hbg'],

    searchSources: ['oa', 'osm'],

    searchParams: {
        'boundary.rect.min_lat': 48.34164,
        'boundary.rect.max_lat': 48.97661,
        'boundary.rect.min_lon': 9.95635,
        'boundary.rect.max_lon': 8.530883,
        'focus.point.lat': 48.5957,
        'focus.point.lon': 8.8675
    },

    areaPolygon: [
        [minLon, minLat],
        [minLon, maxLat],
        [maxLon, maxLat],
        [maxLon, minLat],
    ],

    nationalServiceLink: { 
        de: {
            name: 'Fahrplanauskunft bwegt', href: 'https://www.bwegt.de' 
        }
    },

    defaultEndpoint: {
        lat: 48.5942066,
        lon: 8.8644041,
    },


    defaultOrigins: [
        {
            icon: 'icon-icon_bus',
            label: 'ZOB Herrenberg',
            lat: 48.5942066,
            lon: 8.8644041,
        },
        {
            icon: 'icon-icon_star',
            label: 'Krankenhaus',
            lat: 48.59174,
            lon: 8.87536,
        },
        {
            icon: 'icon-icon_star',
            label: 'Waldfriedhof / Schönbuchturm',
            lat: 48.6020352,
            lon: 8.9036348,
        },
    ],

    menu: {
        copyright: {
            label: `© Stadt Herrenberg ${YEAR}`
        },
        content: [
            {
                name: 'about-this-service',
                nameEn: 'About this service',
                route: '/dieser-dienst',
                icon: 'icon-icon_info',
            },
            {
                name: 'imprint',
                nameEn: 'Imprint',
                href: 'https://www.herrenberg.de/impressum',
            },
            {
                name: 'privacy',
                nameEn: 'Privacy',
                href: 'https://www.herrenberg.de/datenschutz',
            },
        ],
    },

    redirectReittiopasParams: true,

    transportModes: {

        nearYouTitle: {
            de: 'Fahrpläne und Routen',
        },

        bus: {
            availableForSelection: true,
            defaultValue: true,
            smallIconZoom: 16,
            nearYouLabel: {
                de: 'Bushaltestellen in der Nähe',
            }
        },

        rail: {
            availableForSelection: true,
            defaultValue: true,
            nearYouLabel: {
                de: 'Bahnhaltestellen in der Nähe',
            }
        },

        tram: {
            availableForSelection: false,
            defaultValue: false,
            nearYouLabel: {
                de: 'Tramhaltestellen in der Nähe',
            }
        },

        subway: {
            availableForSelection: true,
            defaultValue: true,
            nearYouLabel: {
                de: 'U-Bahnhaltestellen in der Nähe',
            }
        },
        airplane: {
            availableForSelection: false,
            defaultValue: false,
            nearYouLabel: {
                de: 'Flughäfen in der Nähe',
            }
        },

        ferry: {
            availableForSelection: false,
            defaultValue: false,
            nearYouLabel: {
                de: 'Fähranleger in der Nähe',
            }
        },

        carpool: {
            availableForSelection: true,
            defaultValue: true,
            nearYouLabel: {
                de: 'Mitfahrpunkte in der Nähe',
                en: 'Nearby carpool stops on the map',
            }
        },

        funicular: {
            availableForSelection: true,
            defaultValue: true,
        },

        citybike: {
            availableForSelection: true,
            defaultValue: false,
            nearYouLabel: {
                de: 'Sharing-Angebote in der Nähe',
                en: 'Shared mobility near you'
            }
        },
    },

    streetModes: {
        public_transport: {
            availableForSelection: true,
            defaultValue: true,
            exclusive: false,
            icon: 'bus-withoutBox',
        },

        walk: {
            availableForSelection: true,
            defaultValue: false,
            exclusive: true,
            icon: 'walk',
        },

        bicycle: {
            availableForSelection: true,
            defaultValue: false,
            exclusive: true,
            icon: 'bicycle-withoutBox',
        },

        car: {
            availableForSelection: false,
            defaultValue: false,
            exclusive: false,
            icon: 'car-withoutBox',
        },

        car_park: {
            availableForSelection: true,
            defaultValue: false,
            exclusive: false,
            icon: 'car-withoutBox',
        },

        carpool: {
            availableForSelection: true,
            defaultValue: false,
            exclusive: true,
            icon: 'carpool-withoutBox',
        },
    },

    separatedParkAndRideSwitch: false,
    showCarpoolOfferButton: true,
    showTicketInformation: true,
    showTicketPrice: true,
    availableTickets: { 'hbg' : {}},
    fareMapping: function mapHbFareId(fareId) {
        return {
            en: "Adult",
            de: "Regulär",
        };
    },
    displayFareInfoTop: false,


    showRouteSearch: false,
    showNearYouButtons: false,

    geoJson: {
        layers: [],
    },
    staticMessagesUrl: STATIC_MESSAGE_URL,

    parkAndRideBannedVehicleParkingTags: [
        'lot_type:Parkplatz',
        'lot_type:Tiefgarage',
        'lot_type:Parkhaus'
    ],

    suggestCarMinDistance: 800,
    suggestWalkMaxDistance: 3000,
    suggestBikeAndPublicMinDistance: 3000,
    suggestBikeAndParkMinDistance: 3000,

    // live bus locations
    vehicles: true,
    showVehiclesOnSummaryPage: false,
    showVehiclesOnStopPage: true,

    includeScooterSuggestions: true,
    showMapRoutingButton: false,
    showBikeAndPublicItineraries: true,
    showBikeAndParkItineraries: true,
    showStopAndRouteSearch: false,
    showTimeTableOptions: false,
    showWeatherInformation: false,

    viaPointsEnabled: false,

    embeddedSearch: {
        title: {
            de: 'Verbindungssuche-Widget',
        },
        infoText: {
            de: 'Erstellen Sie ein Widget zur Verbindungssuche und fügen Sie es Ihrem eigenen Web-Angebot zu. Nach Eingabe der Start-/Zieladresse gelangen Sie über "Verbindung suchen" in diese Routensuche.',
        },
    },
    accessibilityRoutingDisabled: true,
});
