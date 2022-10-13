import PropTypes from 'prop-types';

export default PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({ message: PropTypes.string }),
]);
