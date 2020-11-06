/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React from 'react';
import { StreetModeSelectorButton } from './StreetModeSelectorButton';
import { StreetModeSelectorWeatherLabel } from './StreetModeSelectorWeatherLabel';
import { StreetModeSelectorShimmer } from './StreetModeSelectorShimmer';

export const StreetModeSelector = ({
  showWalkOptionButton,
  showBikeOptionButton,
  showBikeAndPublicOptionButton,
  showCarOptionButton,
  toggleStreetMode,
  setStreetModeAndSelect,
  weatherData,
  walkPlan,
  bikePlan,
  bikeAndPublicPlan,
  bikeParkPlan,
  carPlan,
  loading,
}) => {
  const bikeAndVehicle = !loading
    ? {
        itineraries: [
          ...bikeParkPlan?.itineraries,
          ...bikeAndPublicPlan?.itineraries,
        ],
      }
    : {};
  return (
    <div className="street-mode-selector-container">
      <StreetModeSelectorShimmer loading={loading} />
      {!loading && (
        <div className="street-mode-button-row">
          <StreetModeSelectorWeatherLabel
            active={
              showWalkOptionButton ||
              showBikeOptionButton ||
              showBikeAndPublicOptionButton
            }
            weatherData={weatherData}
          />
          {showCarOptionButton && (
            <StreetModeSelectorButton
              icon="icon-icon_car"
              name="car"
              plan={carPlan}
              onClick={setStreetModeAndSelect}
            />
          )}
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
              name="bikeAndVehicle"
              plan={bikeAndVehicle}
              onClick={toggleStreetMode}
            />
          )}
        </div>
      )}
    </div>
  );
};

StreetModeSelector.propTypes = {
  showWalkOptionButton: PropTypes.bool.isRequired,
  showBikeOptionButton: PropTypes.bool.isRequired,
  showBikeAndPublicOptionButton: PropTypes.bool.isRequired,
  showCarOptionButton: PropTypes.bool.isRequired,
  toggleStreetMode: PropTypes.func.isRequired,
  setStreetModeAndSelect: PropTypes.func.isRequired,
  walkPlan: PropTypes.object,
  bikePlan: PropTypes.object,
  bikeAndPublicPlan: PropTypes.object,
  bikeParkPlan: PropTypes.object,
  // eslint-disable-next-line react/require-default-props
  weatherData: PropTypes.shape({
    temperature: PropTypes.number,
    windSpeed: PropTypes.number,
    iconId: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

StreetModeSelector.defaultProps = {
  walkPlan: undefined,
  bikePlan: undefined,
  bikeAndPublicPlan: undefined,
  bikeParkPlan: undefined,
  loading: undefined,
};

export default StreetModeSelector;
