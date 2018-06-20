import configMerger from '../util/configMerger';

const CONFIG = 'jyvaskyla';
const APP_TITLE = 'Reittiopas Jyväskylä';
const APP_DESCRIPTION = 'Jyväskylän uusi reittiopas';

const walttiConfig = require('./waltti').default;

const minLat = 61.835318;
const maxLat = 62.603473;
const minLon = 25.230388;
const maxLon = 26.358237;

export default configMerger(walttiConfig, {
  CONFIG,

  feedIds: ['KeskiSuomenEly', 'LINKKI'],

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
    address: 'Jyväskylän paikallisliikenneterminaali',
    lat: 62.241015674,
    lon: 25.7485345616,
  },

  defaultOrigins: [
    {
      icon: 'icon-icon_bus',
      label: 'Paikallisliikenneterminaali, Jyväskylä',
      lat: 62.2410157,
      lon: 25.7485346,
    },
    {
      icon: 'icon-icon_bus',
      label: 'Kauppatori, Jyväskylä',
      lat: 62.244958,
      lon: 25.746471,
    },
    {
      icon: 'icon-icon_bus',
      label: 'Keski-Suomen keskussairaala, Jyväskylä',
      lat: 62.229935,
      lon: 25.710604,
    },
  ],

  appBarLink: {
    name: 'Jyväskylän seudun joukkoliikenne',
    href: 'http://linkki.jyvaskyla.fi/',
  },

  colors: {
    primary: '#7DC02D',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  textLogo: false,

  footer: {
    content: [
      { label: `© Jyvaskyla ${walttiConfig.YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href: 'https://s-asiointi.jkl.fi/eFeedback/fi/Feedback/38',
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
          'Tämän palvelun tarjoaa Jyväskylän seudun joukkoliikenne reittisuunnittelua varten Jyväskylän, Laukaan ja Muuramen alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.',
          'Pysäkkiajat palvelussa ovat aina arvioita lukuun ottamatta linjojen lähtö- ja päätepysäkkejä sekä eräitä kiinteäaikaisia välipysäkkejä. Ruuhkattomaan aikaan auto voi edetä pysäkille ehdotettua aikaa nopeammin ja ruuhka-aikoina myöhemmin. Pysäkillä kannattaa kyydin varmistamiseksi olla aina riittävän ajoissa.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Jyväskylän seudun joukkoliikenne för reseplanering inom Jyväskylä, Laukaa och Muurame region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Jyväskylän seudun joukkoliikenne for route planning in Jyväskylä, Laukaa and Muurame region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
});
