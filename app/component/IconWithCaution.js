import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import ComponentUsageExample from './ComponentUsageExample';
import { AlertSeverityLevelType } from '../constants';

const IconWithCaution = ({ alertSeverityLevel, className, id, img }) => {
  const isInfoLevel = alertSeverityLevel === AlertSeverityLevelType.Info;
  return (
    <svg id={id} viewBox="0 0 40 40" className={cx('icon', className)}>
      <use xlinkHref={`#${img}`} />
      {isInfoLevel && <circle cx="10" cy="30" fill="white" r="12" />}
      <use
        xlinkHref={`#icon-icon_${isInfoLevel ? 'info' : 'caution'}`}
        transform={isInfoLevel ? 'scale(0.5,0.5)' : 'scale(0.6,0.6)'}
        y={isInfoLevel ? '40' : '30'}
        style={isInfoLevel ? { fill: '#666' } : { color: 'white', fill: 'red' }}
      />
    </svg>
  );
};

IconWithCaution.description = () => (
  <ComponentUsageExample description="Bus with caution">
    <IconWithCaution className="bus" img="icon-icon_bus" />
  </ComponentUsageExample>
);

IconWithCaution.displayName = 'IconWithCaution';

IconWithCaution.propTypes = {
  alertSeverityLevel: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  img: PropTypes.string.isRequired,
};

IconWithCaution.defaultProps = {
  alertSeverityLevel: undefined,
  className: undefined,
  id: undefined,
};

export default IconWithCaution;
