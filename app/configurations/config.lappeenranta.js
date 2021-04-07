/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';
import { BIKEAVL_UNKNOWN } from '../util/citybikes';

const CONFIG = 'lappeenranta';
const APP_TITLE = 'reittiopas.lappeenranta.fi';
const APP_DESCRIPTION = '';

const walttiConfig = require('./config.waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Lappeenranta', href: 'http://www.lappeenranta.fi/' },

  colors: {
    primary: '#ea4097',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  textLogo: false, // title text instead of logo img

  logo: 'lappeenranta/logo.png',

  favicon: './app/configurations/images/lappeenranta/bussi_fin.jpeg',

  mapLayers: {
    tooltip: {
      fi: 'Uutta! Saat nyt lähellä olevat bussit kartalle asetuksista.',
      en: 'New! You can now get nearby busses on the map from the settings.',
      sv:
        'Nytt! I inställningarna kan du nu välja att se närliggande bussar på kartan.',
    },
  },

  cityBike: {
    showCityBikes: true,
    capacity: BIKEAVL_UNKNOWN,
    networks: {
      lappeenranta: {
        icon: 'citybike',
        name: {
          fi: 'Lappeenranta',
          sv: 'Vilmanstrand',
          en: 'Lappeenranta',
        },
        type: 'citybike',
        url: {
          fi: 'https://kaakau.fi/lappeenranta/',
          sv: 'https://kaakau.fi/lappeenranta/?lang=en',
          en: 'https://kaakau.fi/lappeenranta/?lang=sv',
        },
      },
    },
  },

  transportModes: {
    citybike: {
      availableForSelection: true,
    },
  },

  feedIds: ['Lappeenranta'],

  searchParams: {
    'boundary.rect.min_lat': 61.016901,
    'boundary.rect.max_lat': 61.102794,
    'boundary.rect.min_lon': 28.030938,
    'boundary.rect.max_lon': 28.329905,
  },

  areaPolygon: [
    [28.031, 61.017],
    [28.031, 61.1028],
    [28.33, 61.1028],
    [28.33, 61.017],
  ],

  defaultEndpoint: {
    address: 'Oleksin ja Koulukadun risteys',
    lat: 61.059097,
    lon: 28.18572,
  },

  defaultOrigins: [
    {
      icon: 'icon-icon_city',
      label: 'Oleksi/Koulukatu',
      lat: 61.059097,
      lon: 28.18572,
    },
    {
      icon: 'icon-icon_rail',
      label: 'Matkakeskus',
      lat: 61.0483,
      lon: 28.1945,
    },
    {
      icon: 'icon-icon_school',
      label: 'Lappeenrannan teknillinen yliopisto',
      lat: 61.065,
      lon: 28.0949,
    },
  ],

  showAllBusses: true,
  showVehiclesOnStopPage: true,

  footer: {
    content: [
      { label: `© Lappeenranta ${walttiConfig.YEAR}` },
      {},
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
          'Tämän palvelun tarjoaa Lappeenrannan kaupungin joukkoliikenne joukkoliikenteen reittisuunnittelua varten Lappeenrannan paikallisliikenteen alueella. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Lappeenrannan kaupungin joukkoliikenne för lokal reseplanering inom Lappeenranta region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Lappeenrannan kaupungin joukkoliikenne for local route planning in Lappenranta region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
  zoneIdMapping: {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
  },
  stopCard: {
    header: {
      showZone: true,
    },
  },
  geoJson: {
    layers: [
      {
        name: {
          fi: 'Pyöräilyreitit',
          sv: 'Cykelrutter',
          en: 'Bike routes',
        },
        url: 'https://ckan.saita.fi/geojson/pyorailyreitit_lpr.geojson',
        isOffByDefault: true,
      },
    ],
  },
});
