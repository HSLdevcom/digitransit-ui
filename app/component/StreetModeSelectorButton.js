import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Icon from './Icon';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import { getRouteMode } from '../util/modeUtils';
import {
  getTotalDistance,
  getTotalBikingDistance,
  compressLegs,
} from '../util/legUtils';

const getMode = (leg, config) => {
  return config.useExtendedRouteTypes
    ? getRouteMode(leg.route) || leg.mode.toLowerCase()
    : leg.mode.toLowerCase();
};

export const StreetModeSelectorButton = (
  { icon, name, plan, onClick },
  { config, intl },
) => {
  let itinerary = plan.itineraries[0];
  if (!itinerary) {
    return null;
  }

  if (name === 'bikeAndVehicle' || name === 'parkAndRide') {
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
  let metroColor;

  if (name === 'parkAndRide' || name === 'bikeAndVehicle') {
    let mode = 'rail';
    for (let i = 0; i < plan.itineraries.length; i++) {
      const publicModes = plan.itineraries[i].legs.filter(
        obj =>
          obj.mode !== 'WALK' && obj.mode !== 'BICYCLE' && obj.mode !== 'CAR',
      );
      if (publicModes.length > 0) {
        mode = getMode(publicModes[0], config);
        break;
      }
    }
    secondaryIcon = `icon-icon_${mode}`;
    if (mode === 'subway') {
      metroColor = '#CA4000';
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
        {name === 'bikeAndVehicle' || name === 'parkAndRide' ? (
          <div
            className={`street-mode-selector-button-icon secondary-icon ${
              name === 'parkAndRide' ? 'car-park-secondary' : ''
            }`}
          >
            <Icon img={secondaryIcon} color={metroColor || ''} />
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
