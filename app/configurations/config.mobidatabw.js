/* eslint-disable */
import configMerger from '../util/configMerger';
import { MapMode } from '../constants';

const CONFIG = 'mobidatabw';
const APP_TITLE = 'stadtnavi mobidatabw';
const APP_DESCRIPTION = 'Gemeinsam Mobilität neu denken - die intermodale Verbindungssuche mit offenen, lokalen Daten';
const API_URL = process.env.API_URL || 'https://otp.mobidata-bw.de';
const OTP_URL = process.env.OTP_URL || `${API_URL}/otp/routers/default/`;
const MAP_URL = process.env.MAP_URL || 'https://tiles.mobidata-bw.de/styles/streets/{z}/{x}/{y}{r}.png';
const BIKE_MAP_URL = process.env.BIKE_MAP_URL ||'https://tiles.mobidata-bw.de/styles/bicycle/{z}/{x}/{y}{r}.png';
const SEMI_TRANSPARENT_MAP_URL = process.env.SEMITRANSPARENT_MAP_URL || "https://tiles.mobidata-bw.de/styles/satellite-overlay/{z}/{x}/{y}{r}.png";
const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || "https://geocoding.mobidata-bw.de/pelias/v1";
const STATIC_MESSAGE_URL =
    process.env.STATIC_MESSAGE_URL ;

const MOBIDATA_BASE_URL = "https://dev-ipl.mobidata-bw.de/";

const parentConfig = require('./config.stadtnavi.js').default;

const hostname = new URL(API_URL);

const minLat = 47.5;
const maxLat = 49.8;
const minLon = 7.5;
const maxLon = 10.5;

