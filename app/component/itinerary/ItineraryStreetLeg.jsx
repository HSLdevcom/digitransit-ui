import PropTypes from 'prop-types';
import Icon from '../Icon';
import StreetBar from './StreetBar';
import { legShape } from '../../../utils/client/shapes';

const parkingIndicators = {
  bike: {
    className: 'bike_park',
    icon: 'icon-bike_parking',
  },
  car: {
    className: 'car_park',
    icon: 'icon_car-park',
  },
};

export default function ItineraryStreetLeg({
  leg,
  duration,
  mode,
  legLength,
  renderModeIcons,
  icon,
  parkingIndicator,
}) {
  const parking = parkingIndicator && parkingIndicators[parkingIndicator];

  return (
    <>
      <StreetBar
        leg={leg}
        duration={duration}
        mode={mode}
        legLength={legLength}
        renderModeIcons={renderModeIcons}
        icon={icon}
      />
      {parking && (
        <div className={`leg ${parking.className}`}>
          <Icon
            img={parking.icon}
            className={`itinerary-icon ${parking.className}`}
          />
        </div>
      )}
    </>
  );
}

ItineraryStreetLeg.propTypes = {
  leg: legShape.isRequired,
  duration: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  legLength: PropTypes.number.isRequired,
  renderModeIcons: PropTypes.bool,
  icon: PropTypes.string,
  parkingIndicator: PropTypes.oneOf(['bike', 'car']),
};
