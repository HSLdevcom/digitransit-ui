import cx from 'classnames';
import PropTypes from 'prop-types';
import { legShape } from '../../utils/shapes';
import Icon from '../Icon';
import RouteNumber from '../RouteNumber';
import { getLegBadgeProps, isLocalCallAgency } from '../../utils/legUtils';
import {
  getRentalNetworkIcon,
  getRentalNetworkConfig,
} from '../../../shared/utils/vehicleRentalUtils';
import { useConfigContext } from '../../hooks/ConfigContext';

const parkingIndicators = {
  bike: { className: 'bike_park', icon: 'icon-bike_parking' },
  car: { className: 'car_park', icon: 'icon_car-park' },
};

export default function StreetBar({
  leg,
  mode,
  legLength,
  duration,
  renderModeIcons = false,
  icon,
  parkingIndicator,
}) {
  const config = useConfigContext();
  let networkIcon;
  if ((mode === 'CITYBIKE' || mode === 'BICYCLE') && leg.from.vehicleRentalStation) {
    networkIcon =
      leg.from.vehicleRentalStation &&
      getRentalNetworkIcon(
        getRentalNetworkConfig(leg.from.vehicleRentalStation.rentalNetwork.networkId, config),
      );
  } else if (mode === 'SCOOTER') {
    networkIcon = 'icon_scooter_rider';
  }

  const parking = parkingIndicator && parkingIndicators[parkingIndicator];

  return (
    <>
      <div
        className={cx('leg', mode.toLowerCase(), renderModeIcons ? 'render-icon' : '')}
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
      {parking && (
        <div className={`leg ${parking.className}`}>
          <Icon img={parking.icon} className={`itinerary-icon ${parking.className}`} />
        </div>
      )}
    </>
  );
}

StreetBar.propTypes = {
  leg: legShape.isRequired,
  mode: PropTypes.string.isRequired,
  legLength: PropTypes.number.isRequired,
  renderModeIcons: PropTypes.bool,
  duration: PropTypes.number,
  icon: PropTypes.string,
  parkingIndicator: PropTypes.oneOf(['bike', 'car']),
};
