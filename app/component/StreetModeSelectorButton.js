import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Icon from './Icon';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import {
  getTotalDistance,
  getTotalBikingDistance,
  getTotalScooterDistance,
  compressLegs,
} from '../util/legUtils';

export const StreetModeSelectorButton = (
  { icon, name, plan, onClick },
  { config, intl },
) => {
  let itinerary = plan.itineraries[0];
  if (!itinerary) {
    return null;
  }

  if (
    name === 'bikeAndVehicle' ||
    name === 'parkAndRide' ||
    name === 'scooter'
  ) {
    const compressedLegs = compressLegs(itinerary.legs);
    itinerary = {
      ...itinerary,
      legs: compressedLegs,
    };
  }

  const duration = durationToString(itinerary.duration * 1000);
  let distance = 0;
  switch (name) {
    case 'WALK':
      distance = displayDistance(
        itinerary.walkDistance,
        config,
        intl.formatNumber,
      );
      break;
    case 'scooter':
      distance = displayDistance(
        getTotalScooterDistance(itinerary),
        config,
        intl.formatNumber,
      );
      break;
    case 'bikeAndVehicle':
      distance = displayDistance(
        getTotalBikingDistance(itinerary),
        config,
        intl.formatNumber,
      );
      break;
    default:
      distance = displayDistance(
        getTotalDistance(itinerary),
        config,
        intl.formatNumber,
      );
      break;
  }

  let secondaryIcon;
  let secondaryColor;

  if (['bikeAndVehicle', 'scooter', 'parkAndRide'].includes(name)) {
    const publicModes = plan.itineraries[0].legs.filter(
      leg => !['WALK', 'BICYCLE', 'CAR'].includes(leg.mode),
    );

    if (name !== 'scooter') {
      const mode = publicModes?.[0]?.mode?.toLowerCase() || 'rail';
      secondaryIcon = `icon-icon_${mode}`;
      secondaryColor =
        mode === 'subway' ? config.colors?.iconColors?.['mode-metro'] : '';
    }
  }
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      className="street-mode-selector-button-container"
      onClick={() => onClick(name)}
      role="button"
      tabIndex={0}
      aria-label={intl.formatMessage(
        {
          id: `street-mode-${name.toLowerCase()}-aria`,
          defaultMessage: 'Walk plan',
        },
        {
          length: distance,
          duration,
        },
      )}
    >
      <div className="street-mode-selector-button-content">
        <div
          className={`street-mode-selector-button-icon ${
            secondaryIcon ? 'primary-icon' : ''
          } ${name === 'parkAndRide' ? 'car-park-primary' : ''} ${
            name === 'bikeAndVehicle' ? 'bike-and-vehicle-primary' : ''
          }`}
        >
          <Icon img={icon} />
        </div>
        {secondaryIcon ? (
          <div
            className={`street-mode-selector-button-icon secondary-icon ${
              name === 'parkAndRide' ? 'car-park-secondary' : ''
            }`}
          >
            <Icon img={secondaryIcon} color={secondaryColor} />
          </div>
        ) : (
          ''
        )}
        <div className="street-mode-button-info">
          <div className="street-mode-button-time">{duration}</div>
          <div className="street-mode-button-length">{distance}</div>
        </div>
      </div>
    </div>
  );
};

StreetModeSelectorButton.propTypes = {
  icon: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  plan: PropTypes.object,
  onClick: PropTypes.func.isRequired,
};

StreetModeSelectorButton.defaulProps = {
  plan: undefined,
};

StreetModeSelectorButton.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};
export default StreetModeSelectorButton;
