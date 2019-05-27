import PropTypes from 'prop-types';
import React from 'react';
import IconWithIcon from './IconWithIcon';
import ComponentUsageExample from './ComponentUsageExample';
import { AlertSeverityLevelType } from '../constants';

const IconWithBigCaution = ({ alertSeverityLevel, className, color, img }) => {
  const iconType =
    alertSeverityLevel === AlertSeverityLevelType.Info ? 'info' : 'caution';
  return (
    <IconWithIcon
      className={className}
      color={color}
      img={img}
      subIcon={`icon-icon_${iconType}`}
      subIconClassName={`subicon-${iconType}`}
      subIconShape={(iconType === 'info' && 'circle') || undefined}
    />
  );
};

IconWithBigCaution.displayName = 'IconWithBigCaution';

IconWithBigCaution.description = () => (
  <ComponentUsageExample description="Bus with caution">
    <div style={{ paddingLeft: '5px' }}>
      <IconWithBigCaution className="bus" img="icon-icon_bus" />
    </div>
  </ComponentUsageExample>
);

IconWithBigCaution.propTypes = {
  alertSeverityLevel: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
  img: PropTypes.string.isRequired,
};

IconWithBigCaution.defaultProps = {
  alertSeverityLevel: undefined,
  className: '',
};

export default IconWithBigCaution;
