import { PropTypes } from 'prop-types';
import { PlannerMessageType } from '../constants';

const PlannerMessagePropType = PropTypes.oneOf(
  Object.values(PlannerMessageType),
);
export default PlannerMessagePropType;
