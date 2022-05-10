/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';
import { BIKEAVL_WITHMAX } from '../util/citybikes';

const CONFIG = 'tampere';
const APP_TITLE = 'Nyssen reittiopas';
const APP_DESCRIPTION = 'Nyssen reittiopas';

const walttiConfig = require('./config.waltti').default;
const tampereTimetables = require('./timetableConfigUtils').default.tampere;

const minLat = 61.16;
const maxLat = 62.31;
const minLon = 22.68;
const maxLon = 24.9;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Nysse', href: 'https://www.nysse.fi/' },

  colors: {
    primary: '#1c57cf',
    iconColors: {
      'mode-bus': '#1A4A8F',
      'mode-rail': '#0E7F3C',
      'mode-tram': '#DA2128',
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'tampere/tampere-logo.png',

  favicon: './sass/themes/tampere/favicon.png',

  feedIds: ['tampere', 'TampereVR', 'tampereDRT'],

  geoJson: {
    layers: [
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/tre_zone_lines_20210622.geojson',
        isOffByDefault: true,
      },
    ],
  },

  itinerary: {
    // Number of days to include to the service time range from the future (DT-3175)
    serviceTimeRange: 60,
  },

  itineraryFiltering: 2.5, // drops 40% worse routes

  stopCard: {
    header: {
      virtualMonitorBaseUrl: 'https://tremonitori.digitransit.fi/stop/',
    },
  },
  zones: {
    stops: true,
    itinerary: true,
  },
  showTicketInformation: true,

  useTicketIcons: true,

  ticketInformation: {
    primaryAgencyName: 'Tampereen seudun joukkoliikenne',
  },

  ticketLink: 'https://www.nysse.fi/liput-ja-hinnat.html',

  // mapping fareId from OTP fare identifiers to human readable form
  fareMapping: function mapFareId(fareId) {
    return fareId && fareId.substring
      ? fareId.substring(fareId.indexOf(':') + 1)
      : '';
  },

  searchParams: {
    'boundary.rect.min_lat': minLat,
    'boundary.rect.max_lat': maxLat,
    'boundary.rect.min_lon': minLon,
    'boundary.rect.max_lon': maxLon,
  },

  areaPolygon: [
    [minLon, minLat],
    [minLon, maxLat],
    [maxLon, maxLat],
    [maxLon, minLat],
  ],

  defaultEndpoint: {
    address: 'Keskustori, Tampere',
    lat: 61.4980944,
    lon: 23.7606972,
  },

  mainMenu: {
    stopMonitor: {
      show: true,
      url: 'https://tremonitori.digitransit.fi/createview',
    },
  },

  menu: {
    copyright: { label: `© Tampere ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'menu-feedback',
        href: {
          fi: 'https://www.nysse.fi/palaute.html',
          sv: 'https://www.nysse.fi/palaute.html',
          en: 'https://www.nysse.fi/en/feedback.html',
        },
      },
      {
        name: 'about-this-service',
        route: '/tietoja-palvelusta',
      },
      {
        name: 'accessibility-statement',
        href:
          'https://kauppa.waltti.fi/media/authority/154/files/Saavutettavuusseloste_Waltti-reittiopas_JyQfJhC.htm',
      },
    ],
  },

  staticMessages: [],

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tervetuloa reittioppaaseen! Tämän palvelun tarjoaa Tampereen seudun joukkoliikenne (Nysse) reittisuunnittelua varten Tampereen kaupunkiseudun alueella (Kangasala, Lempäälä, Nokia, Orivesi, Pirkkala, Tampere, Vesilahti ja Ylöjärvi). Palvelu perustuu Digitransit-palvelualustaan.',
        ],
        link: 'https://www.nysse.fi/reittiopas-ohje.html',
      },
      {
        header: 'Digitransit-palvelualusta',
        paragraphs: [
          'Digitransit-palvelualusta on HSL:n ja Traficomin kehittämä avoimen lähdekoodin reititystuote.',
        ],
      },
      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Digi- ja väestötietoviraston rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut perustuvat Nyssen tuottamaan GTFS-aineistoon.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Tampereen seudun joukkoliikenne (Nysse) för reseplanering inom Tampere region (Kangasala, Lempäälä, Nokia, Orivesi, Pirkkala, Tampere, Vesilahti ja Ylöjärvi). Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
      {
        header: 'Digitransit-plattformen',
        paragraphs: [
          'Digitransit-plattformen är en öppen programvara utvecklad av HRT och Traficom.',
        ],
      },
      {
        header: 'Datakällor',
        paragraphs: [
          'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller är baserad på GTFS data från Nysse.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Tampereen seudun Joukkoliikenne (Nysse) for route planning in Tampere region (Kangasala, Lempäälä, Nokia, Orivesi, Pirkkala, Tampere, Vesilahti ja Ylöjärvi). Service is built on Digitransit platform.',
        ],
      },
      {
        header: 'Digitransit platform',
        paragraphs: [
          'The Digitransit service platform is an open source routing platform developed by HSL and Traficom.',
        ],
      },
      {
        header: 'Data sources',
        paragraphs: [
          'Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is retrieved from the Building and Dwelling Register of the Finnish Population Register Center. Public transport routes and timetables are based on GTFS data produced by Nysse.',
        ],
      },
    ],
  },
  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnSummaryPage: true,
  timetables: {
    tampere: tampereTimetables,
  },

  cityBike: {
    networks: {
      seatcode_tampere: {
        capacity: BIKEAVL_WITHMAX,
        enabled: true,
        season: {
          // 15.4. - 31.10.
          start: new Date(new Date().getFullYear(), 3, 15),
          end: new Date(new Date().getFullYear(), 10, 1),
        },
        icon: 'citybike',
        name: {
          fi: 'Tampere',
          sv: 'Tammerfors',
          en: 'Tampere',
        },
        type: 'citybike',
        // Shown if citybike leg duration exceeds timeBeforeSurcharge
        durationInstructions: {
          fi: 'https://www.nysse.fi/kaupunkipyorat',
          sv: 'https://www.nysse.fi/en/city-bikes.html',
          en: 'https://www.nysse.fi/en/city-bikes.html',
        },
        timeBeforeSurcharge: 45 * 60,
      },
    },
    buyUrl: {
      fi: 'https://www.nysse.fi/kaupunkipyorat',
      sv: 'https://www.nysse.fi/en/city-bikes.html',
      en: 'https://www.nysse.fi/en/city-bikes.html',
    },
    buyInstructions: {
      fi: 'Osta käyttöoikeutta päiväksi, kuukaudeksi tai koko kaudeksi.',
      sv: 'Köp ett abonnemang för en dag, en månad eller en hel säsong.',
      en: 'Buy licenses for a day, a month or an entire season.',
    },
  },

  // enable train routing for Tampere
  transportModes: {
    rail: {
      availableForSelection: true,
      defaultValue: true,
    },
    tram: {
      availableForSelection: true,
      defaultValue: true,
    },
    citybike: {
      availableForSelection: true,
    },
  },

  // modes that should not coexist with BICYCLE mode
  // boarding a long distance train with bicycle costs extra
  modesWithNoBike: ['BICYCLE_RENT', 'WALK', 'RAIL'],

  showTenWeeksOnRouteSchedule: true,
});
