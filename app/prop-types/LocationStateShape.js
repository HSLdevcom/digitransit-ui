import PropTypes from 'prop-types';

const StatusPropType = PropTypes.oneOf([
  'no-location',
  'searching-location',
  'prompt',
  'found-location',
  'found-address',
  'geolocation-denied',
  'geolocation-timeout',
  'geolocation-watch-timeout',
  'geolocation-not-supported',
  'reverse-geocoding-ready',
  'reverse-geocoding-in-progress',
]);

export default PropTypes.shape({
  type: PropTypes.string.isRequired,
  lat: PropTypes.number,
  lon: PropTypes.number,
  address: PropTypes.string,
  gid: PropTypes.string,
  name: PropTypes.string,
  layer: PropTypes.string,
  status: StatusPropType,
  hasLocation: PropTypes.bool,
  isLocationingInProgress: PropTypes.bool,
  isReverseGeocodingInProgress: PropTypes.bool,
  locationingFailed: PropTypes.bool,
});
