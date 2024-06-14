import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import cx from 'classnames';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../../../util/path';
import { convertTo24HourFormat } from '../../../util/timeUtils';
import RouteNumber from '../../RouteNumber';
import { getRouteMode } from '../../../util/modeUtils';

export default function PopupHeader({
  route,
  pattern,
  card,
  startTime,
  className,
}) {
  const mode = getRouteMode(route);

  let startTimeEl;
  if (startTime?.length > 3) {
    // change to 24h format
    const time = convertTo24HourFormat(startTime);
    startTimeEl = <span className="route-header-trip">{time} →</span>;
  } else {
    startTimeEl = '';
  }

  const routeLineText = ` ${route.shortName || ''}`;

  const routeLine =
    startTime && pattern ? (
      <Link
        to={`/${PREFIX_ROUTES}/${route.gtfsId}/${PREFIX_STOPS}/${pattern.code}`}
      >
        {routeLineText}
      </Link>
    ) : (
      routeLineText
    );

  return (
    <div className={cx('route-header', className)}>
      <h1 className={mode}>
        <RouteNumber
          card={card}
          mode={mode}
          text={routeLine}
          color={route.color ? `#${route.color}` : 'currentColor'}
        />
        {startTimeEl}
      </h1>
    </div>
  );
}

PopupHeader.propTypes = {
  route: PropTypes.shape({
    gtfsId: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    shortName: PropTypes.string,
    color: PropTypes.string,
  }).isRequired,
  startTime: PropTypes.string,
  pattern: PropTypes.shape({ code: PropTypes.string.isRequired }),
  className: PropTypes.string,
  card: PropTypes.bool,
};

PopupHeader.defaultProps = {
  startTime: undefined,
  pattern: undefined,
  className: undefined,
  card: false,
};
