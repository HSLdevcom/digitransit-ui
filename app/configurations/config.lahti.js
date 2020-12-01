/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'lahti';
const APP_TITLE = 'Uusi Reittiopas';
const APP_DESCRIPTION = 'Uusi Reittiopas - Lahti';

const walttiConfig = require('./config.waltti').default;

const minLat = 60.692506;
const maxLat = 61.790694;
const minLon = 24.873833;
const maxLon = 26.544819;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'LSL.fi', href: 'http://www.lsl.fi/' },
  colors: {
    primary: '#0066B3',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    twitter: {
      site: '@LSL_fi',
    },
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'lahti/lahti-logo.png',

  textLogo: false, // title text instead of logo img

  feedIds: ['Lahti'],

  mapLayers: {
    tooltip: {
      fi: 'Uutta! Saat nyt lähellä olevat bussit kartalle asetuksista.',
      en: 'New! You can now get nearby busses on the map from the settings.',
      sv:
        'Nytt! I inställningarna kan du nu välja att se närliggande bussar på kartan.',
    },
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
    address: 'Keskusta, Lahti',
    lat: 60.983552,
    lon: 25.656398,
  },

  defaultOrigins: [
    {
      icon: 'icon-icon_bus',
      label: 'Matkakeskus, Lahti',
      lat: 60.97705,
      lon: 25.658567,
    },
    {
      icon: 'icon-icon_bus',
      label: 'Kauppatori, Lahti',
      lat: 60.983595,
      lon: 25.656391,
    },
    {
      icon: 'icon-icon_bus',
      label: 'Päijät-Hämeen keskussairaala, Lahti',
      lat: 60.991045,
      lon: 25.567989,
    },
  ],

  footer: {
    content: [
      { label: `© Lahti ${walttiConfig.YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href:
          'https://e-asiointi.lahti.fi/eFeedback/fi/Feedback/29-Joukkoliikenne',
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

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tämän palvelun tarjoaa LSL joukkoliikenteen reittisuunnittelua varten Päijät-Hämeen alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut perustuvat Lahden omaan GTFS-aineistoon.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av LSL för reseplanering inom Lahti region trafiken. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
      {
        header: 'Datakällor',
        paragraphs: [
          'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller är baserad på GTFS data från Lahti.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'The Journey Planner shows you how to get to your destination fast and easy by public transport in Lahti region. You can also use the planner to find fast walking and cycling routes, and to an extent, for driving directions. The Journey Planner is provided by Lahti region transport and it is based on the Digitransit service platform.',
        ],
      },
      {
        header: 'Data sources',
        paragraphs: [
          'Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is retrieved from the Building and Dwelling Register of the Finnish Population Register Center. Public transport routes and timetables are based on GTFS data produced by Lahti.',
        ],
      },
    ],
  },
  geoJson: {
    layers: [
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/lahti_zone_lines_20201118.geojson',
      },
    ],
  },
  zoneIdMapping: {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E',
    6: 'F1',
    7: 'F2',
    8: 'G',
    9: 'H',
    10: 'I',
  },
  zoneIdFontSize: {
    F1: '20px',
    F2: '20px',
    'B/C': '16px',
  },
  stopCard: {
    header: {
      showZone: true,
    },
  },

  showAllBusses: true,
  showVehiclesOnStopPage: true,
});
