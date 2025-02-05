import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { isAnyLegPropertyIdentical, isRental } from '../../../util/legUtils';
import { getRouteMode } from '../../../util/modeUtils';
import { configShape, legShape } from '../../../util/shapes';
import Icon from '../../Icon';
import NaviCardExtension from './NaviCardExtension';
import NaviInstructions from './NaviInstructions';
import { LEGTYPE } from './NaviUtils';
import usePrevious from './hooks/usePrevious';

const iconMap = {
  BICYCLE: 'icon-icon_cyclist',
  CAR: 'icon-icon_car-withoutBox',
  SCOOTER: 'icon-icon_scooter_rider',
  WALK: 'icon-icon_walk',
  WAIT: 'icon-icon_navigation_wait',
  BUS: 'icon-icon_bus',
  RAIL: 'icon-icon_rail',
  SUBWAY: 'icon-icon_subway',
  TRAM: 'icon-icon_tram',
  FERRY: 'icon-icon_ferry',
  'BUS-EXPRESS': 'icon-icon_bus-express',
  'BUS-LOCAL': 'icon-icon_bus-local',
  SPEEDTRAM: 'icon-icon_speedtram',
  WAIT_IN_VEHICLE: 'icon-icon_wait',
};

export default function NaviCard(
  { leg, nextLeg, legType, time, position, tailLength },
  { config },
) {
  const [cardExpanded, setCardExpanded] = useState(false);
  const { isEqual: legChanged } = usePrevious(leg, (prev, current) =>
    isAnyLegPropertyIdentical(prev, current, ['legId', 'mode']),
  );
  const handleClick = () => {
    setCardExpanded(!cardExpanded);
  };

  if (legChanged) {
    setCardExpanded(false);
  }

  if (
    (!leg && !nextLeg) ||
    legType === LEGTYPE.PENDING ||
    legType === LEGTYPE.END
  ) {
    return null;
  }

  let iconColor = 'currentColor';
  let iconName;
  let instructions = '';

  if (legType === LEGTYPE.TRANSIT) {
    const m = getRouteMode(leg.route, config);
    iconColor = config.colors.iconColors[`mode-${m}`] || leg.route.color;
    iconName = iconMap[m.toUpperCase()];

    instructions = `navileg-in-transit`;
  } else if (
    legType !== LEGTYPE.WAIT &&
    legType !== LEGTYPE.WAIT_IN_VEHICLE &&
    isRental(leg, nextLeg)
  ) {
    if (leg.mode === 'WALK' && nextLeg?.mode === 'SCOOTER') {
      instructions = `navileg-rent-scooter`;
    } else {
      instructions = 'rent-cycle-at';
    }
    iconName = iconMap[leg.mode];
  } else if (legType === LEGTYPE.MOVE) {
    instructions = `navileg-${leg?.mode.toLowerCase()}`;
    iconName = iconMap.WALK;
  } else if (legType === LEGTYPE.WAIT) {
    iconName = iconMap.WAIT;
  } else if (legType === LEGTYPE.WAIT_IN_VEHICLE) {
    iconName = iconMap.WAIT_IN_VEHICLE;
  }

  return (
    <button
      type="button"
      className={`navi-top-card ${cardExpanded ? 'expanded' : ''}`}
      onClick={handleClick}
    >
      <div className="main-card">
        <div className="content">
          <Icon img={iconName} className="mode" color={iconColor} />
          <div className={`instructions ${cardExpanded ? 'expanded' : ''}`}>
            <NaviInstructions
              leg={leg}
              nextLeg={nextLeg}
              instructions={instructions}
              legType={legType}
              time={time}
              position={position}
              tailLength={tailLength}
            />
          </div>
          <div type="button" className="navi-top-card-arrow">
            <Icon
              img="icon-icon_arrow-collapse"
              className={`cursor-pointer ${cardExpanded ? 'inverted' : ''}`}
            />
          </div>
        </div>
        {cardExpanded && (
          <NaviCardExtension
            legType={legType}
            leg={leg}
            nextLeg={nextLeg}
            time={time}
          />
        )}
      </div>
    </button>
  );
}

NaviCard.propTypes = {
  leg: legShape,
  nextLeg: legShape,
  legType: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  position: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  tailLength: PropTypes.number.isRequired,
};
NaviCard.defaultProps = {
  leg: undefined,
  nextLeg: undefined,
  position: undefined,
};

NaviCard.contextTypes = {
  config: configShape.isRequired,
};
