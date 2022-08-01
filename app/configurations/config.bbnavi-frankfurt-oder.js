import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';
import { MapMode } from '../constants';

const CONFIG = 'bbnavi-frankfurt-oder';
const APP_TITLE = 'bbnavi Frankfurt (Oder)';
const HEADER_TITLE = 'Frankfurt (Oder)';

export default configMerger(bbnaviConfig, {
  CONFIG,

  URL: {
    HEADER_TITLE,
  },

  map: {
    zoom: 16,
  },

  socialMedia: {
    title: APP_TITLE,
  },

  title: APP_TITLE,
  appBarTitle: HEADER_TITLE,

  searchParams: {
    'focus.point.lat': 52.3517,
    'focus.point.lon': 14.5515,
  },

  defaultEndpoint: {
    lat: 52.3517,
    lon: 14.5515,
  },

  defaultOrigins: [],

  // This overrides config.bbnavi.js' backgroundMaps[].
  backgroundMaps: [
    {
      mapMode: MapMode.OSM,
      messageId: 'map-type-openstreetmap',
      defaultMessage: 'OSM',
      previewImage: '/img/maptype-streets-osm.png',
    },
    {
      mapMode: MapMode.Default,
      messageId: 'map-type-streets',
      defaultMessage: 'Streets (LGB)',
      previewImage: '/img/maptype-streets-lgb.png',
    },
    {
      mapMode: MapMode.Satellite,
      messageId: 'map-type-satellite',
      defaultMessage: 'Satellite',
      previewImage: '/img/maptype-satellite.png',
    },
    {
      mapMode: MapMode.Bicycle,
      messageId: 'map-type-bicycle',
      defaultMessage: 'Bicycle',
      previewImage: '/img/maptype-bicycle.png',
    },
  ],
});
