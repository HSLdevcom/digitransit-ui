/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'linjasto2021';
const APP_TITLE = 'Linjasto 2021';
const APP_DESCRIPTION = 'Linjasto 2021';

const walttiConfig = require('./config.waltti').default;
const tampereTimetables = require('./timetableConfigUtils').default.tampere;

const minLat = 61.16;
const maxLat = 62.31;
const minLon = 22.68;
const maxLon = 24.9;

const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const MAP_URL =
  process.env.MAP_URL || 'https://digitransit-dev-cdn-origin.azureedge.net';

export default configMerger(walttiConfig, {
  CONFIG,

  URL: {
    OTP:
      process.env.OTP_URL ||
      `${API_URL}/routing/v1/routers/linjasto2021-waltti/`,
    STOP_MAP: `${MAP_URL}/map/v1/linjasto2021-waltti-stop-map/`,
  },

  appBarLink: { name: 'Nysse', href: 'https://www.nysse.fi/' },

  colors: {
    primary: '#1c57cf',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  textLogo: false, // title text instead of logo img

  // Navbar logo
  logo: 'linjasto2021/linjasto2021-logo.png',

  favicon: './sass/themes/linjasto2021/favicon.png',

  feedIds: ['tampere', 'TampereVR', 'tampereDRT'],

  geoJson: {
    layers: [
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/tre_zone_lines_20202212.geojson',
        isOffByDefault: true,
      },
    ],
  },

  mapLayers: {
    tooltip: {
      fi:
        'Uutta! Saat nyt vyöhykkeet ja lähellä olevat bussit kartalle asetuksista.',
      en:
        'New! You can now get zones and nearby busses on the map from the settings.',
      sv:
        'Nytt! I inställningarna kan du nu välja att se zoner och närliggande bussar på kartan.',
    },
  },

  itinerary: {
    showZoneLimits: true,
    // Number of days to include to the service time range from the future (DT-3175)
    serviceTimeRange: 60,
  },

  stopCard: {
    header: {
      showZone: true,
      virtualMonitorBaseUrl: 'https://tremonitori.digitransit.fi/stop/',
    },
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

  defaultOrigins: [
    {
      icon: 'icon-icon_city',
      label: 'Keskustori, Tampere',
      lat: 61.4980944,
      lon: 23.7606972,
    },
    {
      icon: 'icon-icon_rail',
      label: 'Rautatieasema, Tampere',
      lat: 61.4984374,
      lon: 23.7730139,
    },
    {
      icon: 'icon-icon_bus',
      label: 'Linja-autoasema, Tampere',
      lat: 61.4937936,
      lon: 23.7696505,
    },
  ],

  footer: {
    content: [
      { label: `© Tampere ${walttiConfig.YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href: 'https://www.nysse.fi/palaute.html',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
      {
        name: 'accessibility-statement',
        nameEn: 'Accessibility statement',
        href:
          'https://kauppa.waltti.fi/media/authority/154/files/Saavutettavuusseloste_Waltti-reittiopas_JyQfJhC.htm',
      },
    ],
  },

  staticMessages: [
    {
      id: '4',
      priority: -1,
      shouldTrigger: true,
      persistence: 'repeat',
      content: {
        fi: [
          {
            type: 'a',
            content:
              'Tutustu turvallisen matkustamisen ohjeisiin koronaviruksen aikana tästä linkistä',
            href:
              'https://joukkoliikenne.tampere.fi/aikataulut-ja-reitit/poikkeusinfo/liikennetiedotteet/korona-viruksen-vaikutukset-nysse-liikenteeseen.html',
          },
        ],
        en: [
          {
            type: 'a',
            content: 'Please check instructions for safe travelling here',
            href:
              'https://joukkoliikenne.tampere.fi/aikataulut-ja-reitit/poikkeusinfo/liikennetiedotteet/korona-viruksen-vaikutukset-nysse-liikenteeseen.html',
          },
        ],
        sv: [
          {
            type: 'a',
            content: 'Please check instructions for safe travelling here',
            href:
              'https://joukkoliikenne.tampere.fi/aikataulut-ja-reitit/poikkeusinfo/liikennetiedotteet/korona-viruksen-vaikutukset-nysse-liikenteeseen.html',
          },
        ],
      },
    },
  ],

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
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut perustuvat Nyssen tuottamaan GTFS-aineistoon.',
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
  showAllBusses: false,
  showVehiclesOnStopPage: false,
  timetables: {
    tampere: tampereTimetables,
  },

  // enable train and tram routing for Tampere
  transportModes: {
    rail: {
      availableForSelection: true,
      defaultValue: true,
    },
    tram: {
      availableForSelection: true,
      defaultValue: true,
    },
  },

  // boarding a long distance train with bicycle costs extra
  modesWithNoBike: ['RAIL', 'TRAM'],
});