export default configMerger(parentConfig, {
    CONFIG,

    URL: {
        OTP: OTP_URL,
        MAP: {
            default: MAP_URL,
            satellite: 'https://tiles.stadtnavi.eu/orthophoto/{z}/{x}/{y}.jpg',
            semiTransparent: SEMI_TRANSPARENT_MAP_URL,
            bicycle: BIKE_MAP_URL
        },
        STOP_MAP: `${OTP_URL}vectorTiles/stops/`,
        PARK_AND_RIDE_MAP: `${OTP_URL}vectorTiles/parking/`,
        ROADWORKS_MAP: `${MOBIDATA_BASE_URL}geoserver/gwc/service/tms/1.0.0/MobiData-BW:roadworks@EPSG:900913@pbf/{z}/{x}/{-y}.pbf`,
        RENTAL_STATION_MAP: `${OTP_URL}vectorTiles/rentalStations/`,
        RENTAL_VEHICLE_MAP: `${OTP_URL}vectorTiles/rentalVehicles/`,
        REALTIME_RENTAL_STATION_MAP: `${OTP_URL}vectorTiles/realtimeRentalStations/`,
        // TODO WEATHER_STATIONS_MAP: `${API_URL}/map/v1/weather-stations/`,
        CHARGING_STATIONS_MAP: `https://api.mobidata-bw.de/ocpdb/tiles/{z}/{x}/{y}.mvt`,
        CHARGING_STATION_DETAILS_API: 'https://api.mobidata-bw.de/ocpdb/api/public/v1/locations/',
        // use mobidata specific geocoder
        PELIAS: `${process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL}/search`,
        PELIAS_REVERSE_GEOCODER: `${
            process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
        }/reverse`,
        PELIAS_PLACE: `${
            process.env.GEOCODING_BASE_URL || GEOCODING_BASE_URL
        }/place`,
    },

    map: {
        // allow zoom out to level 7, which shows bawü and large region around
        minZoom: 7,
        // initially, zoom to mostly BW
        zoom: 8,
        attribution: {
            'default': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a>, <a tabindex=-1 href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>Datensätze der NVBW GmbH</a>',
            'satellite': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a>, © <a tabindex=-1 href="https://www.lgl-bw.de/">LGL BW</a>, <a tabindex=-1 href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>Datensätze der NVBW GmbH</a>',
            'bicycle': '© <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap Mitwirkende</a>, © <a tabindex=-1 href=https://www.cyclosm.org/#map=12/52.3728/4.8936/cyclosmx>CyclOSM</a>, © <a tabindex=-1 href="https://www.openstreetmap.fr/">OSM-FR</a>, <a tabindex=-1 href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>Datensätze der NVBW GmbH</a>',
        },
    },

    colors: {
        primary: '#0c79bc',
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

    sprites: 'assets/svg-sprite.mobidatabw.svg',

    socialMedia: {
        title: APP_TITLE,
        description: APP_DESCRIPTION,

        image: {
            url: '/img/mobidatabw-social-media-card.png',
            width: 1000,
            height: 563,
        },

        twitter: {
            card: 'summary_large_image',
            site: '@NVBWOpenData',
        },
    },
    
    issueTrackerUrl: 'https://maengelmelder.service-bw.de/?lat=${lat}&lng=${lon}',
    // issueTrackerUrls define issuetracker URLs per postalCode. In case none matches, issueTrackerUrl is used as falllback
    issueTrackerUrls: {
    },

    title: APP_TITLE,

    favicon: './app/configurations/images/mobidatabw/favicon.png',

    meta: {
        description: APP_DESCRIPTION,
    },

    logo: 'mobidatabw/mobidatabw_logo.png',

    feedIds: ['mi'],

    searchSources: ['oa', 'osm'],

    searchParams: {
        'boundary.rect.min_lat': 46.8,
        'boundary.rect.max_lat': 50.5,
        'boundary.rect.min_lon': 6.9,
        'boundary.rect.max_lon': 11.7,
        'focus.point.lat': 48.7710755,
        'focus.point.lon': 9.177739
    },

    areaPolygon: [
        [minLon, minLat],
        [minLon, maxLat],
        [maxLon, maxLat],
        [maxLon, minLat],
    ],

    defaultEndpoint: {
        lat: 48.7710755, 
        lon: 9.177739,
    },

    menu: {
        copyright: {
            label: `© MobiData BW ${parentConfig.YEAR}`
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
                href: 'https://www.nvbw.de/impressum',
            },
            {
                name: 'privacy',
                nameEn: 'Privacy',
                href: 'https://www.mobidata-bw.de/pages/datenschutz',
            },
        ],
    },

    aboutThisService: {
        de: [
            {
                header: 'Über diesen Dienst',
                paragraphs: [
                    'stadtnavi MobiData BW ist eine Reiseplanungs-Anwendung für Baden-Württemeberg und Umgebung. Dieser Dienst umfasst ÖPNV, Fußwege, Radverkehr, Straßen- und Parkplatzinformationen, Ladeinfrastruktur und Sharing-Angebote. Mobilitätsangebote werden durch intermodales Routing miteinander vernetzt.',
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
                    'ÖPNV-Daten: Datensätze der <a target=new href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>NVBW GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) jeweils angereichert mit OpenStreetMap-Daten © OpenStreetMap Mitwirkende',
                    'Alle Angaben ohne Gewähr.'
                ],
            },
        ],
        en: [
            {
                header: 'About this service',
                paragraphs: [
                    'stadtnavi is a travel planning application for Baden-Wurttemberg and its surroundings. This service includes public transport, footpaths, cycling, street and parking information, charging infrastructure and sharing offerings. The mobility offerings are connected through intermodal routing.',
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
                    'Public transit data: Datasets by <a target=new href=https://www.nvbw.de/aufgaben/digitale-mobilitaet/open-data/>NVBW GmbH</a>, Shapes (d.h. Geometrien der Streckenverläufe) enhanced with OpenStreetMap data © OpenStreetMap contributors',
                    'No responsibility is accepted for the accuracy of this information.'
                ],
            },
        ],
    },


    roadworks: {
        show: true,
    },
    weatherStations: {
        show: false,
    },
     
    geoJson: {
        layers: [
            {
                name: {
                  fi: '',
                  en: 'Covered region',
                  de: 'Auskunft',
                },
                url: '/assets/geojson/mobidatabw_service_area.json',
                icon: 'icon-icon_open_carpark',
                isOffByDefault: false,
                minZoom: 1,
                alwaysOn: true,
            },
            {
                name: {
                  fi: '',
                  en: 'Bicycle Service Stations',
                  de: 'Radservice-Punkte',
                },
                url: 'https://data.mfdz.de/mobidata-bw/routing/dt_radservice_punkte.json',
                category: 'bicycle',
                icon: 'icon-icon_bike_repair',
                isOffByDefault: false,
                minZoom: 10
            },
            // Bicycle network layer
            {
                name: {
                  fi: '',
                  en: "Bicycle network",
                  de: 'Radnetz',
                },
                category: 'bicycle',
                url: 'https://api.mobidata-bw.de/geoserver/MobiData-BW/wms',
                icon: 'icon-icon_radnetz',
                isOffByDefault: false,
                minZoom: 12,
                type: 'wmst',
                layers: 'MobiData-BW:radvis_cycle_network',
                attribution: 'RadNETZ-BW',
            },
        ],
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

    parkAndRideBannedVehicleParkingTags: [
        'lot_type:Parkplatz',
        'lot_type:Tiefgarage',
        'lot_type:Parkhaus'
    ],

    // don't show vehicle positions
    vehicles: false,
    // TODO: instead of cityBike this should be renamend to vehicleSharing.
    // and layer settings and operator/network settings should be separated
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

          bird: {
            icon: "brand_bird",
            name: {
              de: "bird"
            },
            colors: {
              background: '#00D4F1'
            },
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
           callabike: {
             icon: "brand_callabike",
             name: {
               de: "Call-a-Bike"
             },
             colors: {
               background: '#E30009'
             },
            },
            lime: {
            icon: "brand_lime",
            name: {
              de: "Lime"
            },
            colors: {
               background: '#00DD00'
            }
           },
           nextbike: {
             icon: "brand_nextbike",
             name: {
               de: "nextbike"
             },
             colors: {
               background: '#69D2AA',
               foreground: '#0E1A50'
             },
           },
           tier: {
             icon: "brand_tier",
             name: {
               de: "TIER"
             },
             colors: {
               background: '#0E1A50',
               foreground: '#69D2AA'
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
           
            donkey: {
             icon: "brand_donkey",
             name: {
               de: "Donkey Republic"
             },
             colors: {
               background: '#F47521'
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
            nextbike: {
             icon: "brand_nextbike",
             name: {
               de: "nextbike by TIER",
               en: "nextbike by TIER"
             },
             colors: {
               background: '#004A99'
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
           'mobidata-bw-taxi': {
             icon: "brand_taxi",
             operator: "taxi",
             name: {
               de: "Taxi"
             },
             type: "taxi",
             capacity: "No availability",
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
           lastenvelo_fr: {
             icon: "brand_frelo_freiburg",
             operator: "frelo_freiburg",
             name: {
               de: "LastenVelo Freiburg"
             },
             type: "cargo_bicycle",
             form_factors: ['cargo_bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.lastenvelofreiburg.de/"
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
           stadtmobil_suedbaden: {
             icon: "brand_stadtmobil_suedbaden",
             operator: "stadtmobil_suedbaden",
             name: {
               de: "Stadtmobil Südbaden"
             },
             type: "car",
             form_factors: ['car'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.stadtmobil-suedbaden.de/"
             }
           },
           "my-e-car": {
             icon: "brand_my-e-car",
             operator: "my-e-car",
             name: {
               de: "my-e-car"
             },
             type: "cargo_bicycle",
             form_factors: ['cargo_bicycle', 'car'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.my-e-car.de/"
             }
           },
           regiorad_stuttgart: {
             icon: "brand_regiorad",
             operator: "regiorad",
             name: {
               de: "RegioRad Stuttgart"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.regioradstuttgart.de"
             }
           },
           callabike: {
             icon: "brand_callabike",
             operator: "callabike",
             name: {
               de: "Call a Bike"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.callabike.de"
             }
           },
           callabike_ice: {
             icon: "brand_callabike",
             operator: "callabike",
             name: {
               de: "Call a Bike"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.callabike.de"
             }
           },
           nextbike_df: {
             icon: "brand_frelo_freiburg",
             operator: "nextbike",
             name: {
               de: "Frelo Freiburg"
             },
             type: "cargo_bicycle",
             form_factors: ['cargo_bicycle', 'bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.frelo-freiburg.de/de/"
             }
           },
           nextbike_fg: {
             icon: "brand_nextbike",
             operator: "nextbike",
             name: {
               de: "KVV.nextbike"
             },
             type: "cargo_bicycle",
             form_factors: ['cargo_bicycle', 'bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.kvv-nextbike.de/de/"
             }
           },
           nextbike_ds: {
             icon: "brand_sap_walldorf",
             operator: "nextbike",
             name: {
               de: "SAP Walldorf"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.nextbike.de/de/sapwalldorf/"
             }
           },
           nextbike_vn: {
             icon: "brand_nextbike",
             operator: "nextbike",
             name: {
               de: "VRNnextbike"
             },
             type: "cargo_bicycle",
             form_factors: ['cargo_bicycle', 'bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.vrnnextbike.de/de/"
             }
           },
           nextbike_eh: {
             icon: "brand_nextbike",
             operator: "nextbike",
             name: {
               de: "EinfachMobil"
             },
             type: "cargo_bicycle",
             form_factors: ['cargo_bicycle', 'bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.nextbike.de/einfachmobil/"
             }
           },
           bolt_karlsruhe: {
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
           roxy_freiburg: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "Freiburg"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           yoio_freiburg: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "Freiburg"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           zeus_freiburg: {
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
           zeus_heidelberg: {
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
           zeus_konstanz: {
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
           zeus_schwabisch_gmund: {
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
           zeus_villingen_schwenningen: {
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
           zeus_hemmingen: {
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
           zeus_renningen_malmsheim: {
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
           zeus_goppingen: {
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
           tier_stuttgart: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier STUTTGART"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           "tier_mannheim-ludwigshafen": {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier MANNHEIM-LUDWIGSHAFEN"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           tier_friedrichshafen: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier FRIEDRICHSHAFEN"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           tier_rastatt: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier RASTATT"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true
           },
           tier_boeblingen: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier BOEBLINGEN"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           tier_tubingen: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier TUBINGEN"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           tier_sindelfingen: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier SINDELFINGEN"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           tier_ludwigsburg: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier LUDWIGSBURG"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           tier_reutlingen: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier REUTLINGEN"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           tier_heilbronn: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier HEILBRONN"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           tier_karlsruhe: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier KARLSRUHE"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           tier_heidelberg: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier HEIDELBERG"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           "bird-basel": {
             icon: "brand_bird",
             operator: "bird",
             name: {
               de: "bird basel"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           "bird-biel": {
             icon: "brand_bird",
             operator: "bird",
             name: {
               de: "bird biel"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           "bird-bulle": {
             icon: "brand_bird",
             operator: "bird",
             name: {
               de: "bird bulle"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           "bird-kloten": {
             icon: "brand_bird",
             operator: "bird",
             name: {
               de: "bird kloten"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           "bird-uster": {
             icon: "brand_bird",
             operator: "bird",
             name: {
               de: "bird uster"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           "bird-winterthur": {
             icon: "brand_bird",
             operator: "bird",
             name: {
               de: "bird winterthur"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           "bird-zurich": {
             icon: "brand_bird",
             operator: "bird",
             name: {
               de: "bird zurich"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           bolt_basel: {
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
           bolt_winterthur: {
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
           bolt_zurich: {
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
           donkey_ge: {
             icon: "brand_donkey",
             operator: "donkey",
             name: {
               de: "Donkey Republic Geneva"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.donkey.bike/cities/bike-rental-geneva/"
             }
           },
           donkey_kreuzlingen: {
             icon: "brand_donkey",
             operator: "donkey",
             name: {
               de: "Donkey Republic Kreuzlingen"
             },
             type: "cargo_bicycle",
             form_factors: ['cargo_bicycle', 'bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.donkey.bike/cities/bike-rental-kreuzlingen/"
             }
           },
           donkey_neuchatel: {
             icon: "brand_donkey",
             operator: "donkey",
             name: {
               de: "Donkey Republic Neuchâtel"
             },
             type: "other",
             form_factors: ['other', 'bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.donkey.bike/cities/bike-rental-neuchatel/"
             }
           },
           donkey_sion: {
             icon: "brand_donkey",
             operator: "donkey",
             name: {
               de: "Donkey Republic Sion"
             },
             type: "other",
             form_factors: ['other', 'bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.donkey.bike/cities/bike-rental-sion/"
             }
           },
           donkey_thun: {
             icon: "brand_donkey",
             operator: "donkey",
             name: {
               de: "Donkey Republic Thun"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.donkey.bike/cities/bike-rental-thun/"
             }
           },
           "donkey_yverdon-les-bains": {
             icon: "brand_donkey",
             operator: "donkey",
             name: {
               de: "Donkey Republic Yverdon-les-Bains"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.donkey.bike/cities/bike-rental-yverdon-les-bains/"
             }
           },
           lime_basel: {
             icon: "brand_lime",
             operator: "lime",
             name: {
               de: "Lime City partners from Partners::RegionFeedMediator"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           lime_opfikon: {
             icon: "brand_lime",
             operator: "lime",
             name: {
               de: "Lime Opfikon"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           lime_uster: {
             icon: "brand_lime",
             operator: "lime",
             name: {
               de: "Lime City partners from Partners::RegionFeedMediator"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           lime_zug: {
             icon: "brand_lime",
             operator: "lime",
             name: {
               de: "Lime Zug"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           lime_zurich: {
             icon: "brand_lime",
             operator: "lime",
             name: {
               de: "Lime City partners from Partners::RegionFeedMediator"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           nextbike_ch: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "nextbike Switzerland"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.nextbike.ch/"
             }
           },
           publibike_ch: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "PubliBike"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://publibike.ch"
             }
           },
           velospot_ch: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "Velospot"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://velospot.info/customer/public"
             }
           },
           pickebike_aubonne: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "Aubonne"
             },
             type: "moped",
             form_factors: ['moped', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           pickebike_basel: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "Basel"
             },
             type: "moped",
             form_factors: ['moped', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           pickebike_fribourg: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "Fribourg"
             },
             type: "moped",
             form_factors: ['moped', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           share_birrer_ch: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "Share Birrer AG"
             },
             type: "car",
             form_factors: ['car'],
             hideCode: true,
             enabled: true
           },
           tier_basel: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier BASEL"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           tier_bern: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier BERN"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           tier_rotkreuz: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier ROTKREUZ"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true
           },
           tier_stgallen: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier STGALLEN"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           tier_winterthur: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier WINTERTHUR"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           tier_zurich: {
             icon: "brand_tier",
             operator: "tier",
             name: {
               de: "Tier ZURICH"
             },
             type: "scooter",
             form_factors: ['scooter'],
             hideCode: true,
             enabled: true
           },
           voi_ch: {
             icon: "brand_voi",
             operator: "voi",
             name: {
               de: "Voi Technology AB"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.voiscooters.com/"
             }
           },
           liemobil_liechtenstein: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "Liechtenstein"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true
           },
           zem_ch: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "2EM Car Sharing"
             },
             type: "car",
             form_factors: ['car'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.2em.ch"
             }
           },
           edrivecarsharing_ch: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "edrive carsharing AG"
             },
             type: "car",
             form_factors: ['car'],
             hideCode: true,
             enabled: true
           },
           carvelo2go_ch: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "carvelo eCargo-Bike Sharing"
             },
             type: "cargo_bicycle",
             form_factors: ['cargo_bicycle', 'car', 'bicycle'],
             hideCode: true,
             enabled: true,
             url: {
               de: "https://www.carvelo.ch"
             }
           },
           "bird-chalonsenchampagne": {
             icon: "brand_bird",
             operator: "bird",
             name: {
               de: "bird chalonsenchampagne"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           "bird-sarreguemines": {
             icon: "brand_bird",
             operator: "bird",
             name: {
               de: "bird sarreguemines"
             },
             type: "scooter",
             form_factors: ['scooter', 'bicycle'],
             hideCode: true,
             enabled: true
           },
           mulhouse: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "VéloCité"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true
           },
           nancy: {
             icon: "brand_other",
             operator: "other",
             name: {
               de: "vélOstan'lib"
             },
             type: "citybike",
             form_factors: ['bicycle'],
             hideCode: true,
             enabled: true
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
         }
     }
 }
);
