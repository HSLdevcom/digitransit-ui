/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';

export const dtLocationShape = PropTypes.shape({
  lat: PropTypes.number,
  lon: PropTypes.number,
  address: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
});
