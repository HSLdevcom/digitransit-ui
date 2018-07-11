/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'kouvola';
const APP_TITLE = 'Kouvolan reittiopas';
const APP_DESCRIPTION = 'Kouvolan reittiopas';

const walttiConfig = require('./waltti').default;

const minLat = 60.574886232976134;
const maxLat = 61.2909051236272;
const minLon = 26.230533247455586;
const maxLon = 27.424811201273982;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Kouvolan bussit', href: 'http://www.kouvolanbussit.fi' },

  colors: {
    primary: '#000000',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    twitter: {
      site: '@kouvolakaupunki',
    },
  },

  title: APP_TITLE,

  textLogo: false, // title text instead of logo img

  // Navbar logo
  logo: 'kouvola/logo.png',

  favicon: './app/configurations/images/kouvola/favicon.png',

  feedIds: ['Kouvola'],

  searchParams: {
    'boundary.rect.min_lat': minLat,
    'boundary.rect.max_lat': maxLat,
    'boundary.rect.min_lon': minLon,
    'boundary.rect.max_lon': maxLon,
  },

  areaPolygon: [[minLon, minLat], [minLon, maxLat], [maxLon, maxLat], [maxLon, minLat]],

  defaultEndpoint: {
    address: 'Matkakeskus, Kouvola',
    lat: 60.86625189966643,
    lon: 26.705328946745546,
  },

  defaultOrigins: [
    { icon: 'icon-icon_bus', label: 'Matkakeskus, Kouvola', lat: 60.86625189966643, lon: 26.705328946745546 },
  ],

  footer: {
    content: [
      { label: `© Kouvola ${walttiConfig.YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href: 'http://www.palautekouvola.fi',
        icon: 'icon-icon_speech-bubble',
      },
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tämän palvelun tarjoaa Kouvolan kaupungin joukkoliikenne reittisuunnittelua varten Kouvolan alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.'
        ],
      },
      {
        header: 'Digitransit-palvelualusta',
        paragraphs: [
          'Digitransit-palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin reititystuote.',
        ],
      },
      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut perustuvat Kouvolan tuottamaan GTFS-aineistoon.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Kouvola för reseplanering inom Kouvola region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.'
        ],
      },
      {
        header: 'Digitransit-plattformen',
        paragraphs: [
          'Digitransit-plattformen är en öppen programvara utvecklad av HRT och Trafikverket.',
        ],
      },
      {
        header: 'Datakällor',
        paragraphs: [
          'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller är baserad på Kouvolas GTFS data.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Kouvola city for local route planning in Kouvola region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.'
        ],
      },
      {
        header: 'Digitransit platform',
        paragraphs: [
          'The Digitransit service platform is an open source routing platform developed by HSL and The Finnish Transport Agency.',
        ],
      },
      {
        header: 'Data sources',
        paragraphs: [
          'Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is retrieved from the Building and Dwelling Register of the Finnish Population Register Center. Public transport routes and timetables are based on GTFS data produced by Kouvola city.',
        ],
      },
    ],
  },

});
