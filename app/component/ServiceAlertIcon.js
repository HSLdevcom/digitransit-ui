import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from './Icon';
import { AlertSeverityLevelType } from '../constants';

const ServiceAlertIcon = ({ className, severity }) => {
  if (!severity) {
    return null;
  }

  return severity === AlertSeverityLevelType.Info ? (
    <Icon className={cx('info', className)} img="icon-icon_info" />
  ) : (
    <Icon className={cx('caution', className)} img="icon-icon_caution" />
  );
};

ServiceAlertIcon.displayName = 'ServiceAlertIcon';

ServiceAlertIcon.propTypes = {
  className: PropTypes.string,
  severity: PropTypes.oneOf([
    AlertSeverityLevelType.Info,
    AlertSeverityLevelType.Severe,
    AlertSeverityLevelType.Unknown,
    AlertSeverityLevelType.Warning,
  ]),
};

ServiceAlertIcon.defaultProps = {
  className: undefined,
  severity: undefined,
};

export default ServiceAlertIcon;
