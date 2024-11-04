/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'vpe';
const APP_TITLE = 'VPE mobi';
const APP_DESCRIPTION = 'Verbindungssuche des VPE';
const YEAR = 1900 + new Date().getYear();
const STATIC_MESSAGE_URL =
    process.env.STATIC_MESSAGE_URL ||
    '/assets/messages/message.empty.json';

const parentConfig = require('./config.stadtnavi.js').default;

const minLat = 47.305;
const maxLat = 50.008;
const minLon = 5.620;
const maxLon = 12.387;

export default configMerger(parentConfig, {
    CONFIG,
    URL: {},
    issueTrackerUrl: 'https://mangel.vpe.de/tools/index.php?lat=${lat}&lng=${lon}',


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

    socialMedia: {
        title: APP_TITLE,
        description: APP_DESCRIPTION,

        image: {
            url: '/img/vpe-social-media-card.jpg',
            width: 600,
            height: 300,
        },

        twitter: {
            card: 'summary_large_image',
        },
    },

    cityBike: {
        minZoomStopsNearYou: 10,
        showStationId: false,
        useSpacesAvailable: false,
        showCityBikes: true,
        networks: {
            "car-sharing": {
                icon: 'car-sharing',
                name: {
                    de: 'stadtmobil',
                    en: 'stadtmobil',
                },
                type: 'car-sharing',
                url: {
                    de: 'https://pforzheim.stadtmobil.de/privatkunden/',
                    en: 'https://pforzheim.stadtmobil.de/privatkunden/',
                },
                enabled: true,
                season: {
                    // currently not enabled for routing, but for display
                    start: new Date(new Date().getFullYear()+10, 0, 1),
                    end: new Date(new Date().getFullYear()+10, 11, 31),
                    preSeasonStart: new Date(new Date().getFullYear(), 0, 1),
                },
            }
        }
    },

    title: APP_TITLE,
    showTitles: true,
    favicon: './app/configurations/images/vpe/favicon.png',
    logo: 'vpe/logo_ohne_schrift.svg',

    meta: {
        description: APP_DESCRIPTION,
    },

    modeToOTP: {
        carpool: 'CARPOOL',
    },

    feedIds: ['hbg'],

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

    ticketingUrls: {
        web: "https://www.bahn.de/link_verbindungssuche?STS=true&SO={startStopName}&ZO={destStopName}&HD={datetime}",
        ios: "https://www.bahn.de/link_verbindungssuche?STS=true&SO={startStopName}&ZO={destStopName}&HD={datetime}",
        android: "https://www.bahn.de/link_verbindungssuche?STS=true&SO={startStopName}&ZO={destStopName}&HD={datetime}"
    },
    faresDisclaimer: 'Sie verlassen mit dem Ticketkauf die Seiten des VPE und benutzen dann den Ticketshop der Deutschen Bahn. Für deren Inhalte übernehmen wir keine Verantwortung. <br/><br/> Tarifauskünfte werden durch die Nahverkehrsgesellschaft Baden-Württemberg mbH (NVBW) zur Verfügung gestellt. Alle Angaben ohne Gewähr.',
    ticketingLogo: 'icon-ticketing_db',

    issueTrackerUrl: 'https://mangel.vpe.de/tools/index.php?lat=${lat}&lng=${lon}',

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
                name: 'current-alerts',
                nameEn: 'Current Alerts',
                href: 'https://startmobi.vpe.de/rss/',
                icon: 'icon-icon_warning',
            },
            {
                name: 'about-this-service',
                nameEn: 'About this Service',
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
                    '<b>VPE</b>mobi ist eine Reiseplanungs-Anwendung für den Verkehrsverbund Pforzheim-Enzkreis und Umgebung. Dieser Dienst umfasst zunächst Informationen zu ÖPNV, Fußwegen, Radverkehr und Straßen. Im weiteren Ausbau wird der Service um weitere Informationen ergänzt. Die Mobilitätsangebote werden durch intermodales Routing miteinander vernetzt. Das bedeutet egal, ob man den Weg zu Fuß, mit dem Fahrrad oder dem Auto zurücklegt, <b>VPE</b>mobi findet die optimale Verbindung für Sie.',
                ],
            },
            {
                header: 'Entwicklung',
                paragraphs: [
                    'Grundlage für unser Angebot ist die Entwicklung von stadtnavi der Stadt Herrenberg. Die Stadt Herrenberg hat diese Anwendung im Rahmen des Modellstadt-Projekts, gefördert durch das Bundesministerium für Verkehr und digitale Infrastruktur (BMVI), entwickelt. Es handelt sich hier um eine Open Source Lösung und kann von anderen Kommunen und Akteuren unter ihrem Namen und Erscheinungsbild verwendet und an individuelle Bedürfnisse angepasst und weiterentwickelt werden (White Label Lösung). Mitmachen ist gewünscht.',
                    'Stadtnavi basiert wiederum auf der Digitransit Platform und dem Backend-Dienst OpenTripPlanner. Alle Software ist unter einer offenen Lizenzen verfügbar.',
                    'Der gesamte Quellcode der Plattform, die aus vielen verschiedenen Komponenten besteht, ist auf <a href="https://github.com/stadtnavi/">Github</a> verfügbar.',
                    'Von unserer Seite ein herzliches Dankeschön an alle Beitragenden!'
                ],
            },
            {
                header: 'Datenquellen',
                paragraphs: [
                    'Kartendaten: © <a target=new href=https://www.openstreetmap.org/>OpenStreetMap Mitwirkende</a>',
                    'ÖPNV-Daten: Datensätze der <a target=new href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>NVBW GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) jeweils angereichert mit OpenStreetMap-Daten © OpenStreetMap Mitwirkende',
                    'Carsharing-Daten: Car-Sharing-Standorte bereitgestellt durch <a href="https://karlsruhe.stadtmobil.de/">stadtmobil Karlsruhe</a>',
                    'Mitfahrangebote: Mitfahrangebote für das Gebiet Baden-Württemberg werden bereitgestellt durch <a href="https://fahrgemeinschaft.de">Fahrgemeinschaft.de</a>. Sind Sie Anbieter einer Mitfahrplattform und möchten mit Ihrem Angebot ebenfalls in <b>VPE</b>mobi erscheinen? Dann nehmen Sie gerne Kontakt mit uns auf.',
                    'Alle Angaben ohne Gewähr.'
                ],
            },
        ],
        en: [
            {
                header: 'About this service',
                paragraphs: [
                    '<b>VPE</b>mobi is a travel planning application for the transport agency Pforzheim-Enzkreis and the surrounding area. This service initially includes information on public transport, footpaths, bicycle and car-based mobility. Further information will be added to the service as it expands further. The mobility offers are interconnected by intermodal routing. No matter whether you travel on foot, by bike or by car, <b>VPE</b>mobi will find the best connections for you.',
                ],
            },
            {
                header: 'Development',
                paragraphs: [
                    'The basis for this offer is the development of stadtnavi in the city of Herrenberg. The city of Herrenberg developed this application as part of the "Modellstadt" project, funded by the Federal Ministry of Transport and Digital Infrastructure (BMVI). This is an open source solution and can be used by other municipalities and stakeholders under their name and appearance and adapted and further developed to suit individual needs (white label solution). Participation is welcomed.',
                    'Stadtnavi is in turn based on the Digitransit Platform and the backend service OpenTripPlanner. All software is available under an open license.',
                    'The Digitransit service platform is an open source routing platform developed by HSL and Traficom. It builds on OpenTripPlanner by Conveyal. Enhancements by Transportkollektiv and MITFAHR|DE|ZENTRALE. All software is open source and available at <a href="https://github.com/stadtnavi/">GitHub</a>. Thanks to everybody working on this!',
                ],
            },
            {
                header: 'Data sources',
                paragraphs: [
                    'Map data: © <a target=new href=https://www.openstreetmap.org/>OpenStreetMap contributors</a>',
                    'Public transit data: Datasets by <a target=new href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>NVBW GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) enhanced with OpenStreetMap data © OpenStreetMap contributors',
                    'Carsharing data: carsharing locations are provided by <a href="https://karlsruhe.stadtmobil.de/">stadtmobil Karlsruhe</a>',
                    'Carpooling data: Carpooling offers for the area of Baden-Württemberg are provided by <a href="https://fahrgemeinschaft.de">Fahrgemeinschaft.de</a>.',
                    'No responsibility is accepted for the accuracy of this information.'
                ],
            },
        ],
    },

    availableTickets: { 'hbg' : {}},
    fareMapping: function mapHbFareId(fareId) {
        return {
            en: "Adult",
            de: "Regulär",
        };
    },
    
    geoJson: {
        layers: [],
    },
    staticMessagesUrl: STATIC_MESSAGE_URL,

    transportModes: {
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
    },

    // Additioal Map layers
    roadworks: {
        // No roadwork information for Pforzheim, so we disable
        show: false,
    },

    weatherStations: {
        // Pforzheim has non weather stations, so we disable
        show: false,
    },
    // /Additional Map layers

    // live bus locations
    vehicles: false,

    // Disclaimer shown if trip has a leg with mode=CARPOOL 
    carpoolDisclaimer: 'Der VPE stellt lediglich die Plattform zur Verfügung, auf der Personen Mitfahrangebote veröffentlichen können, um von möglichen Mitfahrer*innen kontaktiert zu werden. Der VPE ist weder an einer etwaigen Vereinbarung zwischen Fahrenden und Mitfahrenden beteiligt noch haftet er für deren Verhalten im Zusammenhang mit der Durchführung der Fahrt, den Zustand des eingesetzten Fahrzeugs oder das Zustandekommen der Fahrt.',

    welcomeMessage: {
        'de': {
            imageUrl: '/img/vpe-mitfahrportal.png',
            imageAltText: 'Mitfahrgelegenheit bieten und buchen - ab sofort über das Mitfahrportal des VPE!',
            linkUrl: 'https://startmobi.vpe.de/mitfahrportal/',       
        },
        'en': {
            imageUrl: '/img/vpe-mitfahrportal.png',
            imageAltText: 'Offer and book a ride - from now on via the VPE carpooling portal!',
            linkUrl: 'https://startmobi.vpe.de/mitfahrportal/',       
        }
    }
});
