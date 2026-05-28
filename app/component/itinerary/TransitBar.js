import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { legShape } from '../../util/shapes';
import RouteNumberContainer from '../RouteNumberContainer';
import { getActiveLegAlertSeverityLevel } from '../../util/alertUtils';
import { isLocalCallAgency } from '../../util/legUtils';
import { getTripOrRouteMode } from '../../util/modeUtils';
import { getCapacityForLeg } from '../../util/occupancyUtil';
import { useConfigContext } from '../../configurations/ConfigContext';

export default function TransitBar({
  leg,
  legLength,
  interliningWithRoute,
  fitRouteNumber,
  withBicycle,
  withCar,
  hasOneTransitLeg = false,
  shortenLabels = false,
}) {
  const config = useConfigContext();

  const mode = getTripOrRouteMode(leg.trip, leg.route, config);

  const getOccupancyStatus = () => {
    if (hasOneTransitLeg) {
      return getCapacityForLeg(config, leg);
    }
    return undefined;
  };

  return (
    <div
      className={cx(
        'leg',
        mode.toLowerCase(),
        fitRouteNumber ? 'fit-route-number' : '',
      )}
      style={{ '--width': `${legLength}%` }}
    >
      <RouteNumberContainer
        alertSeverityLevel={getActiveLegAlertSeverityLevel(leg)}
        trip={leg.trip}
        route={leg.route}
        className={cx('line', mode)}
        interliningWithRoute={interliningWithRoute}
        mode={mode}
        vertical
        withBar
        isTransitLeg
        withBicycle={withBicycle}
        withCar={withCar}
        occupancyStatus={getOccupancyStatus()}
        duration={Math.floor(leg.duration / 60)}
        shortenLongText={shortenLabels}
        appendClass={isLocalCallAgency(leg, config) ? 'call-local' : ''}
      />
    </div>
  );
}

TransitBar.propTypes = {
  leg: legShape.isRequired,
  legLength: PropTypes.number.isRequired,
  fitRouteNumber: PropTypes.bool.isRequired,
  interliningWithRoute: PropTypes.string,
  withBicycle: PropTypes.bool.isRequired,
  withCar: PropTypes.bool.isRequired,
  hasOneTransitLeg: PropTypes.bool,
  shortenLabels: PropTypes.bool,
};
