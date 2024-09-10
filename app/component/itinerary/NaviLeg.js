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
  SCOOTER: 'icon-icon_scooter_rider',
  WALK: 'icon-icon_walk',
};

/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
export default function NaviLeg({ leg, focusToLeg }, { intl }) {
  const iconName = iconMap[leg.mode];
  const { stop, rentalVehicle, vehicleParking, vehicleRentalStation } = leg.to;
  const goTo = `navileg-${leg.mode.toLowerCase()}`;

  let toIcon;
  if (stop) {
    toIcon = `icon-icon_${stop.vehicleMode.toLowerCase()}-stop-lollipop`;
  } else if (rentalVehicle) {
    toIcon = 'icon-icon_scooter-lollipop';
  } else if (vehicleParking) {
    toIcon = 'icon-bike_parking';
  } else if (vehicleRentalStation) {
    toIcon = 'icon-icon_citybike';
  }

  return (
    <div>
      <div className="navileg-goto">
        <Icon img={iconName} className="navileg-mode" />
        <FormattedMessage id={goTo} defaultMessage="Go to" />
        &nbsp;
        {legDestination(intl, leg)}
      </div>
      <div className="navileg-destination">
        <div className="navi-left-bar" />
        <div className="navileg-destination-details">
          {toIcon && <Icon img={toIcon} className="navi-destination-icon" />}
          <div>
            {stop?.name}&nbsp;
            {stop?.code && <StopCode code={stop.code} />}
            {rentalVehicle?.rentalNetwork.networkId}
            {vehicleParking?.name}
            {vehicleRentalStation?.rentalNetwork.networkId}&nbsp;
            {vehicleRentalStation?.name}
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
