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
  showParkRideOptionButton,
  showOnDemandTaxiOptionButton,
  toggleStreetMode,
  setStreetModeAndSelect,
  weatherData,
  walkPlan,
  bikePlan,
  bikeAndPublicPlan,
  bikeRentAndPublicPlan,
  bikeParkPlan,
  carPlan,
  parkRidePlan,
  onDemandTaxiPlan,
  loading,
}) => {
  const bikeAndVehicle = !loading
    ? {
        itineraries: [
          ...(bikeParkPlan?.itineraries || []),
          ...(bikeAndPublicPlan?.itineraries || []),
          ...(bikeRentAndPublicPlan?.itineraries || []),
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

          {showParkRideOptionButton && (
            <StreetModeSelectorButton
              icon="icon-icon_car-withoutBox"
              name="parkAndRide"
              plan={parkRidePlan}
              onClick={toggleStreetMode}
            />
          )}
          {showCarOptionButton && (
            <StreetModeSelectorButton
              icon="icon-icon_car-withoutBox"
              name="car"
              plan={carPlan}
              onClick={setStreetModeAndSelect}
            />
          )}
          {showOnDemandTaxiOptionButton && (
            <StreetModeSelectorButton
              icon="icon-icon_on-demand-taxi"
              name="onDemandTaxi"
              plan={onDemandTaxiPlan}
              onClick={setStreetModeAndSelect}
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
  showParkRideOptionButton: PropTypes.bool.isRequired,
  showOnDemandTaxiOptionButton: PropTypes.bool.isRequired,
  toggleStreetMode: PropTypes.func.isRequired,
  setStreetModeAndSelect: PropTypes.func.isRequired,
  walkPlan: PropTypes.object,
  bikePlan: PropTypes.object,
  bikeAndPublicPlan: PropTypes.object,
  bikeParkPlan: PropTypes.object,
  parkRidePlan: PropTypes.object,
  onDemandTaxiPlan: PropTypes.object,
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
