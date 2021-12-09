import PropTypes from 'prop-types';
import React from 'react';
import IconWithIcon from './IconWithIcon';
import { AlertSeverityLevelType } from '../constants';

const IconWithBigCaution = ({ alertSeverityLevel, className, color, img }) => {
  const iconType =
    alertSeverityLevel === AlertSeverityLevelType.Info
      ? 'info'
      : 'caution-no-excl';
  const subIconClassName =
    alertSeverityLevel === AlertSeverityLevelType.Info ? 'info' : 'caution';
  return (
    <IconWithIcon
      className={className}
      color={color}
      img={img}
      subIcon={`icon-icon_${iconType}`}
      subIconClassName={`subicon-${subIconClassName}`}
      subIconShape={(iconType === 'info' && 'circle') || undefined}
    />
  );
};

IconWithBigCaution.displayName = 'IconWithBigCaution';

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
