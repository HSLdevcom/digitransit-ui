import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Icon from './Icon';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import {
  getTotalDistance,
  getTotalBikingDistance,
  getTotalDrivingDistance,
  compressLegs,
  getExtendedMode,
} from '../util/legUtils';
import { streetHash } from '../util/path';

export default function StreetModeSelectorButton(
  { icon, name, plan, onClick },
  { config, intl },
) {
  let itinerary = plan.itineraries[0];
  if (!itinerary) {
    return null;
  }

  if (name === streetHash.bikeAndVehicle || name === streetHash.parkAndRide) {
    const compressedLegs = compressLegs(itinerary.legs);
    itinerary = {
      ...itinerary,
      legs: compressedLegs,
    };
  }

  const duration = durationToString(itinerary.duration * 1000);
  let distance = 0;
  switch (name) {
    case streetHash.walk:
      distance = displayDistance(
        itinerary.walkDistance,
        config,
        intl.formatNumber,
      );
      break;
    case streetHash.bikeAndVehicle:
      distance = displayDistance(
        getTotalBikingDistance(itinerary),
        config,
        intl.formatNumber,
      );
      break;
    case streetHash.parkAndRide:
      distance = displayDistance(
        getTotalDrivingDistance(itinerary),
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

  if (name === streetHash.parkAndRide || name === streetHash.bikeAndVehicle) {
    const transitItinerary = plan.itineraries.find(i =>
      i.legs.find(l => l.transitLeg),
    );
    const mode =
      (transitItinerary &&
        getExtendedMode(
          transitItinerary?.legs.find(l => l.transitLeg),
          config,
        )) ||
      'rail';
    secondaryIcon = `icon-icon_${mode}`;
    secondaryColor =
      mode === 'subway' ? config.colors?.iconColors?.['mode-metro'] : '';
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
          } ${name === streetHash.parkAndRide ? 'car-park-primary' : ''} ${
            name === streetHash.bikeAndVehicle ? 'bike-and-vehicle-primary' : ''
          }`}
        >
          <Icon img={icon} />
        </div>
        {name === streetHash.bikeAndVehicle ||
        name === streetHash.parkAndRide ? (
          <div
            className={`street-mode-selector-button-icon secondary-icon ${
              name === streetHash.parkAndRide ? 'car-park-secondary' : ''
            }`}
          >
            <Icon img={secondaryIcon} color={secondaryColor} />
          </div>
        ) : (
          ''
        )}
        <div className="street-mode-button-info">
          {config.showDistanceBeforeDuration ? (
            <>
              <div className="street-mode-button-time">{distance}</div>
              {!config.hideCarSuggestionDuration && (
                <div className="street-mode-button-length">{duration}</div>
              )}
            </>
          ) : (
            <>
              <div className="street-mode-button-time">{duration}</div>
              <div className="street-mode-button-length">{distance}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
