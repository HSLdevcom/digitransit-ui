import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { STOP_STATUS } from '../../util/stopStatusUtils';

const MESSAGE_IDS = {
  [STOP_STATUS.OUT_OF_SERVICE]: 'stop-out-of-service',
  [STOP_STATUS.NO_SERVICE_TODAY]: 'stop-no-service-today',
};

export default function StopScheduleStatus({
  status = undefined,
  className = undefined,
}) {
  if (!status) {
    return null;
  }
  return (
    <span className={cx('stop-schedule-status', status, className)}>
      <FormattedMessage id={MESSAGE_IDS[status]} />
    </span>
  );
}

StopScheduleStatus.propTypes = {
  status: PropTypes.oneOf([
    STOP_STATUS.OUT_OF_SERVICE,
    STOP_STATUS.NO_SERVICE_TODAY,
  ]),
  className: PropTypes.string,
};

StopScheduleStatus.displayName = 'StopScheduleStatus';
