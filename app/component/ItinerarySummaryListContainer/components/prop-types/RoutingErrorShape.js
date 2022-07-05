import PropTypes from 'prop-types';
import { ROUTER_ERROR_CODES } from '../constants';

const RoutingErrorShape = PropTypes.shape({
  code: PropTypes.oneOf(ROUTER_ERROR_CODES),
  inputField: PropTypes.oneOf(['DATE_TIME', 'TO', 'FROM']),
});

export default RoutingErrorShape;
