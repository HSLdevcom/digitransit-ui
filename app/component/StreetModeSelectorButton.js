import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import { getTotalDistance } from '../util/legUtils';

export const StreetModeSelectorButton = (
  { icon, name, active, itinerary, onClick },
  { config },
) => {
  const duration = durationToString(itinerary.duration * 1000);
  const distance =
    name === 'WALK'
      ? displayDistance(itinerary.walkDistance, config)
      : displayDistance(getTotalDistance(itinerary), config);
  if (active) {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div
        className="street-mode-selector-button-container"
        onClick={() => onClick(name)}
        role="Button"
        tabIndex={0}
      >
        <Icon
          img={icon}
          className="steet-mode-selector-button-icon"
          height={1.5}
          width={1.5}
        />
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
        <Icon
          img={icon}
          className="steet-mode-selector-button-icon"
          height={1.5}
          width={1.5}
        />
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
  itinerary: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

StreetModeSelectorButton.contextTypes = {
  config: PropTypes.object.isRequired,
};
export default StreetModeSelectorButton;
