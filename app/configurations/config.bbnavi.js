/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'bbnavi';
const APP_TITLE = 'bbnavi';
const HEADER_TITLE = '';
const APP_DESCRIPTION = 'Gemeinsam Mobilität neu denken - die intermodale Verbindungssuche mit offenen, lokalen Daten';
const API_URL = process.env.API_URL || 'https://api.bbnavi.de';
const MAP_URL = process.env.MAP_URL || 'https://tiles.stadtnavi.eu/streets/{z}/{x}/{y}{r}.png';
const SEMI_TRANSPARENT_MAP_URL = process.env.SEMITRANSPARENT_MAP_URL || "https://tiles.stadtnavi.eu/satellite-overlay/{z}/{x}/{y}{r}.png";
const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || "https://photon.stadtnavi.eu/pelias/v1";
const YEAR = 1900 + new Date().getYear();
const STATIC_MESSAGE_URL =
    process.env.STATIC_MESSAGE_URL ||
    '/assets/messages/message.bbnavi.json';

const walttiConfig = require('./config.waltti.js').default;

const realtimeBbnavi = require('./realtimeUtils').default.bbnavi;
const hostname = new URL(API_URL);
realtimeBbnavi.mqtt = `wss://${hostname.host}/mqtt/`;

const minLat = 52.015895;
const maxLat = 54.015895;
const minLon = 13.000255;
const maxLon = 15.000255;

