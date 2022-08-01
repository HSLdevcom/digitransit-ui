import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-mitfahrenbb';
const APP_TITLE = 'mitfahrenBB';
const HEADER_TITLE = 'mitfahrenBB';
const MATOMO_URL = 'https://nutzung.bbnavi.de/js/container_MlnEbkiT.js';

// Brandenburg bounding box
const minLat = 51.36066;
const maxLat = 53.55795;
const minLon = 11.26817;
const maxLon = 14.76471;

export default configMerger(bbnaviConfig, {
  CONFIG,

  URL: {
    HEADER_TITLE,
  },

  map: {
    zoom: 9,
    minZoom: 9,
  },

  // todo:
  // - Logo wird noch von der #DABB geliefert, erstmal kann bbnavi-Logo stehenbleiben

  socialMedia: {
    title: APP_TITLE,
  },

  title: APP_TITLE,
  appBarTitle: HEADER_TITLE,

  searchPanelText: 'This is special!',

  // todo
  // logo: 'bbnavi/mitfahrenbb-logo.svg',
  // logoSmall: 'bbnavi/mitfahrenbb-logo-red.svg',

  searchParams: {
    'boundary.rect.min_lat': minLat,
    'boundary.rect.max_lat': maxLat,
    'boundary.rect.min_lon': minLon,
    'boundary.rect.max_lon': maxLon,
    'focus.point.lat': 52.5,
    'focus.point.lon': 13.3,
  },

  defaultEndpoint: {
    lat: 52.4,
    lon: 13.3,
  },

  // todo:
  // - Kartenmenü: Nur ÖPNV, Auto und Mitfahrangebote verfügbar

  transportModes: {
    citybike: {
      availableForSelection: false,
      defaultValue: false,
    },
  },

  streetModes: {
    bicycle: {
      availableForSelection: false,
      defaultValue: false,
    },
  },

  MATOMO_URL,
});
