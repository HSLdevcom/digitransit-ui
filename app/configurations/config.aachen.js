/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'aachen';
const APP_TITLE = 'Innenstadtnavi Aachen';
const APP_DESCRIPTION = 'Gemeinsam Mobilität neu denken - die intermodale Verbindungssuche mit offenen, lokalen Daten';
const API_URL = process.env.API_URL || 'https://api.aachen.stadtnavi.eu';
const OTP_URL = process.env.OTP_URL || `${API_URL}/otp/routers/default/`;
const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || "https://photon-eu.stadtnavi.eu/pelias/v1";
const STATIC_MESSAGE_URL =
    process.env.STATIC_MESSAGE_URL ||
    '/assets/messages/message.empty.json';

const parentConfig = require('./config.stadtnavi.js').default;

const minLat = 50.39;
const maxLat = 51.31;
const minLon = 5.02;
const maxLon = 7.21;

export default configMerger(parentConfig, {
    CONFIG,
    URL: {
        OTP: OTP_URL,
        MAP: {
            satellite: 'https://www.wmts.nrw.de/geobasis/wmts_nw_dop/tiles/nw_dop/EPSG_3857_16/{z}/{x}/{y}',
        },
        STOP_MAP: `${OTP_URL}vectorTiles/stops/`,
        PARK_AND_RIDE_MAP: `${OTP_URL}vectorTiles/parking/`,
        RENTAL_STATION_MAP: `${OTP_URL}vectorTiles/rentalStations/`,
        RENTAL_VEHICLE_MAP: `${OTP_URL}vectorTiles/rentalVehicles/`,
        REALTIME_RENTAL_STATION_MAP: `${OTP_URL}vectorTiles/realtimeRentalStations/`,
        CHARGING_STATIONS_MAP: `https://api.ocpdb.de/tiles/{z}/{x}/{y}.mvt`,
        CHARGING_STATION_DETAILS_API: 'https://api.ocpdb.de/api/ocpi/2.2/location/',
        PELIAS: `${process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL}/search`,
        PELIAS_REVERSE_GEOCODER: `${
            process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
        }/reverse`,
        PELIAS_PLACE: `${
            process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
        }/place`,
        FONT: '', // Do not use Google fonts.
        EMBEDDED_SEARCH_GENERATION: '/embeddedSearchGenerator',
    },

    title: APP_TITLE,
    meta: {
        description: APP_DESCRIPTION,
    },
    availableLanguages: ['de', 'en', 'fr', 'nl'],
    
    map: {
        attribution: {
            'default': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a>© <a tabindex=-1 href="https://www.maptiler.com/copyright/">MapTiler</a> ÖPNV-Daten: <a tabindex=-1 href=https://avv.de/de/fahrplaene/opendata-service>AVV GmbH</a>',
            'satellite': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a> ÖPNV-Daten: <a tabindex=-1 href=https://avv.de/de/fahrplaene/opendata-service>AVV GmbH</a>',
            'bicycle': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a> ÖPNV-Daten: <a tabindex=-1 href=https://avv.de/de/fahrplaene/opendata-service>AVV GmbH</a>',
        },
    },

    // -- Style configuration  ----
    logo: 'herrenberg/stadtnavi-logo.svg',
    showTitles: true,
    subTitle: 'Aachen',

    sprites: 'assets/svg-sprite.aachen.svg',
    //logo: 'aachen/logo.svg',
    favicon: './app/configurations/images/aachen/stadt-aachen.png',
    
    colors: {
        primary: '#6E9BD2',
        iconColors: {
            'mode-bus': '#B70F75',
            'mode-rail': '#6E9BD2',
            'mode-tram': '#6E9BD2',
            'mode-subway': '#6E9BD2',
            'mode-ferry': '#6E9BD2',
            'mode-charging-station': '#7ABC3C',
            'mode-bike-park': '#225BD2',
            'mode-citybike': '#EF8925',
        }
    },

    // -- Bounding boxes for display and search ----

    searchParams: {
        'boundary.rect.min_lat': 51.31,
        'boundary.rect.max_lat': 50.39,
        'boundary.rect.min_lon': 5.02,
        'boundary.rect.max_lon': 7.21,
        'focus.point.lat': 50.7754,
        'focus.point.lon': 6.0847
    },

    areaPolygon: [
        [minLon, minLat],
        [minLon, maxLat],
        [maxLon, maxLat],
        [maxLon, minLat],
    ],

    defaultEndpoint: {
        lat: 50.7754,
        lon: 6.0847,
    },

    transportModes: {
        subway: {
            availableForSelection: false,
        },
        carpool: {
            availableForSelection: false,
        },
        funicular: {
            availableForSelection: false,
        },
    },

    streetModes: {
        bicycle: {
            availableForSelection: true,
            defaultValue: true,
            exclusive: true,
            icon: 'bicycle-withoutBox',
        },

        car: {
            availableForSelection: true,
            defaultValue: true,
            exclusive: false,
            icon: 'car-withoutBox',
        },

        car_park: {
            availableForSelection: true,
            defaultValue: true,
            exclusive: false,
            icon: 'car-withoutBox',
        },
    },

    suggestCarMinDistance: 10,
    // -- Map-Layers configuration -----

    // adding assets/geoJson/hb-layers layers
    geoJson: {
        layers: [
            {
                name: {
                    fi: '',
                    en: 'Roadworks',
                    de: "Baustellen",
                    fr: 'Chantiers de construction',
                    nl: 'Buwplaats',
                },
                url: 'https://data.mfdz.de/aachen/baustellen/roadworks.geojson',
                category: 'bicycle_car',
                icon: 'icon-icon_roadworks',
            },
            {
                name: {
                    fi: '',
                    en: 'Points of interest',
                    de: "Sehenswürdigkeiten",
                    fr: 'Sites',
                    nl: 'Bezienswaardigheden',
                },
                url: 'https://kim.regioit.de/GIS/STAC/stadtnavi/poi_2.json',
                category: 'leisure_and_tourism',
                icon: 'icon-icon_poi-marker',
            },
            {
                name: {
                    fi: '',
                    en: 'Smart Shopping',
                    de: 'Smart Shopping',
                    fr: 'Smart Shopping',
                    nl: 'Smart Shopping',
                },
                url: 'https://kim.regioit.de/GIS/STAC/stadtnavi/poi_smart_shopping.json',
                category: 'shopping_and_services',
                icon: 'icon-icon_aac_smart-shopping-marker',
            },
            {
                name: {
                    fi: '',
                    en: 'Shopping streets',
                    de: 'Einkaufsstraßen',
                    fr: 'Rues commerçantes',
                    nl: 'Winkelstraten',
                },
                url: 'https://kim.regioit.de/GIS/STAC/stadtnavi/einkaufsstrasse.json',
                category: 'shopping_and_services',
                icon: 'icon-icon_aac_shopping-streets-marker',
            },
        ],
    },

    // -- Routing configuration

    parkAndRideBannedVehicleParkingTags: [
        'lot_type:Parkplatz',
        'lot_type:Tiefgarage',
        'lot_type:Parkhaus'
    ],

    cityBike: {
        minZoomStopsNearYou: 10,
        showStationId: false,
        useSpacesAvailable: false,
        showCityBikes: true,
        
        operators : {
          cambio: {
            icon: "brand_cambio",
            name: {
                de: "Cambio",
                fr: "Cambio",
                en: "Cambio",
                nl: "Cambio",
            },
            colors: {
                background: '#EB690B'
            }
          },
          tier: {
            icon: "brand_tier",
            name: {
                de: "TIER",
                fr: "TIER",
                en: "TIER",
                nl: "TIER",
            },
            colors: {
               background: '#ffffff',
               foreground: '#000000'
            }
          },
          velocity: {
            icon: "brand_velocity",
            name: {
                de: "velocity Aachen",
                fr: "velocity Aachen",
                en: "velocity Aix-la-Chapelle",
                nl: "velocity Aken",
            },
            colors: {
                background: '#D0D0D0',
                foreground: '#000000'
            }
          },
          voi: {
            icon: "brand_voi",
            name: {
                de: "voi.",
                fr: "voi.",
                en: "voi.",
                nl: "voi.",
            },
            colors: {
               background: '#ffffff',
               foreground: '#000000'
            }
          },
        },

        networks: {
           'cambio_aachen': {
             icon: "brand_cambio",
             operator: "cambio",
             name: {
               de: "Cambio",
               fr: "Cambio",
               en: "Cambio",
               nl: "Cambio",
             },
             type: "car",
             capacity: "No availability",
             form_factors: ['car'],
             hideCode: true,
             enabled: true,
           },
           'voiscooters.com': {
             icon: "brand_voi",
             operator: "voi",
             name: {
               de: "voi.",
               fr: "voi.",
               en: "voi.",
               nl: "voi.",
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true,
             url: {
                de: "https://www.voi.com/de",
                en: "https://www.voi.com/en",
                fr: "https://www.voi.com/fr",
                nl: "https://www.voi.com/nl",
             }
           },
           'tier_aachen': {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "TIER",
               fr: "TIER",
               en: "TIER",
               nl: "TIER",
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true,
             url: {
                de: "https://www.tier.app/de/",
                en: "https://www.tier.app/en/",
                nl: "https://www.tier.app/nl/",
                fr: "https://www.tier.app/fr/",
             }
           },
           'velocity_aachen': {
             icon: "brand_velocity",
             operator: "velocity",
             name: {
               de: "velocity Aachen",
               fr: "velocity Aachen",
               en: "velocity Aix-la-Chapelle",
               nl: "velocity Aken",
             },
             type: "bicycle",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true,
             url: {
                de: "https://portal.velocitymobility.com/js_sign_up/1581407379#/subscription-selection",
                en: "https://portal.velocitymobility.com/js_sign_up/1581407379#/subscription-selection",
                nl: "https://portal.velocitymobility.com/js_sign_up/1581407379#/subscription-selection",
                fr: "https://portal.velocitymobility.com/js_sign_up/1581407379#/subscription-selection",
             }
           }
        },   
    },

    // No live vehicles
    vehicles: false,
    weatherStations: {
        show: false,
    },
    roadworks: {
        show: false,
    },
    showCarpoolOfferButton: false,

    feedIds: ['1'], // TODO: GTFS Feed AVV contains feed_info.txt, but no feed_id

    // -- Menu and content customization ----

    staticMessagesUrl: STATIC_MESSAGE_URL,

    menu: {
        copyright: { label: `© Aachen ${parentConfig.YEAR}` },
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
                href: 'https://www.aachen.de/DE/stadt_buerger/allgemeines/impressum_stadtnavi.html',
            },
            {
                name: 'privacy',
                nameEn: 'Privacy',
                href: 'https://www.aachen.de/DE/stadt_buerger/allgemeines/datenschutz_stadtnavi.html',
            },
        ],
    },

    aboutThisService: {
        de: [
            {
                header: 'Über diesen Dienst',
                paragraphs: [
                    'stadtnavi Aachen ist eine Reiseplanungs-Anwendung für Aachen und Umgebung. Dieser Dienst umfasst ÖPNV, Fußwege, Radverkehr, Straßen- und Parkplatzinformationen, Ladeinfrastruktur und Sharing-Angebote. Mobilitätsangebote werden durch intermodales Routing miteinander vernetzt.',
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
                    'ÖPNV-Daten: Datensätze der <a target=new href=https://avv.de/>AVV GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) jeweils angereichert mit OpenStreetMap-Daten © OpenStreetMap Mitwirkende',
                    'Alle Angaben ohne Gewähr.'
                ],
            },
        ],
        en: [
            {
                header: 'About this service',
                paragraphs: [
                    'stadtnavi is a travel planning application for Aachen and its surroundings. This service includes public transport, footpaths, cycling, street and parking information, charging infrastructure and sharing offerings. The mobility offerings are connected through intermodal routing.',
                    'Funded by',
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
                    'Public transit data: Datasets by <a target=new href=https://avv.de/>AVV GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) enhanced with OpenStreetMap data © OpenStreetMap contributors',
                    'No responsibility is accepted for the accuracy of this information.'
                ],
            },
        ],
        fr: [
            {
                header: 'À propos de ce service',
                paragraphs: [
                    'stadtnavi Aachen est une application de planification de voyage pour Aix-la-Chapelle et ses environs. Ce service comprend les transports publics, les sentiers pédestres, les pistes cyclables, les informations routières et de stationnement, les infrastructures de recharge et les offres de partage. Les offres de mobilité sont mises en réseau via un routage intermodal.',
                    'Soutenu par <br>',
                    '<a href="https://www.herrenberg.de/stadtluft"><img src="https://www.herrenberg.de/ceasy/resource/?id=4355&predefinedImageSize=rightEditorContent"/></a>',
                ],
            },
            {
                header: 'Participer',
                paragraphs: [
                    "La ville de Herrenberg a développé cette application dans le cadre de la ville modèle financée par le ministère des Transports et de l'Infrastructure numérique (BMVI). L'application stadtnavi est une solution open source et peut être utilisée par d'autres communes et acteurs sous leur nom et leur apparence et adaptée et développée selon les besoins individuels (Solution White Label). La participation est la bienvenue!",
                ]
            },
            {
                header: 'Plateforme Digitransit',
                paragraphs: [
                    'Ce service est basé sur la plateforme Digitransit et le service backend OpenTripPlanner. Tous les logiciels sont disponibles sous licences ouvertes. Merci à toutes les personnes impliquées.',
                    "L'intégralité du code source de la plateforme, composé de nombreux composants différents, est disponible sur Github.",
                ],
            },
            {
                header: 'Les sources de données',
                paragraphs: [
                    'Données cartographiques : © <a target=new href=https://www.openstreetmap.org/>Contributeurs OpenStreetMap</a>',
                    "Données de transports publics : ensembles de données d'<a target=new href=https://avv.de/>AVV GmbH</a>, formes (c'est-à-dire géométries de l'itinéraire) enrichiés de données OpenStreetMap © Contributeurs OpenStreetMap",
                    'Tous les renseignements sont donnés sans garantie.'
                ],
            },
        ],
        nl: [
            {
                header: 'Over deze dienst',
                paragraphs: [
                    'stadtnavi Aken is een reisplanningsapplicatie voor Aken en omgeving. Deze dienst omvat openbaar vervoer, voetpaden, fiets-, weg- en parkeerinformatie, laadinfrastructuur en deelaanbiedingen. Het mobiliteitsaanbod wordt met elkaar verbonden via intermodale routing.',
                    'Gesponsord door <br>',
                    '<a href="https://www.herrenberg.de/stadtluft"><img src="https://www.herrenberg.de/ceasy/resource/?id=4355&predefinedImageSize=rightEditorContent"/></a>',

                ],
            },
            {
                header: 'Doe mee',
                paragraphs: [
                    'De stad Herrenberg heeft deze app ontwikkeld als onderdeel van de modelstad, gefinancierd door het federale ministerie van Transport en Digitale Infrastructuur (BMVI). applicatie stadtnavi is een open source oplossing en kan door andere gemeenten en actoren onder hun naam en uitstraling gebruikt worden en aangepast en verder ontwikkeld worden naar individuele behoeften (white label oplossing). Deelname is welkom!',
                ]
            },
            {
                header: 'Digitransit-platform',
                paragraphs: [
                    'Deze dienst is gebaseerd op het Digitransit Platform en de backend dienst OpenTripPlanner. Alle software is beschikbaar onder open licenties. Bedankt aan alle betrokkenen.',
                    'De volledige broncode van het platform, dat uit veel verschillende componenten bestaat, is beschikbaar op <a href="https://github.com/stadtnavi/">Github</a>.'
                ],
            },
            {
                header: 'Gegevensbronnen',
                paragraphs: [
                    'Kaartgegevens: © <a target=new href=https://www.openstreetmap.org/>OpenStreetMap-bijdragers</a>',
                    'Gegevens openbaar vervoer: Datasets van <a target=new href=https://avv.de/>AVV GmbH</a>, vormen (d.w.z. geometrieën van de route), elk verrijkt met OpenStreetMap-gegevens © OpenStreetMap-bijdragers',
                    'Alle verklaringen zonder garantie.'
                ],
            },
        ],
    },

    // -- Issue Tracker configuration ---- 
    issueTrackerUrl: 'https://maengelmelder.aachen.de/?lat=${lat}&lng=${lon}',
    // issueTrackerUrls define issuetracker URLs per postalCode. In case none matches, issueTrackerUrl is used as falllback
    issueTrackerUrls: {
        // The issue tracker is selected depending on the postal code returned by the geocoding service.
        // To add custom ones, e.g. uncomment the following line and add your custom ones:
        // '71083': 'https://www.herrenberg.de/tools/mvs/?lat=${lat}&lng=${lon}#mvPagePictures',
    },

    appBarLink: false,
});
