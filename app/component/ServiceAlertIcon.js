import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from './Icon';
import { AlertSeverityLevelType } from '../constants';
import { getMaximumAlertSeverityLevel } from '../util/alertUtils';

const ServiceAlertIcon = ({ alerts, className }) => {
  if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
    return null;
  }

  return getMaximumAlertSeverityLevel(alerts) ===
    AlertSeverityLevelType.Info ? (
    <Icon className={cx('info', className)} img="icon-icon_info" />
  ) : (
    <Icon className={cx('caution', className)} img="icon-icon_caution" />
  );
};

ServiceAlertIcon.displayName = 'ServiceAlertIcon';

ServiceAlertIcon.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      alertSeverityLevel: PropTypes.string,
    }),
  ),
  className: PropTypes.string,
};

ServiceAlertIcon.defaultProps = {
  alerts: undefined,
  className: undefined,
};

export default ServiceAlertIcon;
