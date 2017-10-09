/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'mikkeli';
const APP_TITLE = 'Mikkelin Reittiopas';
const APP_DESCRIPTION = 'Mikkelin julkisen liikenteen reittiopas';

const walttiConfig = require('./waltti').default;

const minLat = 61.659220;
const maxLat = 61.717372;
const minLon = 27.155849;
const maxLon = 27.384367;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Mikkelin joukkoliikenne', href: 'https://mikkeli.kunta-api.fi/sisalto/palvelut/joukkoliikenne-2' },

  colors: {
    primary: '#52B9E9',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    twitter: {
      site: '@MikkelinK',
    },

  },

  title: APP_TITLE,

  textLogo: true, // title text instead of logo img

  feedIds: ['Mikkeli'],

  searchParams: {
    'boundary.rect.min_lat': minLat,
    'boundary.rect.max_lat': maxLat,
    'boundary.rect.min_lon': minLon,
    'boundary.rect.max_lon': maxLon,
  },

  areaPolygon: [[minLon, minLat], [minLon, maxLat], [maxLon, maxLat], [maxLon, minLat]],

  defaultEndpoint: {
    address: 'Hallitustori',
    lat: 61.687904,
    lon: 27.273215,
  },

  defaultOrigins: [
    { icon: 'icon-icon_city', label: 'Hallitustori', lat: 61.687904, lon: 27.273215 },
    { icon: 'icon-icon_bus', label: 'Matkakeskus Mikkeli', lat: 61.686905, lon: 27.276961 },
    { icon: 'icon-icon_city', label: 'Ristiina', lat: 61.506483, lon: 27.257635 },
  ],

  footer: {
    content: [
      { label: `© Mikkeli ${walttiConfig.YEAR}` },
      {},
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: ['Tämän palvelun tarjoaa Mikkelin kaupunki reittisuunnittelua varten Mikkelin alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.'],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: ['Den här tjänsten erbjuds av Mikkeli för reseplanering inom Mikkeli region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.'],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: ['This service is provided by Mikkeli city for route planning in Mikkeli region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.'],
      },
    ],
  },

});