export default configMerger(walttiConfig, {
    CONFIG,
    URL: {
        HEADER_TITLE,
        OTP: process.env.OTP_URL || `${API_URL}/otp/routers/default/`,
        MAP: {
            default: MAP_URL,
            satellite: 'https://isk.geobasis-bb.de/mapproxy/dop20c_wmts/service?layer=bebb_dop20c&style=default&tilematrixset=grid_25833&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}',
            semiTransparent: SEMI_TRANSPARENT_MAP_URL,
            bicycle: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        },
        STOP_MAP: `${API_URL}/otp/routers/default/vectorTiles/stops/`,
        DYNAMICPARKINGLOTS_MAP: `${API_URL}/otp/routers/default/vectorTiles/parking/`,
        ROADWORKS_MAP: `${API_URL}/map/v1/cifs/`,
        COVID19_MAP: '', // `https://tiles.caresteouvert.fr/public.poi_osm_light/{z}/{x}/{y}.pbf`,
        CITYBIKE_MAP: `${API_URL}/otp/routers/default/vectorTiles/citybikes/`,
        BIKE_PARKS_MAP: `${API_URL}/otp/routers/default/vectorTiles/parking/`,
        WEATHER_STATIONS_MAP: '', // `${API_URL}/map/v1/weather-stations/`,
        CHARGING_STATIONS_MAP: '', // `${API_URL}/tiles/charging-stations/`,
        PELIAS: `${process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL}/search`,
        PELIAS_REVERSE_GEOCODER: `${
            process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
        }/reverse`,
        PELIAS_PLACE: `${
            process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
        }/place`,
        FARES: '', // `${API_URL}/fares`,
        FONT: '' // Do not use Google fonts.
    },

    mainMenu: {
        showDisruptions: false,
    },

    availableLanguages: ['de', 'en'],
    defaultLanguage: 'de',
    issueTrackerUrl: '', // 'https://maengelmelder.service-bw.de/?lat=${lat}&lng=${lon}',

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
        href: 'https://bbnavi.de/feedback',
        target: '_blank'
    },

    contactName: {
        de: 'transportkollektiv',
        default: 'transportkollektiv',
    },

    colors: {
        primary: '#DA1B1B',
        iconColors: {
            'mode-bus': '#ff0000',
            'mode-car': '#007AC9',
            'mode-rail': '#008000',
            'mode-charging-station': '#00b096',
            'mode-bike-park': '#005ab4',
        },
    },

    sprites: 'assets/svg-sprite.bbnavi.svg',

    socialMedia: {
        title: APP_TITLE,
        description: APP_DESCRIPTION,

        image: {
            url: '/img/bbnavi-social-preview.png',
            width: 2048,
            height: 1536,
        },

        twitter: {
            card: 'summary_large_image',
            site: '@TUGHerrenberg',
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

    roadworks: {
        showRoadworks: false,
        roadworksSmallIconZoom: 16,
        roadworksMinZoom: 10
    },

    covid19: {
        show: false,
        smallIconZoom: 17,
        minZoom: 15
    },


    weatherStations: {
        show: false,
        smallIconZoom: 17,
        minZoom: 15
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
                visibleInSettingsUi: true,
                enabled: true,
            },
            'taxi': {
                icon: 'taxi',
                name: {
                    de: 'Taxi',
                    en: 'Taxi',
                },
                type: 'taxi',
                visibleInSettingsUi: false,
                enabled: true,
            },
            "car-sharing": {
                icon: 'car-sharing',
                name: {
                    de: 'Carsharing',
                    en: 'Car sharing',
                },
                type: 'car-sharing',
                url: {
                    de: 'https://stuttgart.stadtmobil.de/privatkunden/',
                    en: 'https://stuttgart.stadtmobil.de/privatkunden/',
                },
                visibleInSettingsUi: false,
                enabled: true,
            },
            "cargo-bike": {
                icon: 'cargobike',
                name: {
                    de: 'Freie Lastenräder',
                    en: 'Free cargo bikes',
                },
                type: 'cargo-bike',
                visibleInSettingsUi: false,
                enabled: true,
            },
            // "de.openbikebox.stadt-herrenberg": {
            //     icon: 'cargobike',
            //     name: {
            //         de: 'Lastenrad Herrenberg',
            //         en: 'Cargo bike Herrenberg',
            //     },
            //     type: 'cargo-bike',
            //     visibleInSettingsUi: false,
            //     enabled: true,
            // },
        }
    },

    mergeStopsByCode: true,

    title: APP_TITLE,

    favicon: './app/configurations/images/bbnavi/favicon.png',

    meta: {
        description: APP_DESCRIPTION,
    },

    modeToOTP: {
        carpool: 'CARPOOL',
    },

    logo: 'bbnavi/stadtnavi-bbnavi-logo.svg',

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
            'default': '© <a tabindex=-1 href=https://www.openstreetmap.org/copyright>OpenStreetMap Mitwirkende</a>, <a tabindex=-1 href=https://www.vbb.de/vbb-services/api-open-data/datensaetze/>Datensätze des Verkehrsverbundes Berlin-Brandenburg GmbH (VBB)</a> ',
            'satellite': '© <a tabindex=-1 href=https://www.openstreetmap.org/copyright>OpenStreetMap Mitwirkende</a>, © <a tabindex=-1 href="https://www.lgl-bw.de/">LGL BW</a>, <a tabindex=-1 href=https://www.vbb.de/vbb-services/api-open-data/datensaetze//>Datensätze des Verkehrsverbundes Berlin-Brandenburg GmbH (VBB)</a> ',
            'bicycle': '© <a tabindex=-1 href=https://www.openstreetmap.org/copyright>OpenStreetMap Mitwirkende</a>, © <a tabindex=-1 href=https://www.cyclosm.org/#map=12/52.3728/4.8936/cyclosmx>CyclOSM</a>, © <a tabindex=-1 href="https://www.openstreetmap.fr/">OSM-FR</a>, <a tabindex=-1 href=https://www.vbb.de/vbb-services/api-open-data/datensaetze//>Datensätze des Verkehrsverbundes Berlin-Brandenburg GmbH (VBB)</a>',
        },
    },

    feedIds: ['bbnavi'],

    // realtime: { bbnavi: realtimeBbnavi },

    searchSources: ['oa', 'osm'],

    searchParams: {
        'boundary.rect.min_lat': 50.015895,
        'boundary.rect.max_lat': 54.015895,
        'boundary.rect.min_lon': 15.000255,
        'boundary.rect.max_lon': 11.000255,
        'focus.point.lat': 53.015895,
        'focus.point.lon': 14.000255
    },

    areaPolygon: [
        [minLon, minLat],
        [minLon, maxLat],
        [maxLon, maxLat],
        [maxLon, minLat],
    ],

    nationalServiceLink: { name: 'Fahrplanauskunft efa-bw', href: 'https://www.efa-bw.de' },

    defaultEndpoint: {
        lat: 53.015895,
        lon: 14.000255,
    },


    defaultOrigins: [
        {
            icon: 'icon-icon_bus',
            label: 'Bahnhof',
            lat: 53.015694,
            lon: 13.996112,
        },
        {
            icon: 'icon-icon_star',
            label: 'Krankenhaus',
            lat: 53.013128,
            lon: 13.989340,
        }
    ],

    menu: {
        copyright: {
            label: `© DigitalAgentur Brandenburg GmbH ${YEAR}`
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
                href: 'https://bbnavi.de/impressum',
            },
            {
                name: 'privacy',
                nameEn: 'Privacy',
                href: 'https://bbnavi.de/datenschutzerklaerung',
            },
        ],
    },

    aboutThisService: {
        de: [
            {
                header: 'Über dieses Angebot',
                paragraphs: [
                    'bbnavi ist eine Mobilitätsplattform für Brandenburg. Die Projektpartner:innen und die beteiligten Kommunen bündeln hier Daten zu ÖPNV, Fußwegen, Radverkehr, Straßen- und Parkplätzen  Ladeinfrastruktur und Sharing-Angeboten. Die Mobilitätsangebote werden durch intermodales Routing miteinander vernetzt.',
                ],
            },
            {
                header: 'Mitmachen',
                paragraphs: [
                    'Sie betreiben ein Mobilitätsangebot ein Brandenburg und haben es noch nicht in bbnavi gefunden? Dann freuen wir uns über Ihre Nachricht. Statistische und Echtzeit-Informationen, die als offene Daten vorliegen, binden wir gerne ein.',
                    'Sie nutzen ein Mobilitätsangebot in Brandenburg (z.B. einen Bürgerbus oder ein Fahrrad- oder Carsharing-Angebot) und finden es nicht in bbnavi? Dann freuen wir uns über Ihre Hinweise und gucken dann, ob wir es in bbnavi einbinden können.',
                    'Sie möchten zum Mitmacher werden und wünschen mehr Informationen?',
                    'Schreiben Sie uns eine E-mail an bbnavi@digital-agentur.de',
                ]
            },
            {
                header: 'Digitransit Plattform',
                paragraphs: [
                    'Dieser Dienst basiert auf <a href="https://stadtnavi.de/">stadtnavi</a> stadtnavi.de, einem Projekt der Stadt Herrenberg in Baden-Württemberg. Die Grundlage für stadtnavi sind die internationalen Open-Source-Projekte Digitransit und OpenTripPlanner. Alle Software ist unter einer offenen Lizenzen verfügbar. Vielen Dank an alle Beteiligten.',
                    'Der gesamte Quellcode der Plattform, die aus vielen verschiedenen Komponenten besteht, ist auf <a href="https://github.com/bbnavi/">Github</a> verfügbar.'
                ],
            },
            {
                header: 'Datenquellen',
                paragraphs: [
                    'Kartendaten: © <a target=new href=https://www.openstreetmap.org/>OpenStreetMap Mitwirkende</a>',
                    'ÖPNV-Daten: Datensätze der <a target=new href=https://www.vbb.de/vbb-services/api-open-data/datensaetze/>VBB GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) jeweils angereichert mit OpenStreetMap-Daten © OpenStreetMap Mitwirkende',
                    'Alle Angaben ohne Gewähr.'
                ],
            },
        ],
        en: [
            {
                header: 'About this service',
                paragraphs: [
                    'bbnavi is a travel planning application for the state of Brandenburg. This service includes public transport, footpaths, cycling, street and parking information, charging infrastructure and sharing offerings. The mobility offerings are connected through intermodal routing.',
                ],
            },
            {
                header: 'Open Source Software',
                paragraphs: [
                    'bbnavi is based on the Digitransit service platform is an open source routing platform developed by HSL and Traficom. It builds on OpenTripPlanner by Conveyal. Enhancements by Transportkollektiv and MITFAHR|DE|ZENTRALE. All software is open source. Thanks to everybody working on this!',
                ],
            },
            {
                header: 'Data sources',
                paragraphs: [
                    'Map data: © <a target=new href=https://www.openstreetmap.org/>OpenStreetMap contributors</a>',
                    'Public transit data: Datasets by <a target=new href=https://www.vbb.de/vbb-services/api-open-data/datensaetze/>VBB GmbH</a>, Shapes enhanced with OpenStreetMap data © OpenStreetMap contributors',
                    'No responsibility is accepted for the accuracy of this information.'
                ],
            },
        ]
    },
    redirectReittiopasParams: true,

    themeMap: {
        bbnavi: 'bbnavi'
    },

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
            availableForSelection: true,
            defaultValue: true,
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
            availableForSelection: true,
            defaultValue: true,
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

    showTicketInformation: false,
    showTicketPrice: false,
    availableTickets: { 'bbnavi' : {}},
    fareMapping: function mapFareId(fareId) {
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
            // {
            //     name: {
            //         fi: '',
            //         en: 'Service stations and stores',
            //         de: "Service Stationen und Läden",
            //     },
            //     url: '/assets/geojson/hb-layers/bicycleinfrastructure.geojson',
            // },
            /* Charging stations
            {
                name: {
                    fi: '',
                    en: 'Charging stations',
                    de: 'Ladestationen',
                },
                url: '/assets/geojson/hb-layers/charging.geojson',
            },*/
            // LoRaWan map layer
            // {
            //     name: {
            //         fi: '',
            //         en: 'LoRaWAN Gateways',
            //         de: 'LoRaWAN Gateways',
            //     },
            //     url: '/assets/geojson/hb-layers/lorawan-gateways.geojson',
            //     isOffByDefault: true,
            // },
            // Nette Toilette layer
            // {
            //     name: {
            //         fi: '',
            //         en: 'Public Toilets',
            //         de: 'Nette Toilette',
            //     },
            //     url: '/assets/geojson/hb-layers/toilet.geojson',
            //     isOffByDefault: true,
            // },
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
    vehicles: true,
    showVehiclesOnSummaryPage: false,
    showVehiclesOnStopPage: true,

    showBikeAndPublicItineraries: true,
    showBikeAndParkItineraries: true,
    showStopAndRouteSearch: false,
    showTimeTableOptions: false,

    viaPointsEnabled: false,
});
