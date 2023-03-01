import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-staging';
const APP_TITLE = 'bbnavi Staging';
const HEADER_TITLE = 'Staging';
const API_URL = process.env.API_URL || 'https://staging.api.bbnavi.de';

export default configMerger(bbnaviConfig, {
  CONFIG,

  URL: {
    OTP: process.env.OTP_URL || `${API_URL}/otp/routers/default/`,
    STOP_MAP: `${API_URL}/otp/routers/default/vectorTiles/stops/`,
    PARK_AND_RIDE_MAP: `${API_URL}/otp/routers/default/vectorTiles/parking/`,
    ROADWORKS_MAP: `${API_URL}/map/v1/cifs/`,
    RENTAL_STATION_MAP: `${API_URL}/otp/routers/default/vectorTiles/citybikes/`,
    REALTIME_RENTAL_STATION_MAP: `${API_URL}/otp/routers/default/vectorTiles/citybikes/`,
  },

  socialMedia: {
    title: APP_TITLE,
  },

  title: APP_TITLE,
  appBarTitle: HEADER_TITLE,
});
