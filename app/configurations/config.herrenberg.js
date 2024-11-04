/* eslint-disable */
import configMerger from '../util/configMerger';
import { MapMode } from '../constants';

const CONFIG = 'herrenberg';
const APP_TITLE = 'stadtnavi Herrenberg';
const APP_DESCRIPTION = 'Gemeinsam Mobilität neu denken - die intermodale Verbindungssuche mit offenen, lokalen Daten';
const API_URL = process.env.API_URL || 'https://api.stadtnavi.de';
const YEAR = 1900 + new Date().getYear();
const STATIC_MESSAGE_URL =
    process.env.STATIC_MESSAGE_URL ||
    '/assets/messages/message.hb.json';

const parentConfig = require('./config.stadtnavi.js').default;

const realtimeHbg = require('./realtimeUtils').default.hbg;
const hostname = new URL(API_URL);
realtimeHbg.mqtt = `wss://${hostname.host}/mqtt/`;

const minLat = 47.6020;
const maxLat = 49.0050;
const minLon = 8.4087;
const maxLon = 9.9014;

export default configMerger(parentConfig, {
    CONFIG,
    
    cityBike: {
        minZoomStopsNearYou: 10,
        showStationId: false,
        useSpacesAvailable: false,
        showCityBikes: true,
        networks: {
            deer: {
             icon: "brand_deer",
             operator: "deer",
             name: {
               de: "deer"
             },
             type: "car",
             form_factors: ['car'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.deer-carsharing.de/"
             }
           },
           stadtmobil_stuttgart: {
             icon: "brand_stadtmobil",
             operator: "stadtmobil",
             name: {
               de: "Stadtmobil Stuttgart"
             },
             type: "car",
             form_factors: ['car'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://stuttgart.stadtmobil.de/"
             }
           },
           regiorad_stuttgart: {
             icon: "brand_regiorad",
             operator: "regiorad",
             name: {
               de: "RegioRad Stuttgart"
             },
             type: "bicycle",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.regioradstuttgart.de"
             }
           },
           bolt_stuttgart: {
             icon: "brand_bolt",
             operator: "bolt",
             name: {
               de: "Bolt OÜ"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.bolt.eu/"
             }
           },
           bolt_reutlingen_tuebingen: {
             icon: "brand_bolt",
             operator: "bolt",
             name: {
               de: "Bolt OÜ"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.bolt.eu/"
             }
           },
           zeus_ludwigsburg: {
             icon: "brand_zeus",
             operator: "zeus",
             name: {
               de: "Zeus Scooters"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://zeusscooters.com"
             }
           },
           zeus_pforzheim: {
             icon: "brand_zeus",
             operator: "zeus",
             name: {
               de: "Zeus Scooters"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://zeusscooters.com"
             }
           },
           zeus_tubingen: {
             icon: "brand_zeus",
             operator: "zeus",
             name: {
               de: "Zeus Scooters"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://zeusscooters.com"
             }
           },
           voi_karlsruhe: {
             icon: "brand_voi",
             operator: "voi",
             name: {
               de: "Voi Scooter Karlsruhe"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
            'tier_ludwigsburg': {
                icon: 'tier_scooter',
                name: {
                    de: 'TIER Ludwigsburg',
                    en: 'TIER Ludwigsburg',
                },
                type: 'scooter',
                url: {
                    de: 'https://www.tier.app/de',
                    en: 'https://www.tier.app/',
                },
                visibleInSettingsUi: true,
                hideCode: true,
                enabled: true,
            },
            'taxi': {
                icon: 'brand_taxi',
                operator: 'taxi',
                name: {
                    de: 'Taxi',
                    en: 'Taxi',
                },
                type: 'taxi',
                form_factors: ['car'],
                hideCode: true,
                enabled: true,
                season: {
                    // currently not enabled for routing, but for display
                    start: new Date(new Date().getFullYear()+10, 0, 1),
                    end: new Date(new Date().getFullYear()+10, 11, 31),
                    preSeasonStart: new Date(new Date().getFullYear(), 0, 1),
                },
            },
            "cargo-bike": {
                icon: 'cargobike',
                operator: 'other',
                name: {
                    de: 'Freie Lastenräder Herrenberg',
                    en: 'Free cargo bikes Herrenberg',
                },
                type: 'cargo_bicycle',
                enabled: true,
                season: {
                    // currently not enabled for routing, but for display
                    start: new Date(new Date().getFullYear()+10, 0, 1),
                    end: new Date(new Date().getFullYear()+10, 11, 31),
                    preSeasonStart: new Date(new Date().getFullYear(), 0, 1),
                },
            },
            "de.openbikebox.stadt-herrenberg": {
                icon: 'cargobike',
                operator: 'other',
                name: {
                    de: 'Lastenrad Herrenberg',
                    en: 'Cargo bike Herrenberg',
                },
                type: 'cargo_bicycle',
                enabled: true,
                season: {
                    // currently not enabled for routing, but for display
                    start: new Date(new Date().getFullYear()+10, 0, 1),
                    end: new Date(new Date().getFullYear()+10, 11, 31),
                    preSeasonStart: new Date(new Date().getFullYear(), 0, 1),
                },
            },
        }
    },

    title: APP_TITLE,

    favicon: './app/configurations/images/herrenberg/favicon.png',

    meta: {
        description: APP_DESCRIPTION,
    },

    logo: 'herrenberg/stadtnavi-herrenberg-logo.svg',
    secondaryLogo: 'herrenberg/stadtnavi-logo-green.svg',

    feedIds: ['hbg'],

    realtime: { hbg: realtimeHbg },

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

    defaultEndpoint: {
        lat: 48.5942066,
        lon: 8.8644041,
    },

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

    aboutThisService: {
        de: [
            {
                header: 'Über diesen Dienst',
                paragraphs: [
                    'stadtnavi ist eine Reiseplanungs-Anwendung für die Stadt Herrenberg und Umgebung. Dieser Dienst umfasst ÖPNV, Fußwege, Radverkehr, Straßen- und Parkplatzinformationen, Ladeinfrastruktur und Sharing-Angebote. Mobilitätsangebote werden durch intermodales Routing miteinander vernetzt.',
                    'Gefördert durch <br>',
                    '<a href="https://www.herrenberg.de/stadtluft"><img src="https://www.herrenberg.de/ceasy/resource/?id=4355&predefinedImageSize=rightEditorContent"/></a>',

                ],
            },
            {
                header: 'Mitmachen',
                paragraphs: [
                    'Die Stadt Herrenberg hat diese App im Rahmen der Modellstadt, gefördert durch das Bundesministerium für Verkehr und digitale Infrastruktur (BMVI) entwickelt. stadtnavi Anwendung ist eine Open Source Lösung und kann von anderen Kommunen und Akteuren unter ihrem Namen und Erscheinungsbild verwendet und an individuelle Bedürfnisse angepasst und weiterentwickelt werden (White Label Lösung). Mitmachen ist gewünscht!',
                ]
            },
            {
                header: 'Digitransit Plattform',
                paragraphs: [
                    'Dieser Dienst basiert auf der Digitransit Platform und dem Backend-Dienst OpenTripPlanner. Alle Software ist unter einer offenen Lizenzen verfügbar. Vielen Dank an alle Beteiligten.',
                    'Der gesamte Quellcode der Plattform, die aus vielen verschiedenen Komponenten besteht, ist auf <a href="https://github.com/stadtnavi/">Github</a> verfügbar.'
                ],
            },
            {
                header: 'Datenquellen',
                paragraphs: [
                    'Kartendaten: © <a target=new href=https://www.openstreetmap.org/>OpenStreetMap Mitwirkende</a>',
                    'ÖPNV-Daten: Datensätze der <a target=new href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>NVBW GmbH</a> und der <a target=new href=https://www.openvvs.de/dataset/gtfs-daten>VVS GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) jeweils angereichert mit OpenStreetMap-Daten © OpenStreetMap Mitwirkende',
                    'Sharing-Daten: Datensätze der <a target=new href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>NVBW GmbH</a>.',
                    'Alle Angaben ohne Gewähr.'
                ],
            },
        ],
        en: [
            {
                header: 'About this service',
                paragraphs: [
                    'stadtnavi is a travel planning application for the city of Herrenberg and its surroundings. This service includes public transport, footpaths, cycling, street and parking information, charging infrastructure and sharing offerings. The mobility offerings are connected through intermodal routing.',
                    '<a href="https://www.herrenberg.de/stadtluft"><img src="https://www.herrenberg.de/ceasy/resource/?id=4355&predefinedImageSize=rightEditorContent"/></a>',
                ],
            },
            {
                header: 'Contribute',
                paragraphs: [
                    'The city of Herrenberg has developed this app, funded by the Federal Ministry of Transport and Digital Infrastructure (BMVI), as model city. The stadtnavi app is an open source solution and can be used, customized and further developed by other municipalities to meet individual needs (white lable solution). Participation is welcome!',
                ]
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
                    'Public transit data: Datasets by <a target=new href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>NVBW GmbH</a> and <a target=new href=https://www.openvvs.de/dataset/gtfs-daten>VVS GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) enhanced with OpenStreetMap data © OpenStreetMap contributors',
                    'No responsibility is accepted for the accuracy of this information.'
                ],
            },
        ],
    },

    // adding assets/geoJson/hb-layers layers
    geoJson: {
        layers: [
            // bicycleinfrastructure includes shops, repair stations,
            {
                name: {
                    fi: '',
                    en: 'Service stations and stores',
                    de: "Service Stationen und Läden",
                },
                url: 'https://data.mfdz.de/hbg/dt-layers/bicycleinfrastructure.geojson',
                category: 'bicycle',
                icon: 'icon-icon_bike_repair',
            },
            // LoRaWan map layer
            {
                name: {
                    fi: '',
                    en: 'LoRaWAN Gateways',
                    de: 'LoRaWAN Gateways',
                },
                url: 'https://data.mfdz.de/hbg/dt-layers/lorawan-gateways.geojson',
                category: 'other',
                isOffByDefault: true,
                icon: 'icon-icon_gateways',
            },
            // Nette Toilette layer
            {
                name: {
                    fi: '',
                    en: 'Public Toilets',
                    de: 'Nette Toilette',
                },
                url: 'https://data.mfdz.de/hbg/dt-layers/toilet.geojson',
                category: 'other',
                isOffByDefault: true,
                icon: 'icon-icon_public_toilets',
            },
        ],
    },
    staticMessagesUrl: STATIC_MESSAGE_URL,

    parkAndRideBannedVehicleParkingTags: [
        'lot_type:Parkplatz',
        'lot_type:Tiefgarage',
        'lot_type:Parkhaus'
    ],

    realtime: { hbg: realtimeHbg },

    // live bus locations
    vehicles: true,
});
