/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'tampere';
const APP_TITLE = 'Nyssen reittiopas';
const APP_DESCRIPTION = 'Nyssen reittiopas';

const walttiConfig = require('./waltti').default;
const tampereTimetables = require('./timetableConfigUtils').default.tampere;

const minLat = 61.16;
const maxLat = 62.31;
const minLon = 22.68;
const maxLon = 24.9;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Nysse', href: 'http://www.nysse.fi/' },

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
  logo: 'tampere/tampere-logo.png',

  favicon: './sass/themes/tampere/favicon.png',

  feedIds: ['tampere', 'TampereVR'],

  geoJson: {
    layers: [
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/tre_zone_lines_20191028.geojson',
        isOffByDefault: true,
      },
    ],
    zones: {
      url: '/assets/geojson/tre_zone_areas_20191028.geojson',
    },
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
  },

  stopCard: {
    header: {
      showZone: true,
      virtualMonitorBaseUrl: 'https://tremonitori.digitransit.fi/stop/tampere:',
    },
  },

  showTicketInformation: true,

  useTicketIcons: true,

  ticketInformation: {
    primaryAgencyName: 'Tampereen seudun joukkoliikenne',
  },

  ticketLink: 'http://joukkoliikenne.tampere.fi/liput-ja-hinnat.html',

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
        href:
          'http://joukkoliikenne.tampere.fi/ohjeita-ja-tietoa/asiakaspalvelu/palaute.html',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
    ],
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tervetuloa reittioppaaseen! Tämän palvelun tarjoaa Tampereen seudun joukkoliikenne (Nysse) reittisuunnittelua varten Tampereen kaupunkiseudun alueella (Kangasala, Lempäälä, Nokia, Orivesi, Pirkkala, Tampere, Vesilahti ja Ylöjärvi). Palvelu perustuu Digitransit-palvelualustaan.',
        ],
        link:
          'http://joukkoliikenne.tampere.fi/ohjeita-ja-tietoa/digipalvelut/ohje-repa-reittiopas.html',
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
  showAllBusses: true,
  showVehiclesOnStopPage: true,
  timetables: {
    tampere: tampereTimetables,
  },

  // enable train routing for Tampere
  transportModes: {
    rail: {
      availableForSelection: true,
      defaultValue: true,
    },
  },

  // boarding a long distance train with bicycle costs extra
  modesWithNoBike: ['RAIL'],

  // Number of days to include to the service time range from the future (DT-3175)
  itineraryFutureDays: 60,
});
