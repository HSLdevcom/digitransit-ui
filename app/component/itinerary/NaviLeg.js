import React from 'react';
import { FormattedMessage } from 'react-intl';
import { legShape } from '../../util/shapes';
import Icon from '../Icon';
// import StopCode from '../StopCode';

const iconMap = {
  BICYCLE: 'icon-icon_cyclist',
  CAR: 'icon-icon_car-withoutBox',
  SCOOTER: 'icon-icon_scooter',
  WALK: 'icon-icon_walk',
};

export default function NaviLeg({ leg }) {
  const iconName = iconMap[leg.mode];
  const modeId = `navileg-${leg.mode.toLowerCase()}`;
  const destination = `modes.to-${
    leg.to.stop?.vehicleMode?.toLowerCase() || 'place'
  }`;

  return (
    <div className="navileg-container">
      <Icon img={iconName} className="navileg-mode" />
      <FormattedMessage id={modeId} defaultMessage="Go to " />
      &nbsp;
      <FormattedMessage id={destination} defaultMessage="stop" />
    </div>
  );
}

NaviLeg.propTypes = {
  leg: legShape.isRequired,
};
