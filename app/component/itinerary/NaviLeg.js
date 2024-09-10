import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { legShape } from '../../util/shapes';
import Icon from '../Icon';
import { legDestination } from '../../util/legUtils';
import NaviDestination from './NaviDestination';

const iconMap = {
  BICYCLE: 'icon-icon_cyclist',
  CAR: 'icon-icon_car-withoutBox',
  SCOOTER: 'icon-icon_scooter_rider',
  WALK: 'icon-icon_walk',
};

/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
export default function NaviLeg({ leg, focusToLeg }, { intl }) {
  const iconName = iconMap[leg.mode];
  const goTo = `navileg-${leg.mode.toLowerCase()}`;

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
        <NaviDestination leg={leg} focusToLeg={focusToLeg} />
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
