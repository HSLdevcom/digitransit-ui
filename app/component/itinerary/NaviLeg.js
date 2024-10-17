import React from 'react';
import PropTypes from 'prop-types';
import { legShape } from '../../util/shapes';
import Icon from '../Icon';
import { isRental } from '../../util/legUtils';
import NaviLegContent from './NaviLegContent';

const iconMap = {
  BICYCLE: 'icon-icon_cyclist',
  CAR: 'icon-icon_car-withoutBox',
  SCOOTER: 'icon-icon_scooter_rider',
  WALK: 'icon-icon_walk',
  WAIT: 'icon-icon_navigation_wait',
};

/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
export default function NaviLeg({ leg, nextLeg, legType }) {
  const iconName = legType === 'wait' ? iconMap.WAIT : iconMap[leg.mode];
  let moveInstructions = `navileg-${leg.mode.toLowerCase()}`;

  if (isRental(leg, nextLeg)) {
    if (leg.mode === 'WALK' && nextLeg?.mode === 'SCOOTER') {
      moveInstructions = `navileg-rent-scooter`;
    } else {
      moveInstructions = `navileg-rent-cycle`;
    }
  }
  return (
    <div>
      <div className="navileg-goto">
        <Icon img={iconName} color="black" className="navileg-mode" />
        <div className="navileg-divider" />
        <div className="navileg-destination">
          <NaviLegContent
            leg={leg}
            nextLeg={nextLeg}
            moveInstructions={moveInstructions}
            legType={legType}
          />
        </div>
      </div>
    </div>
  );
}

NaviLeg.propTypes = {
  leg: legShape.isRequired,
  nextLeg: legShape.isRequired,
  legType: PropTypes.string.isRequired,
};
