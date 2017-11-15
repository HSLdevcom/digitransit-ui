/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';

export const dtLocationShape = PropTypes.oneOfType([
  PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    address: PropTypes.string.isRequired,
    ready: PropTypes.boolean,
  }),
  PropTypes.shape({
    gps: PropTypes.boolean,
    ready: PropTypes.boolean,
  }),
]);
