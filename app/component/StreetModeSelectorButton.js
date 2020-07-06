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
  let secondaryIcon;

  if (active && plan && plan.itineraries && plan.itineraries.length >= 1) {
    let buttonDisabled = false;
    const itinerary = plan.itineraries[0];
    duration = durationToString(itinerary.duration * 1000);
    distance =
      name === 'WALK'
        ? displayDistance(itinerary.walkDistance, config)
        : displayDistance(getTotalDistance(itinerary), config);

    if (name === 'bikeAndPublic') {
      secondaryIcon = 'icon-icon_rail';
      const publicModes = plan.itineraries[0].legs.filter(
        obj => obj.mode === 'SUBWAY' || obj.mode === 'RAIL',
      );
      if (publicModes.length > 0) {
        const firstMode = publicModes[0].mode.toLowerCase();
        secondaryIcon = `icon-icon_${firstMode}`;
      } else {
        // Disable if same as bikePlan
        buttonDisabled = true;
      }
    }

    if (!buttonDisabled) {
      return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
          className="street-mode-selector-button-container"
          onClick={() => onClick(name)}
          role="Button"
          tabIndex={0}
        >
          <div
            className={`street-mode-selector-button-icon ${
              secondaryIcon ? 'primary-icon' : ''
            }`}
          >
            <Icon img={icon} height={1.5} width={1.5} />
          </div>
          {secondaryIcon ? (
            <div className="street-mode-selector-button-icon secondary-icon">
              <Icon img={secondaryIcon} height={0.75} width={0.75} />
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
    }
  }
  return (
    <div className="street-mode-selector-button-container">
      <div className="disabled-overlay" />
      <div className="street-mode-selector-button-content">
        <div
          className={`street-mode-selector-button-icon ${
            secondaryIcon ? 'primary-icon' : ''
          }`}
        >
          <Icon img={icon} height={1.5} width={1.5} />
        </div>
        {secondaryIcon ? (
          <div className="street-mode-selector-button-icon secondary-icon">
            <Icon img={secondaryIcon} height={0.75} width={0.75} />
          </div>
        ) : (
          ''
        )}
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
