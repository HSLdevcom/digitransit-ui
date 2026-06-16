import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import capitalize from 'lodash/capitalize';
import { STOP_STATUS } from '../../util/stopStatusUtils';

const MESSAGE_IDS = {
  [STOP_STATUS.OUT_OF_SERVICE]: 'stop-out-of-service',
  [STOP_STATUS.NO_SERVICE_TODAY]: 'stop-no-service-today',
  [STOP_STATUS.ALERT]: 'stop-has-alert',
  [STOP_STATUS.INFO]: 'stop-has-info',
};

const DISRUPTION_BADGE_PREFIX = 'disruption-badge-';

export default function StopScheduleStatus({
  status = undefined,
  alertEffect = undefined,
  className = undefined,
}) {
  if (!status) {
    return null;
  }
  const isAlertStatus =
    status === STOP_STATUS.ALERT || status === STOP_STATUS.INFO;
  const effect =
    isAlertStatus && alertEffect ? alertEffect.toLowerCase() : null;
  return (
    <span className={cx('stop-schedule-status', status, className)}>
      {effect ? (
        <FormattedMessage
          id={`${DISRUPTION_BADGE_PREFIX}${effect}`}
          defaultMessage={capitalize(effect).replace(/_/g, ' ')}
        />
      ) : (
        <FormattedMessage id={MESSAGE_IDS[status]} />
      )}
    </span>
  );
}

StopScheduleStatus.propTypes = {
  status: PropTypes.oneOf([
    STOP_STATUS.OUT_OF_SERVICE,
    STOP_STATUS.NO_SERVICE_TODAY,
    STOP_STATUS.ALERT,
    STOP_STATUS.INFO,
  ]),
  alertEffect: PropTypes.string,
  className: PropTypes.string,
};

StopScheduleStatus.displayName = 'StopScheduleStatus';
