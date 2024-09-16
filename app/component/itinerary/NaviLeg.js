import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { legShape } from '../../util/shapes';
import Icon from '../Icon';
import { legDestination, isRental } from '../../util/legUtils';
import NaviDestination from './NaviDestination';

const iconMap = {
  BICYCLE: 'icon-icon_cyclist',
  CAR: 'icon-icon_car-withoutBox',
  SCOOTER: 'icon-icon_scooter_rider',
  WALK: 'icon-icon_walk',
};

/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
export default function NaviLeg({ leg, nextLeg }, { intl }) {
  const iconName = iconMap[leg.mode];
  let goTo = `navileg-${leg.mode.toLowerCase()}`;

  if (isRental(leg, nextLeg)) {
    if (leg.mode === 'WALK' && nextLeg?.mode === 'SCOOTER') {
      goTo = `navileg-rent-scooter`;
    } else {
      goTo = `navileg-rent-cycle`;
    }
  }
  return (
    <div>
      <div className="navileg-goto">
        <Icon img={iconName} color="white" className="navileg-mode" />
        <div className="navileg-divider" />
        <div className="navileg-destination">
          <div className="destination-header">
            <FormattedMessage id={goTo} defaultMessage="Go to" />
            &nbsp;
            {legDestination(intl, leg, null, nextLeg)}
          </div>
          <NaviDestination leg={leg} />
        </div>
      </div>
    </div>
  );
}

NaviLeg.propTypes = {
  leg: legShape.isRequired,
  nextLeg: legShape,
};

NaviLeg.defaultProps = {
  nextLeg: null,
};

NaviLeg.contextTypes = {
  intl: intlShape.isRequired,
};
