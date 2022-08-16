import PropTypes from 'prop-types';
import { PlannerMessageType } from '../constants';

const ROUTER_ERROR_CODES = Object.values(PlannerMessageType);

const RoutingErrorShape = PropTypes.shape({
  code: PropTypes.oneOf(ROUTER_ERROR_CODES),
  inputField: PropTypes.oneOf(['DATE_TIME', 'TO', 'FROM']),
});

export default RoutingErrorShape;
