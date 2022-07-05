import PropTypes from 'prop-types';

const RoutingErrorShape = PropTypes.shape({
  code: PropTypes.string.isRequired,
  inputField: PropTypes.string,
});

export default RoutingErrorShape;
