/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React from 'react';
import { StreetModeSelectorButton } from './StreetModeSelectorButton';
import { StreetModeSelectorWeatherLabel } from './StreetModeSelectorWeatherLabel';

export const StreetModeSelector = ({
  showWalkOptionButton,
  showBikeOptionButton,
  showBikeAndPublicOptionButton,
  toggleStreetMode,
  setStreetModeAndSelect,
  weatherData,
  walkPlan,
  bikePlan,
  bikeAndPublicPlan,
}) => {
  return (
    <div className="street-mode-selector-container">
      <div className="street-mode-button-row">
        <StreetModeSelectorWeatherLabel
          active={
            showWalkOptionButton ||
            showBikeOptionButton ||
            showBikeAndPublicOptionButton
          }
          weatherData={weatherData}
        />
        {showWalkOptionButton && (
          <StreetModeSelectorButton
            icon="icon-icon_walk"
            name="walk"
            plan={walkPlan}
            onClick={setStreetModeAndSelect}
          />
        )}
        {showBikeOptionButton && (
          <StreetModeSelectorButton
            icon="icon-icon_cyclist"
            name="bike"
            plan={bikePlan}
            onClick={setStreetModeAndSelect}
          />
        )}
        {showBikeAndPublicOptionButton && (
          <StreetModeSelectorButton
            icon="icon-icon_cyclist"
            name="bikeAndPublic"
            plan={bikeAndPublicPlan}
            onClick={toggleStreetMode}
          />
        )}
      </div>
    </div>
  );
};

StreetModeSelector.propTypes = {
  showWalkOptionButton: PropTypes.bool.isRequired,
  showBikeOptionButton: PropTypes.bool.isRequired,
  showBikeAndPublicOptionButton: PropTypes.bool.isRequired,
  toggleStreetMode: PropTypes.func.isRequired,
  setStreetModeAndSelect: PropTypes.func.isRequired,
  walkPlan: PropTypes.object,
  bikePlan: PropTypes.object,
  bikeAndPublicPlan: PropTypes.object,
  // eslint-disable-next-line react/require-default-props
  weatherData: PropTypes.shape({
    temperature: PropTypes.number,
    windSpeed: PropTypes.number,
    iconId: PropTypes.number,
  }),
};

StreetModeSelector.defaultProps = {
  walkPlan: undefined,
  bikePlan: undefined,
  bikeAndPublicPlan: undefined,
};

export default StreetModeSelector;
