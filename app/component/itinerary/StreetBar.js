import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { legShape } from '../../util/shapes';
import RouteNumber from '../RouteNumber';
import { getLegBadgeProps, isLocalCallAgency } from '../../util/legUtils';
import {
  getRentalNetworkIcon,
  getRentalNetworkConfig,
} from '../../util/vehicleRentalUtils';
import { useConfigContext } from '../../configurations/ConfigContext';

export default function StreetBar({
  leg,
  mode,
  legLength,
  duration,
  renderModeIcons = false,
  icon,
}) {
  const config = useConfigContext();
  let networkIcon;
  if (
    (mode === 'CITYBIKE' || mode === 'BICYCLE') &&
    leg.from.vehicleRentalStation
  ) {
    networkIcon =
      leg.from.vehicleRentalStation &&
      getRentalNetworkIcon(
        getRentalNetworkConfig(
          leg.from.vehicleRentalStation.rentalNetwork.networkId,
          config,
        ),
      );
  } else if (mode === 'SCOOTER') {
    networkIcon = 'icon_scooter_rider';
  }

  return (
    <div
      className={cx(
        'leg',
        mode.toLowerCase(),
        renderModeIcons ? 'render-icon' : '',
      )}
      style={{ '--width': `${legLength}%` }}
    >
      <RouteNumber
        mode={mode}
        text=""
        className={cx('line', mode.toLowerCase())}
        duration={duration}
        renderModeIcons={renderModeIcons}
        vertical
        withBar
        icon={networkIcon || icon}
        appendClass={isLocalCallAgency(leg, config) ? 'call-local' : ''}
        {...getLegBadgeProps(leg, config)}
      />
    </div>
  );
}

StreetBar.propTypes = {
  leg: legShape.isRequired,
  mode: PropTypes.string.isRequired,
  legLength: PropTypes.number.isRequired,
  renderModeIcons: PropTypes.bool,
  duration: PropTypes.number,
  icon: PropTypes.string,
};
