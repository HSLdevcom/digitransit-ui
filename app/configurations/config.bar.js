/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'bar';
const APP_TITLE = 'Allrad';
const APP_DESCRIPTION = 'Unterwegs mit dem Fahrrad, Bus und Bahn';
const API_URL = process.env.API_URL || 'https://api.bike-and-ride.de';
const STATIC_MESSAGE_URL =
    process.env.STATIC_MESSAGE_URL ||
    '/assets/messages/message.bar.json';
const YEAR = 1900 + new Date().getYear();

const walttiConfig = require('./config.stadtnavi.js').default;

const hostname = new URL(API_URL);

const minLat = 51.9078;
const maxLat = 55.0917;
const minLon = 8.0489;
const maxLon = 11.0207;

export default configMerger(walttiConfig, {
    CONFIG,


    appBarLink: {
        name: 'Feedback',
        href: 'https://open-booking.eu/feedback/',
        target: '_blank'
    },

    contactName: {
        de: 'binary butterfly',
        default: 'binary butterfly',
    },

    colors: {
        primary: '#E10019',
        iconColors: {
            'mode-bus': '#ff0000',
            'mode-car': '#007AC9',
            'mode-rail': '#008000',
            'mode-charging-station': '#00b096',
            'mode-bike-park': '#005ab4',
        },
    },

    sprites: 'assets/svg-sprite.hb.svg',

    socialMedia: {
        title: APP_TITLE,
        description: APP_DESCRIPTION,

        image: {
            url: '/img/bar-social-media-card.png',
            width: 1080,
            height: 600,
        },

        twitter: {
            card: 'summary_large_image',
            site: '@bike_and_ride',
            creator: '@bike_and_ride'
        },

    },


    cityBike: {
        minZoomStopsNearYou: 10,
        showStationId: false,
        useSpacesAvailable: false,
        showCityBikes: true,
        networks: {
            stadtrad: {
                icon: 'citybike',
                name: {
                    de: 'StadtRAD Hamburg',
                    en: 'StadtRAD Hamburg',
                },
                type: 'citybike',
                url: {
                    de: 'https://stadtrad.hamburg.de/de',
                    en: 'https://stadtrad.hamburg.de/en',
                },
                visibleInSettingsUi: false,
                hideCode: true,
                enabled: true,
                season: {
                    // 1.1. - 31.12.
                    start: new Date(new Date().getFullYear(), 0, 1),
                    end: new Date(new Date().getFullYear(), 11, 31),
                },
            },
        }
    },

    
    title: APP_TITLE,

    favicon: './app/configurations/images/bar/favicon.png',

    meta: {
        description: APP_DESCRIPTION,
    },

    logo: 'bar/bike-and-ride-logo.svg',
    showTitles: true,

  
    map: {
        attribution: {
            'default': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a>, ÖPNV-Datensätze des HVV und der Connect Fahrplanauskunft GmbH',
            'bicycle': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a>, © <a tabindex=-1 href=https://www.cyclosm.org/#map=12/52.3728/4.8936/cyclosmx>CyclOSM</a>, © <a tabindex=-1 href="https://www.openstreetmap.fr/">OSM-FR</a>, ÖPNV-Datensätze des HVV und der Connect Fahrplanauskunft GmbH',
        },
    },

    feedIds: ['hh', "1"],

    searchSources: ['oa', 'osm'],

    searchParams: {
        'boundary.rect.min_lat': 51.9078,
        'boundary.rect.max_lat': 55.0917,
        'boundary.rect.min_lon': 8.0489,
        'boundary.rect.max_lon': 11.0207,
        'focus.point.lat': 53.5506,
        'focus.point.lon': 10.0007
    },

    areaPolygon: [
        [minLon, minLat],
        [minLon, maxLat],
        [maxLon, maxLat],
        [maxLon, minLat],
    ],

    nationalServiceLink: { 
        de: {
            name: 'Fahrplanauskunft der Deutschen Bahn', href: 'https://www.bahn.de/' 
        }
    },

    defaultEndpoint: {
        lat: 53.5506,
        lon: 10.0007,
    },

    menu: {
        copyright: {
            label: `Demonstrator für gobeta.de/hamburg von binary butterfly GmbH ${YEAR}`
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
                href: 'https://binary-butterfly.de/impressum/',
            }
        ],
        footer: 
            {
                body: 'Entwickelt von Holger Bruch, Ernesto Ruge u.a. mit OpenSource-Komponenten aus Digitransit und OpenBooking u.a.',
                footer: '#poweredbyDBmindbox'
            }
    },

    aboutThisService: {
        de: [
            {
                header: 'Datenschutzhinweise zur Routingplatform Allrad',
                paragraphs: [
                    'Es gelten die Datenschutzhinweise von binary butterfly. Diese sind unter <a href="https://binary-butterfly.de/datenschutz/">https://binary-butterfly.de/datenschutz/</a> einsehbar.',
                    'Die Anwendung Allrad bietet intermodale Mobilitätsauskünfte.'
                ],
            },
            {
                header: 'stadtnavi / Digitransit Plattform',
                paragraphs: [
                    'Dieser Dienst basiert auf dem Dienst stadtnavi, welcher wiederum auf der Digitransit Platform und dem Backend-Dienst OpenTripPlanner basiert. Alle Software ist unter einer offenen Lizenzen verfügbar. Vielen Dank an alle Beteiligten.',
                    'Der gesamte Quellcode der Plattform, die aus vielen verschiedenen Komponenten besteht, ist auf <a href="https://github.com/stadtnavi/">Github</a> verfügbar.'
                ],
            },
            {
                header: 'Datenquellen',
                paragraphs: [
                    'Kartendaten: © <a target=new href=https://www.openstreetmap.org/>OpenStreetMap Mitwirkende</a>',
                    'ÖPNV-Daten: Datensätze des <a target=new href=https://www.hvv.de/de/fahrplaene/abruf-fahrplaninfos/datenabruf>Hamburger Verkehrsverbund GmbH</a> und der <a target=new href=http://www.connect-fahrplanauskunft.de/index.php?id=impressum>Connect Fahrplanauskunft GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) jeweils angereichert mit OpenStreetMap-Daten © OpenStreetMap Mitwirkende',
                    'StadtRAD-Daten: © Deutsche Bahn Connect GmbH',
                    'B+R Abstellanlagen: © P+R Betreibergesellschaft GmbH und OpenStreetMap Mitwirkende, eigener Abgleich',
                    'Alle Angaben ohne Gewähr.'
                ],
            },
        ],

    },

  

    showTicketInformation: false,
    showTicketPrice: false,
    showTicketSelector: false,
    
    availableTickets: { '1' : {}, 'hh' : {}},

    fareMapping: (fareId) => {
        return fareId && fareId.substring
            ? fareId.substring(fareId.indexOf(':') + 1)
            : '';
    },

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

        ferry: {
            availableForSelection: true,
            defaultValue: true,
            nearYouLabel: {
                de: 'Fähranleger in der Nähe',
            }
        },

        carpool: {
            availableForSelection: false,
            defaultValue: false,
            nearYouLabel: {
                de: 'Mitfahrpunkte in der Nähe',
                en: 'Nearby carpool stops on the map',
            }
        },
    },
    
    parkAndRideBannedVehicleParkingTags: [],

    suggestBikeAndPublicMinDistance: 1000,
    suggestBikeAndParkMinDistance: 1000,

    showVehiclesOnStopPage: false,

    includeCarSuggestions: false,
    includeParkAndRideSuggestions: false,

    showMapRoutingButton: false,

    showStopAndRouteSearch: false,
    showTimeTableOptions: false,

    viaPointsEnabled: false,

    welcomePopup: {
        enabled: true,
        heading: 'Die Zukunft der Fahrrad-Zug Navigation. Allrad.',
        paragraphs: [
            'Teste zum ITS Kongress unser Routing Tool. Dafür musst Du nur Start- und Endstation angeben, schon kannst Du Teile der Strecke mit dem Fahrrad zurücklegen und das Fahrrad bequem und sicher abstellen. Alle Informationen zum Routing und zu möglichen Fahrradabstellplätzen erhältst du auf Allrad. Für alle die ohne eigenes Fahrrad unterwegs sind, ist auch ein Sharing Angebot mit StadtRad im Routing integriert. ',
            'Die Anwendung ist ein Demonstrator. Wir freuen uns auf euer Feedback, durch welches wir den Service optimieren können.'
        ],
    },
});
