import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from './Icon';
import { AlertSeverityLevelType } from '../constants';

const ServiceAlertIcon = ({ className, severityLevel, color }) => {
  if (!severityLevel) {
    return null;
  }

  return severityLevel === AlertSeverityLevelType.Info ? (
    <Icon
      className={cx('info', className)}
      img="icon-icon_info"
      color={color}
    />
  ) : (
    <Icon className={cx('caution', className)} img="icon-icon_caution" />
  );
};

ServiceAlertIcon.displayName = 'ServiceAlertIcon';

ServiceAlertIcon.propTypes = {
  className: PropTypes.string,
  severityLevel: PropTypes.oneOf([
    AlertSeverityLevelType.Info,
    AlertSeverityLevelType.Severe,
    AlertSeverityLevelType.Unknown,
    AlertSeverityLevelType.Warning,
  ]),
  color: PropTypes.string,
};

ServiceAlertIcon.defaultProps = {
  className: undefined,
  severityLevel: undefined,
  color: undefined,
};

export default ServiceAlertIcon;
