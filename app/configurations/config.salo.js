/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'salo';
const APP_TITLE = 'Salon Reittiopas';
const APP_DESCRIPTION = 'Salon Uusi Reittiopas';

const walttiConfig = require('./config.waltti').default;

const minLat = 59.9988816059;
const maxLat = 60.5893601259;
const minLon = 22.7926810507;
const maxLon = 23.7990887884;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Salo', href: 'http://www.salo.fi/paikku' },

  colors: {
    primary: '#9fbf4e',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  textLogo: false,

  logo: 'salo/salo-logo.svg',

  feedIds: ['Salo'],

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
    address: 'Salo',
    lat: 60.387506389,
    lon: 23.120275278,
  },

  defaultOrigins: [
    {
      icon: 'icon-icon_bus',
      label: 'Salon linja-autoasema',
      lat: 60.387506389,
      lon: 23.120275278,
    },
    {
      icon: 'icon-icon_rail',
      label: 'Salon rautatieasema',
      lat: 60.385610623,
      lon: 23.120773770,
    }
  ],

  footer: {
    content: [
      { label: `© Salo ${walttiConfig.YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href: 'https://www.salo.fi/kaupunkijahallinto/osallistu/palaute/?sub=liikennepalvelut',
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
          'Tervetuloa reittioppaaseen! reittiopas kertoo, miten pääset nopeasti ja helposti perille joukkoliikenteellä Salon kaupungin alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit-palvelualustaan.'
        ],
      },
      {
        header: 'Digitransit-palvelualusta',
        paragraphs: [
          'Palvelu perustuu Digitransit-palvelualustaan, joka on HSL:n ja Traficomin kehittämä avoimen lähdekoodin reititystuote.',
        ],
      },
      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut ladataan Traficomin valtakunnallisesta joukkoliikenteen tietokannasta.'
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Den här tjänsten erbjuds av Salo för reseplanering inom Salo region. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is provided by Salo for route planning in Salo region. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
        ],
      },
    ],
  },
  zoneIdMapping: {
    1: 'A',
  },
  stopCard: {
    header: {
      showZone: true,
    },
  },
});