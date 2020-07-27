/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React from 'react';
import { StreetModeSelectorButton } from './StreetModeSelectorButton';
import { StreetModeSelectorWeatherLabel } from './StreetModeSelectorWeatherLabel';

export const StreetModeSelector = ({
  showWalkOptionButton,
  showBikeOptionButton,
  onButtonClick,
  weatherData,
  walkPlan,
  bikePlan,
}) => {
  return (
    <div className="street-mode-selector-container">
      <StreetModeSelectorWeatherLabel
        active={showWalkOptionButton || showBikeOptionButton}
        weatherData={weatherData}
      />
      <StreetModeSelectorButton
        icon="icon-icon_walk"
        name="walk"
        active={showWalkOptionButton}
        plan={walkPlan}
        onClick={onButtonClick}
      />
      <StreetModeSelectorButton
        icon="icon-icon_cyclist"
        name="bike"
        active={showBikeOptionButton}
        plan={bikePlan}
        onClick={onButtonClick}
      />
    </div>
  );
};

StreetModeSelector.propTypes = {
  showWalkOptionButton: PropTypes.bool.isRequired,
  showBikeOptionButton: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  // eslint-disable-next-line react/require-default-props
  weatherData: PropTypes.shape({
    temperature: PropTypes.number,
    windSpeed: PropTypes.number,
    iconId: PropTypes.number,
  }),
};

StreetModeSelector.contextTypes = {
  config: PropTypes.object.isRequired,
  walkPlan: PropTypes.object,
  bikePlan: PropTypes.object,
};

export default StreetModeSelector;
