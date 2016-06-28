import React from 'react';
import cx from 'classnames';
import RouteNumber from '../departure/RouteNumber';

export default function RouteAlertsRow({
  header,
  description,
  startTime,
  endTime,
  active,
  routeMode,
  routeLine,
}) {
  const activeClass = active ? 'active' : '';

  return (
    <div className={cx('route-alert-row', activeClass)}>
      <RouteNumber mode={routeMode} text={routeLine} />
      <div className="route-alert-contents">
        <span className="route-alert-duration">
          {`${startTime} - ${endTime}`}
        </span>
        <span className="route-alert-header">
          {header}
        </span>
        <span className="route-alert-body">
          {description}
        </span>
      </div>
    </div>
  );
}

RouteAlertsRow.propTypes = {
  key: React.PropTypes.string.isRequired,
  header: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  startTime: React.PropTypes.object.isRequired,
  endTime: React.PropTypes.object.isRequired,
  active: React.PropTypes.bool.isRequired,
  routeMode: React.PropTypes.string.isRequired,
  routeLine: React.PropTypes.string.isRequired,
};
