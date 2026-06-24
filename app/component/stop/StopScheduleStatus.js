import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import capitalize from 'lodash/capitalize';
import {
  STOP_STATUS,
  STOP_STATUS_MESSAGE_IDS,
  DISRUPTION_BADGE_PREFIX,
} from '../../util/stopStatusUtils';

/**
 * Renders the status label on the "no departures" panel of a stop or terminal page.
 *
 * Use this component when the status may come from service-calendar data (e.g.
 * out-of-service, no-service-today) and may or may not carry GTFS-RT alert
 * effects. It handles all four STOP_STATUS values and falls back to a generic
 * stop-status message when no alert effects are present.
 *
 * For Traffic Now contexts where an alert effect is always known, use
 * `DisruptionBadge` instead — it renders the full badge pill with an optional
 * icon but cannot express the service-calendar-only statuses.
 */

export default function StopScheduleStatus({
  status = undefined,
  alertEffects = undefined,
  className = undefined,
}) {
  if (!status) {
    return null;
  }
  const isAlertStatus =
    status === STOP_STATUS.ALERT || status === STOP_STATUS.INFO;
  const effects =
    isAlertStatus && alertEffects && alertEffects.length > 0
      ? alertEffects.map(e => e.toLowerCase())
      : null;
  return (
    <span className={cx('stop-schedule-status', status, className)}>
      {effects ? (
        effects.map((effect, i) => (
          <React.Fragment key={effect}>
            {i > 0 && ', '}
            <FormattedMessage
              id={`${DISRUPTION_BADGE_PREFIX}${effect}`}
              defaultMessage={capitalize(effect).replace(/_/g, ' ')}
            />
          </React.Fragment>
        ))
      ) : (
        <FormattedMessage id={STOP_STATUS_MESSAGE_IDS[status]} />
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
  alertEffects: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
};

StopScheduleStatus.displayName = 'StopScheduleStatus';
