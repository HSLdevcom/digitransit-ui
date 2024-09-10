import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { legShape } from '../../util/shapes';
import Icon from '../Icon';
import StopCode from '../StopCode';
import { legDestination } from '../../util/legUtils';

const iconMap = {
  BICYCLE: 'icon-icon_cyclist',
  CAR: 'icon-icon_car-withoutBox',
  SCOOTER: 'icon-icon_scooter',
  WALK: 'icon-icon_walk',
};

const driveModes = ['CAR', 'SCOOTER'];

/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */

export default function NaviLeg({ leg, focusToLeg }, { intl }) {
  const iconName = iconMap[leg.mode];
  const { stop } = leg.to;
  const stopMode = stop?.vehicleMode.toLowerCase();
  const goTo = driveModes.includes(leg.mode)
    ? 'navileg-drive'
    : `navileg-${leg.mode.toLowerCase()}`;

  return (
    <div>
      <div className="navileg-goto">
        <Icon img={iconName} className="navileg-mode" />
        <FormattedMessage id={goTo} defaultMessage="Go to" />
        &nbsp;
        {legDestination(intl, leg.to)}
      </div>
      <div className="navileg-destination">
        <div className="navi-left-bar" />
        <div className="navileg-destination-details">
          {stopMode && (
            <Icon
              img={`icon-icon_${stopMode}-stop-lollipop`}
              className="navi-lollipop"
            />
          )}
          <div>
            {stop?.name}&nbsp;
            {stop?.code && <StopCode code={stop.code} />}
          </div>
          <div onClick={() => focusToLeg(leg, false)} className="navileg-focus">
            Näytä reitti kartalla
          </div>
        </div>
      </div>
    </div>
  );
}

NaviLeg.propTypes = {
  leg: legShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
};

NaviLeg.contextTypes = {
  intl: intlShape.isRequired,
};
