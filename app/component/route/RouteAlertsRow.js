import React from 'react';
import cx from 'classnames';
import RouteNumber from '../departure/RouteNumber';

export default function RouteAlertsRow({
  header,
  description,
  startTime,
  endTime,
  routeMode,
  routeLine,
  day,
  active,
}) {
  return (
    <div className={cx('route-alert-row', { expired: !active })}>
      <RouteNumber mode={routeMode} text={routeLine} vertical />
      <div className="route-alert-contents">
        <div className="route-alert-duration sub-header-h4">
          {day}{` ${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}`}
        </div>
        <div className={cx('route-alert-header', routeMode)}>
          {header || routeLine}
        </div>
        <div className="route-alert-body">
          {description}
        </div>
      </div>
    </div>
  );
}

RouteAlertsRow.propTypes = {
  header: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  startTime: React.PropTypes.object.isRequired,
  endTime: React.PropTypes.object.isRequired,
  currentTime: React.PropTypes.number.isRequired,
  routeMode: React.PropTypes.string.isRequired,
  routeLine: React.PropTypes.string.isRequired,
  day: React.PropTypes.string.isRequired,
  active: React.PropTypes.bool.isRequired,
};
