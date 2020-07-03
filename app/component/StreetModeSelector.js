import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { StreetModeSelectorButton } from './StreetModeSelectorButton';
import { StreetModeSelectorWeatherLabel } from './StreetModeSelectorWeatherLabel';

export const StreetModeSelector = ({
  showWalkOptionButton,
  onButtonClick,
  walkItinerary,
  weatherData,
}) => {
  return (
    <div className="street-mode-selector-container">
      <StreetModeSelectorWeatherLabel
        active={showWalkOptionButton}
        weatherData={weatherData}
      />
      <StreetModeSelectorButton
        icon="icon-icon_walk"
        name="walk"
        active={showWalkOptionButton}
        itinerary={walkItinerary}
        onClick={onButtonClick}
      />
    </div>
  );
};

StreetModeSelector.propTypes = {
  showWalkOptionButton: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  walkItinerary: PropTypes.object.isRequired,
  // eslint-disable-next-line react/require-default-props
  weatherData: PropTypes.object,
};

StreetModeSelector.contextTypes = {
  config: PropTypes.object.isRequired,
  router: routerShape,
  match: matchShape.isRequired,
};

export default StreetModeSelector;
