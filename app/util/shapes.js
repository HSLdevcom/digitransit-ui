/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';

export const dtLocationShape = PropTypes.shape({
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  address: PropTypes.string.isRequired,
});
