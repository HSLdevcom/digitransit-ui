import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import { getTotalDistance } from '../util/legUtils';

export const StreetModeSelectorButton = (
  { icon, name, plan, onClick },
  { config },
) => {
  const itinerary = plan.itineraries[0];
  if (!itinerary) {
    return null;
  }
  const duration = durationToString(itinerary.duration * 1000);
  const distance =
    name === 'WALK'
      ? displayDistance(itinerary.walkDistance, config)
      : displayDistance(getTotalDistance(itinerary), config);
  let secondaryIcon;

  if (name === 'bikeAndPublic') {
    const publicModes = plan.itineraries[0].legs.filter(
      obj => obj.mode !== 'WALK' && obj.mode !== 'BICYCLE',
    );
    if (publicModes.length > 0) {
      const firstMode = publicModes[0].mode.toLowerCase();
      secondaryIcon = `icon-icon_${firstMode}`;
    }
  }
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      className="street-mode-selector-button-container"
      onClick={() => onClick(name)}
      role="button"
      tabIndex={0}
    >
      <div
        className={`street-mode-selector-button-icon ${
          secondaryIcon ? 'primary-icon' : ''
        }`}
      >
        <Icon img={icon} />
      </div>
      {name === 'bikeAndPublic' ? (
        <div className="street-mode-selector-button-icon secondary-icon">
          <Icon img={secondaryIcon} />
        </div>
      ) : (
        ''
      )}
      <div className="street-mode-button-info">
        <div className="street-mode-button-time">{duration}</div>
        <div className="street-mode-button-length">{distance}</div>
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
  config: PropTypes.object.isRequired,
};
export default StreetModeSelectorButton;
