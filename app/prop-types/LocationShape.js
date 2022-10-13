import PropTypes from 'prop-types';

const LocationShape = PropTypes.shape({
  lat: PropTypes.number,
  lon: PropTypes.number,
  address: PropTypes.string,
});

export default LocationShape;
