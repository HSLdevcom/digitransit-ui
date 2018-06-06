/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'rovaniemi';
const APP_TITLE = 'Rovaniemen reittiopas';
const APP_DESCRIPTION = 'Rovaniemen uusi reittiopas';

const walttiConfig = require('./waltti').default;

const minLat = 66.147037;
const maxLat = 67.180128;
const minLon = 24.634987;
const maxLon = 27.373531;

export default configMerger(walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Rovaniemi', href: 'http://www.rovaniemi.fi/' },

  colors: {
    primary: '#34B233',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  textLogo: false, // title text instead of logo img

  feedIds: ['Rovaniemi'],

  searchParams: {
    'boundary.rect.min_lat': minLat,
    'boundary.rect.max_lat': maxLat,
    'boundary.rect.min_lon': minLon,
    'boundary.rect.max_lon': maxLon,
  },

  areaPolygon: [[minLon, minLat], [minLon, maxLat], [maxLon, maxLat], [maxLon, minLat]],

  defaultEndpoint: {
    address: 'Rovaniemi',
    lat: 66.500855,
    lon: 25.723734,
  },

  defaultOrigins: [
    { icon: 'icon-icon_city', label: 'Ruokasenkatu Lyseonpuisto, Rovaniemi', lat: 66.500855, lon: 25.723734 },
    { icon: 'icon-icon_bus', label: 'Linja-autoasema, Rovaniemi', lat: 66.498714, lon: 25.714948 },
    { icon: 'icon-icon_rail', label: 'Rautatieasema, Rovaniemi', lat: 66.498427, lon: 25.7040986 },
  ],

  footer: {
    content: [
      { label: `© Rovaniemi ${walttiConfig.YEAR}` },
      {},
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: ['Tämän palvelun tarjoaa Rovaniemen kaupungin joukkoliikenne reittisuunnittelua varten Rovaniemi alueella. '],
      },

      {
        header: 'Digitransit palvelualusta',
        paragraphs: ['Palvelu perustuu Digitransit palvelualustaan, joka on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin reititystuote.'],
      },

      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut ladataan Rovaniemen kaupungin tuottamasta aineistosta.',
        ],
      },
    ],
  },

});
