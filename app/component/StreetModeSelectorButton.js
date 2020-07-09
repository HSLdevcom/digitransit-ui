import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import { getTotalDistance } from '../util/legUtils';

export const StreetModeSelectorButton = (
  { icon, name, active, plan, onClick },
  { config },
) => {
  let duration;
  let distance;

  if (active && plan && plan.itineraries && plan.itineraries.length >= 1) {
    const itinerary = plan.itineraries[0];
    duration = durationToString(itinerary.duration * 1000);
    distance =
      name === 'WALK'
        ? displayDistance(itinerary.walkDistance, config)
        : displayDistance(getTotalDistance(itinerary), config);

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div
        className="street-mode-selector-button-container"
        onClick={() => onClick(name)}
        role="Button"
        tabIndex={0}
      >
        <div className="street-mode-selector-button-icon">
          <Icon img={icon} height={1.5} width={1.5} />
        </div>
        <div className="street-mode-button-info">
          <div className="street-mode-button-time">{duration}</div>
          <div className="street-mode-button-length">{distance}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="street-mode-selector-button-container">
      <div className="disabled-overlay" />
      <div className="street-mode-selector-button-content">
        <div className="street-mode-selector-button-icon">
          <Icon img={icon} height={1.5} width={1.5} />
        </div>
        <div className="street-mode-button-info">
          <div className="street-mode-button-time">- min</div>
          <div className="street-mode-button-length">- km</div>
        </div>
      </div>
    </div>
  );
};

StreetModeSelectorButton.propTypes = {
  icon: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  plan: PropTypes.object,
  onClick: PropTypes.func.isRequired,
};

StreetModeSelectorButton.defaulProps = {
  plan: undefined,
};

StreetModeSelectorButton.contextTypes = {
  config: PropTypes.object.isRequired,
};
export default StreetModeSelectorButton;
