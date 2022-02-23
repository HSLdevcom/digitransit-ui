/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'vpe';
const APP_TITLE = 'mobi VPE';
const APP_DESCRIPTION = 'Verbindungssuche des VPE';
const API_URL = process.env.API_URL || 'https://api.dev.stadtnavi.eu';
const MAP_URL = process.env.MAP_URL || 'https://tiles.stadtnavi.eu/streets/{z}/{x}/{y}{r}.png';
const SEMI_TRANSPARENT_MAP_URL = process.env.SEMITRANSPARENT_MAP_URL || "https://tiles.stadtnavi.eu/satellite-overlay/{z}/{x}/{y}{r}.png";
const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || "https://photon.stadtnavi.eu/pelias/v1";
const YEAR = 1900 + new Date().getYear();
const STATIC_MESSAGE_URL =
    process.env.STATIC_MESSAGE_URL ||
    '/assets/messages/message.vpe.json';

const walttiConfig = require('./config.waltti.js').default;

const hostname = new URL(API_URL);

const minLat = 47.305;
const maxLat = 50.008;
const minLon = 5.620;
const maxLon = 12.387;

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
        //ROADWORKS_MAP: `${API_URL}/map/v1/cifs/`,
        CITYBIKE_MAP: `${API_URL}/routing/v1/router/vectorTiles/citybikes/`,
        BIKE_PARKS_MAP: `${API_URL}/routing/v1/router/vectorTiles/parking/`,
        CHARGING_STATIONS_MAP: `${API_URL}/tiles/charging-stations/`,
        CHARGING_STATION_DETAILS_API: `${API_URL}/charging-stations/2.2/location/`,
        PELIAS: `${process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL}/search`,
        PELIAS_REVERSE_GEOCODER: `${
            process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
        }/reverse`,
        PELIAS_PLACE: `${
            process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
        }/place`,
        FARES: `${API_URL}/fares`,
        FONT: '' // Do not use Google fonts.
    },

    mainMenu: {
        showDisruptions: false,
    },

    availableLanguages: ['de', 'en'],
    defaultLanguage: 'de',
    issueTrackerUrl: 'https://maengelmelder.service-bw.de/?lat=${lat}&lng=${lon}',

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
        name: 'Kontakt',
        href: 'https://www.vpe.de/kontakt/',
        target: '_blank'
    },

    contactName: {
        de: 'VPE GmbH',
        default: 'VPE GmbH',
    },

    colors: {
        primary: '#1CA438',
        iconColors: {
            'mode-bus': '#ff0000',
            'mode-car': '#007AC9',
            'mode-rail': '#008000',
            'mode-subway': '#0000ff',
            'mode-citybike': '#0e1a50',
            'mode-charging-station': '#00b096',
            'mode-bike-park': '#005ab4',
            'mode-carpool': '#9fc727',
        },
    },

    sprites: 'assets/svg-sprite.hb.svg',

    socialMedia: {
        title: APP_TITLE,
        description: APP_DESCRIPTION,

        image: {
            url: '/img/stadtnavi-social-media-card.png',
            width: 600,
            height: 300,
        },
    },

    dynamicParkingLots: {
        showDynamicParkingLots: true,
        dynamicParkingLotsSmallIconZoom: 14,
        dynamicParkingLotsMinZoom: 14
    },

    bikeParks: {
        show: true,
        smallIconZoom: 14,
        minZoom: 14
    },

    chargingStations: {
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
            
        }
    },

    mergeStopsByCode: true,

    title: APP_TITLE,

    favicon: 'https://www.vpe.de/wp-content/themes/VPE2018/images/3e39e5ce308fe1cd2878ef4df5ceeb00_favicon.png',

    meta: {
        description: APP_DESCRIPTION,
    },

    modeToOTP: {
        carpool: 'CARPOOL',
    },

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
            'default': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a>, <a tabindex=-1 href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>Datensätze der NVBW GmbH</a> und <a tabindex=-1 href=https://vpe.de/>VPE GmbH</a>',
            'satellite': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a>, © <a tabindex=-1 href="https://www.lgl-bw.de/">LGL BW</a>, <a tabindex=-1 href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>Datensätze der NVBW GmbH</a> und <a tabindex=-1 href=https://vpe.de/>VPE GmbH</a>',
            'bicycle': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a>, © <a tabindex=-1 href=https://www.cyclosm.org/#map=12/52.3728/4.8936/cyclosmx>CyclOSM</a>, © <a tabindex=-1 href="https://www.openstreetmap.fr/">OSM-FR</a>, <a tabindex=-1 href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>Datensätze der NVBW GmbH</a> und <a tabindex=-1 href=https://vpe.de/>VPE GmbH</a>',
        },
    },

    feedIds: ['hbg'],

    searchSources: ['oa', 'osm'],

    searchParams: {
        'boundary.rect.min_lat': 47.305,
        'boundary.rect.max_lat': 50.008,
        'boundary.rect.min_lon': 5.620,
        'boundary.rect.max_lon': 12.387,
        'focus.point.lat': 48.8910,
        'focus.point.lon': 8.7033
    },

    areaPolygon: [
        [minLon, minLat],
        [minLon, maxLat],
        [maxLon, maxLat],
        [maxLon, minLat],
    ],

    nationalServiceLink: { name: 'Fahrplanauskunft efa-bw', href: 'https://www.efa-bw.de' },

    defaultEndpoint: {
        lat: 48.8910,
        lon: 8.7033,
    },

    menu: {
        copyright: {
            label: `© VPE GmbH ${YEAR}`
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
                href: 'https://www.vpe.de/impressum/',
            },
            {
                name: 'privacy',
                nameEn: 'Privacy',
                href: 'https://www.vpe.de/datenschutz/',
            },
        ],
    },

    aboutThisService: {
        de: [
            {
                header: 'Über diesen Dienst',
                paragraphs: [
                    'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                    
                ],
            },
            {
                header: 'Digitransit Plattform',
                paragraphs: [
                    'Dieser Dienst basiert auf der Digitransit Platform und dem Backend-Dienst OpenTripPlanner. Alle Software ist unter einer offenen Lizenzen verfügbar. Vielen Dank an alle Beitragenden.',
                    'Der gesamte Quellcode der Plattform, die aus vielen verschiedenen Komponenten besteht, ist auf <a href="https://github.com/stadtnavi/">Github</a> verfügbar.'
                ],
            },
            {
                header: 'Datenquellen',
                paragraphs: [
                    'Kartendaten: © <a target=new href=https://www.openstreetmap.org/>OpenStreetMap Mitwirkende</a>',
                    'ÖPNV-Daten: Datensätze der <a target=new href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>NVBW GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) jeweils angereichert mit OpenStreetMap-Daten © OpenStreetMap Mitwirkende',
                    'Alle Angaben ohne Gewähr.'
                ],
            },
        ],
        en: [
            {
                header: 'About this service',
                paragraphs: [
                    'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                ],
            },
            {
                header: 'Digitransit platform',
                paragraphs: [
                    'The Digitransit service platform is an open source routing platform developed by HSL and Traficom. It builds on OpenTripPlanner by Conveyal. Enhancements by Transportkollektiv and MITFAHR|DE|ZENTRALE. All software is open source. Thanks to everybody working on this!',
                ],
            },
            {
                header: 'Data sources',
                paragraphs: [
                    'Map data: © <a target=new href=https://www.openstreetmap.org/>OpenStreetMap contributors</a>',
                    'Public transit data: Datasets by <a target=new href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>NVBW GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) enhanced with OpenStreetMap data © OpenStreetMap contributors',
                    'No responsibility is accepted for the accuracy of this information.'
                ],
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
            defaultValue: false,
            nearYouLabel: {
                de: 'Mitfahrpunkte in der Nähe',
                en: 'Nearby carpool stops on the map',
            }
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

    // adding assets/geoJson/hb-layers layers
    geoJson: {
        layers: [
            // bicycleinfrastructure includes shops, repair stations,
            /* 
            {
                name: {
                    fi: '',
                    en: 'Service stations and stores',
                    de: "Service Stationen und Läden",
                },
                url: '/assets/geojson/hb-layers/bicycleinfrastructure.geojson',
            },
            // LoRaWan map layer
            {
                name: {
                    fi: '',
                    en: 'LoRaWAN Gateways',
                    de: 'LoRaWAN Gateways',
                },
                url: '/assets/geojson/hb-layers/lorawan-gateways.geojson',
                isOffByDefault: true,
            },
            // Nette Toilette layer
            {
                name: {
                    fi: '',
                    en: 'Public Toilets',
                    de: 'Nette Toilette',
                },
                url: '/assets/geojson/hb-layers/toilet.geojson',
                isOffByDefault: true,
            },
            */
        ],
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
    vehicles: false,
    showVehiclesOnSummaryPage: false,
    showVehiclesOnStopPage: true,

    showBikeAndPublicItineraries: true,
    showBikeAndParkItineraries: true,
    showStopAndRouteSearch: false,
    showTimeTableOptions: false,

    viaPointsEnabled: false,
});
