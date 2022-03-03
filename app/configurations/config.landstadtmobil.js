/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'landstadtmobil';
  const APP_TITLE = 'landstadtmobil Kreis Reutlingen';
const APP_DESCRIPTION = 'Gemeinsam Mobilität neu denken - die intermodale Verbindungssuche mit offenen, lokalen Daten';
const API_URL = process.env.API_URL || 'https://api.stadtnavi.de';
const MAP_URL = process.env.MAP_URL || 'https://tiles.stadtnavi.eu/streets/{z}/{x}/{y}{r}.png';
const SEMI_TRANSPARENT_MAP_URL = process.env.SEMITRANSPARENT_MAP_URL || "https://tiles.stadtnavi.eu/satellite-overlay/{z}/{x}/{y}{r}.png";
const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || "https://photon.stadtnavi.eu/pelias/v1";
const YEAR = 1900 + new Date().getYear();
const STATIC_MESSAGE_URL =
    process.env.STATIC_MESSAGE_URL ||
    '/assets/messages/message.kreis_reutlingen.json';

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
        CHARGING_STATION_DETAILS_API: 'https://api.ocpdb.de/api/ocpi/2.2/location/',
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
        de: 'transportkollektiv',
        default: 'transportkollektiv',
    },

    colors: {
        primary: '#888c98',
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

    roadworks: {
        showRoadworks: true,
        roadworksSmallIconZoom: 16,
        roadworksMinZoom: 10
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
            'de.mfdz.flinkster.cab.regiorad_stuttgart': {
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
                enabled: true,
                hideCode: true,
            },
            'tier_REUTLINGEN': {
                icon: 'tier_scooter',
                name: {
                    de: 'TIER Reutlingen',
                    en: 'TIER Reutlingen',
                },
                type: 'scooter',
                url: {
                    de: 'https://www.tier.app/de',
                    en: 'https://www.tier.app/',
                },
                visibleInSettingsUi: true,
                enabled: true,
                hideCode: true,
            },
            'tier_MUNSINGEN': {
                icon: 'tier_bicycle',
                name: {
                    de: 'TIER Münsingen',
                    en: 'TIER Münsingen',
                },
                type: 'citybike',
                url: {
                    de: 'https://www.tier.app/de',
                    en: 'https://www.tier.app/',
                },
                visibleInSettingsUi: true,
                enabled: true,
                hideCode: true,
            },
            "car-sharing": {
                icon: 'car-sharing',
                name: {
                    de: 'Carsharing',
                    en: 'Car sharing',
                },
                type: 'car-sharing',
                url: {
                },
                visibleInSettingsUi: false,
                enabled: true,
                hideCode: true,
            },
        }
    },

    mergeStopsByCode: true,

    title: APP_TITLE,

    favicon: './app/configurations/images/landstadtmobil/favicon.png',

    meta: {
        description: APP_DESCRIPTION,
    },

    modeToOTP: {
        carpool: 'CARPOOL',
    },

    logo: 'landstadtmobil/landstadtmobil-reutlingen-logo.svg',

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
        'focus.point.lat': 48.4008,
        'focus.point.lon': 9.3762
    },

    areaPolygon: [
        [minLon, minLat],
        [minLon, maxLat],
        [maxLon, maxLat],
        [maxLon, minLat],
    ],

    nationalServiceLink: { name: 'Fahrplanauskunft efa-bw', href: 'https://www.efa-bw.de' },

    defaultEndpoint: {
        lat: 48.4008,
        lon: 9.3762,
    },  

    menu: {
        copyright: {
            label: `© Kreis Reutlingen ${YEAR}`
        },
        content: [
            {
                name: 'privacy',
                nameEn: 'Privacy',
                route: '/dieser-dienst',
                icon: 'icon-icon_info',
            },
            {
                name: 'imprint',
                nameEn: 'Imprint',
                href: 'https://www.kreis-reutlingen.de/de/impressum',
            }
        ],
    },

    aboutThisService: {
        de: [
            {
                header: 'Datenschutzhinweise zur Routingplatform LandStadtMobil',
                paragraphs: [
                    'Es gelten die Datenschutzhinweise des Landkreises Reutlingen. Diese sind unter <a href="https://www.kreis-reutlingen.de/datenschutz">https://www.kreis-reutlingen.de/datenschutz</a> einsehbar.',
                    'Die Anwendung LandStadtMobil bietet intermodale Mobilitätsauskünfte. Neben den Datenschutzhinweisen des Landkreises (in der Allgemeinen Datenschutzerklärung) zu Server-Logs und Cookies werden zur Optimierung der Anwendung die genutzten Funktionen erhoben. Hierzu nutzt die Anwendung LandStadtMobil die Anwendung Matomo und speichert hierzu Cookies. Die Speicherung dieser Cookies erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. ',
                    'Explizit nicht gespeichert werden Start-/Ziel Suchen.'
                ],
            },
            {
                header: 'ride2go',
                paragraphs: [
                    'LandStadtMobil nutzt zum Inserieren von Fahrgemeinschaftsangeboten die Dienste der ride2go GmbH, Erlenstr. 7, D-71297 Mönsheim.',
                    'Beim Inserieren von Mitfahrangeboten werden die folgenden Daten vom Nutzer erhoben und an ride2go.de übermittelt: ',
                    'Fahrtdaten (Start, Ziel, Datum/Wochentage und Uhrzeit), Kontaktdaten (Telefonnummer, E-Mail-Adresse)',
                    'Die personenbezogenen Daten werden für die Einstellung eines Fahrgemeinschafts-Inserats in LandStadtMobil erhoben und als Kontaktmöglichkeit für die Nutzer zur Kontaktaufnahme verwendet. Die angegebenen Daten werden durch ride2go.de und angeschlossene Partner-Portale veröffentlicht und damit weitergegeben. Die Nutzung und Eingabe von Daten in diese Online-Anwendung erfolgt freiwillig.',
                    'Nach dem Absenden eines Inserats erhalten Inserierende eine E-Mail-Bestätigung zur Aktivierung und späteren Löschung des Inserats.',
                    'Mehr Informationen zum Umgang mit Nutzerdaten finden Sie in der <a href="https://www.ride2go.de/html/datenschutz.html">Datenschutzerklärung von ride2go.de</a>',
                    'LandStadtMobil speichert keine Kontaktdaten.'
                ]
            },
            {
                header: 'Über LandStadtMobil',
                paragraphs: [
                    'LandStadtMobil ist eine Routingplattform, die verschiedene Mobilitätsangebote wie Bus, Bahn, Fahrrad und Fahrgemeinschaften miteinander verknüpft. Die Plattform ist Teil des Modellpro-jektes „Integriertes Mobilitätskonzept zur Sicherung der Anschlussmobilität im ländlichen Raum“, das im Rahmen des Förderprogramms „LandMobil“ vom Ministerium für Ernährung und Landwirtschaft gefördert wird.',
                    'Bis Ende 2022 werden die Gemeinde Engstingen und die Stadt Münsingen gemeinsam mit dem Landkreis erproben, wie die Anschlussmobilität im ländlichen Raum, also die erste und letzte Meile zu Mobilitätsknotenpunkten, verbessert werden kann. Dazu werden zusätzliche Mobilitätsangebote, ein E-Bikesharing-System, ein E-Carsharing-Modell und ein lokales Mitfahrnetzwerk in der Gemeinde Engstingen und der Stadt Münsingen umgesetzt. Die Angebote werden in die Routingplattform LandStadtMobil integriert, um entsprechende Routingauskünfte und Reisevorschläge generieren zu können. Ergänzt werden die Mobilitätsangebote um Fahrradabstellmöglichkeiten (Fahrradständer und Fahrradboxen) sowie Lademöglichkeiten für E-Bikes.',
                    'Während des Erprobungszeitraums werden die Projekte vom Kreisamt für nachhaltige Entwicklung begleitet, evaluiert, übertragbare Lösungen abgeleitet und darauf aufbauend Handlungsempfehlungen formuliert.',
                    'Weitere Informationen zum Projekt erhalten Sie unter <a href="https://www.kreis-reutlingen.de/landmobil">www.kreis-reutlingen.de/landmobil</a>.',
                    'Dieser Dienst basiert auf dem Dienst stadtnavi, welche auf der Digitransit Platform und dem Backend-Dienst OpenTripPlanner basiert. Alle Software ist unter einer offenen Lizenzen verfügbar. Vielen Dank an alle Beitragenden.',
                    'Der gesamte Quellcode der Plattform, die aus vielen verschiedenen Komponenten besteht, ist auf <a href="https://github.com/stadtnavi/">Github</a> verfügbar.',
                    '<img src="/img/landstadtmobil-funding-logo.png"/>'
                ],
            },
            {
                header: 'Datenquellen',
                paragraphs: [
                    'Kartendaten: © <a target=new href=https://www.openstreetmap.org/>OpenStreetMap Mitwirkende</a>',
                    'ÖPNV-Daten: Datensätze der <a target=new href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>NVBW GmbH</a> und der <a target=new href=https://www.openvvs.de/dataset/gtfs-daten>VVS GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) jeweils angereichert mit OpenStreetMap-Daten © OpenStreetMap Mitwirkende',
                    'CarSharing-Standorte: Datensätze der <a target=new href=https://www.teilauto-neckar-alb.de/>teilAuto Neckar-Alb eG</a>.',
                    'Scooter und BikeSharing-Standorte: <a target=new href=https://www.tier.app/>TIER Mobility GmbH</a>.',
                    'Alle Angaben ohne Gewähr.'
                ],
            }
        ],
        en: [
            {
                header: 'Data protection information for the routing platform LandStadtMobil',
                paragraphs: [
                    'The data protection information of the district of Reutlingen applies. These can be found at <a href="https://www.kreis-reutlingen.de/datenschutz">https://www.kreis-reutlingen.de/datenschutz</a>.',
                    'The LandStadtMobil application offers intermodal mobility information. In addition to the data protection notices of the district (in the general data protection declaration) on server logs and cookies, the functions used are recorded to optimize the application. For this purpose, the LandStadtMobil application uses the Matomo application and stores cookies for this purpose. These cookies are stored on the basis of Article 6 (1) (f) GDPR. ',
                    'Start/destination searches are not saved.'
                ],
            },
            {
                header: 'ride2go',
                paragraphs: [
                    'LandStadtMobil uses the services of ride2go GmbH, Erlenstr. 7, D-71297 Mönsheim to advertise carpool offers.',
                    'When advertising carpooling offers, the following data is collected from the user and transmitted to ride2go.de:',
                    'Journey data (start, destination, date/weekdays and time), contact details (telephone number, e-mail address)',
                    'The personal data is collected for the placement of a carpool advertisement in LandStadtMobil and used as a contact option for interested riders to get in touch. The data provided will be published by ride2go.de and affiliated partner portals and thus passed on. The use and input of data in this online application is voluntary.',
                    'After submitting an advertisement, advertisers receive an e-mail confirming the activation and subsequent deletion of the advertisement.',
                    'More information on handling user data can be found in the <a href="https://www.ride2go.de/html/datenschutz.html">Privacy Policy of ride2go.de</a>',
                    'LandStadtMobil does not store any contact data.'
                ]
            },
            {
                header: 'About LandStadtMobil',
                paragraphs: [
                    'LandStadtMobil is a routing platform that links various mobility offers such as bus, train, bicycle and carpooling. The platform is part of the model project “Integrated mobility concept to ensure subsequent mobility in rural areas”, which is funded by the Ministry of Food and Agriculture as part of the “LandMobil” funding program.',
                    'By the end of 2022, the municipality of Engstingen and the city of Münsingen will work with the district to test how connecting mobility in rural areas, i.e. the first and last mile to mobility hubs, can be improved. Additional mobility offers, an e-bike sharing system, an e-car sharing model and a local car sharing network will be implemented in the community of Engstingen and the city of Münsingen. The offers are integrated into the LandStadtMobil routing platform in order to be able to generate appropriate routing information and travel suggestions. The mobility offers are supplemented by bicycle parking facilities (bicycle racks and bicycle boxes) and charging facilities for e-bikes.',
                    'During the trial period, the projects are monitored and evaluated by the district office for sustainable development, transferrable solutions are derived and recommendations for action are formulated based on this.',
                    'For more information about the project, see <a href="https://www.kreis-reutlingen.de/landmobil">www.kreis-reutlingen.de/landmobil</a>.',
                    'This service is based on the stadtnavi service, which is based on the Digitransit Platform and the OpenTripPlanner backend service. All software is available under an open license. Thanks to all contributors.',
                    'The entire source code of the platform, which consists of many different components, is on available on <a href="https://github.com/stadtnavi/">Github</a>.',
                    '<img src="/img/landstadtmobil-funding-logo.png"/>'
                ],
            },
            {
                header: 'Data sources',
                paragraphs: [
                    'Map data: © <a target=new href=https://www.openstreetmap.org/>OpenStreetMap Mitwirkende</a>',
                    'Transit data: Datensätze der <a target=new href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>NVBW GmbH</a> und der <a target=new href=https://www.openvvs.de/dataset/gtfs-daten>VVS GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) jeweils angereichert mit OpenStreetMap-Daten © OpenStreetMap Mitwirkende',
                    'CarSharing locations: Datensätze der <a target=new href=https://www.teilauto-neckar-alb.de/>teilAuto Neckar-Alb eG</a>.',
                    'Scooter and BikeSharing locations: <a target=new href=https://www.tier.app/>TIER Mobility GmbH</a>.',
                    'All statements without guarantee.'
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
    vehicles: true,
    showVehiclesOnSummaryPage: false,
    showVehiclesOnStopPage: true,

    showBikeAndPublicItineraries: true,
    showBikeAndParkItineraries: true,
    showStopAndRouteSearch: false,
    showTimeTableOptions: false,

    viaPointsEnabled: false,
});
