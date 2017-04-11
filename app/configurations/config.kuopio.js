import configMerger from '../util/configMerger';

const CONFIG = 'kuopio';
const APP_TITLE = 'kuopio.digitransit.fi';
const APP_DESCRIPTION = 'Kuopion uusi reittiopas';

const walttiConfig = require('./waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Kuopio', href: 'http://joukkoliikenne.kuopio.fi/' },

  colors: {
    primary: '#0077C9',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  textLogo: false, // title text instead of logo img

  favicon: './sass/themes/kuopio/favicon.png',

  feedIds: ['Kuopio', 'KuopioEly'],

  searchParams: {
    'boundary.rect.min_lat': 62.454915,
    'boundary.rect.max_lat': 63.469325,
    'boundary.rect.min_lon': 26.163918,
    'boundary.rect.max_lon': 29.013261,
  },

  areaPolygon: [[26.163918, 62.454915],
                [26.163918, 63.469325],
                [29.013261, 63.469325],
                [29.013261, 62.454915]],

  defaultEndpoint: {
    address: 'Kuopion tori',
    lat: 62.892511,
    lon: 27.678136,
  },

  defaultOrigins: [
    { icon: 'icon-icon_bus', label: 'Linja-autoasema, Kuopio', lat: 62.898516, lon: 27.679409 },
    { icon: 'icon-icon_rail', label: 'Rautatieasema, Kuopio', lat: 62.896875, lon: 27.680523 },
    { icon: 'icon-icon_school', label: 'Itä-Suomen yliopisto, Kuopio', lat: 62.894982, lon: 27.640932 },
  ],

  footer: {
    content: [
      { label: (function () { return `© Kuopio ${(1900 + new Date().getYear())}`; }()) },
      {},
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: ['Tämän palvelun tarjoaa Kuopion seudun joukkoliikenne reittisuunnittelua varten Kuopion ja Siilinjärven alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.'],
      },
      {
        header: 'Tietolähteet',
        paragraphs: ['Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut perustuvat Kuopion tuottamaan GTFS-aineistoon.'],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: ['Den här tjänsten erbjuds av Kuopion seudun joukkoliikenne för reseplanering inom Kuopio och Siilinjärvi region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.'],
      },
      {
        header: 'Datakällor',
        paragraphs: ['Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller är baserad på GTFS data från Kuopio.'],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: ['This service is provided by Kuopion seudun joukkoliikenne for route planning in Kuopio and Siilinjärvi region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.'],
      },
      {
        header: 'Data sources',
        paragraphs: ['Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is retrieved from the Building and Dwelling Register of the Finnish Population Register Center. Public transport routes and timetables are based on GTFS data produced by Kuopio.'],
      },
    ],
  },
});
