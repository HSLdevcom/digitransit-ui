/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { StreetModeSelectorButton } from './StreetModeSelectorButton';
import { StreetModeSelectorWeatherLabel } from './StreetModeSelectorWeatherLabel';
import { StreetModeSelectorShimmer } from './StreetModeSelectorShimmer';

export const StreetModeSelector = (
  {
    showWalkOptionButton,
    showBikeOptionButton,
    showBikeAndPublicOptionButton,
    showCarOptionButton,
    showParkRideOptionButton,
    toggleStreetMode,
    setStreetModeAndSelect,
    weatherData,
    walkPlan,
    bikePlan,
    bikeAndPublicPlan,
    bikeParkPlan,
    carPlan,
    parkRidePlan,
    loading,
  },
  { config },
) => {
  const bikeAndVehicle = !loading
    ? {
        itineraries: [
          ...(bikeParkPlan?.itineraries || []),
          ...(bikeAndPublicPlan?.itineraries || []),
        ],
      }
    : {};
  const showWeather =
    !config.hideWeatherLabel &&
    (showWalkOptionButton ||
      showBikeOptionButton ||
      showBikeAndPublicOptionButton);

  return (
    <div className="street-mode-selector-container">
      <StreetModeSelectorShimmer loading={loading} />
      {!loading && (
        <div className="street-mode-button-row">
          {showWeather && (
            <StreetModeSelectorWeatherLabel weatherData={weatherData} />
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

          {config.emphasizeOneWayJourney && (
            <div style={{ alignSelf: 'center' }}>
              <FormattedMessage
                id="one-way-journey"
                defaultMessage="One way journey"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

StreetModeSelector.propTypes = {
  showWalkOptionButton: PropTypes.bool,
  showBikeOptionButton: PropTypes.bool,
  showBikeAndPublicOptionButton: PropTypes.bool,
  showCarOptionButton: PropTypes.bool,
  showParkRideOptionButton: PropTypes.bool,
  toggleStreetMode: PropTypes.func.isRequired,
  setStreetModeAndSelect: PropTypes.func.isRequired,
  walkPlan: PropTypes.object,
  bikePlan: PropTypes.object,
  bikeAndPublicPlan: PropTypes.object,
  bikeParkPlan: PropTypes.object,
  parkRidePlan: PropTypes.object,
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

StreetModeSelector.contextTypes = {
  config: PropTypes.object,
};

export default StreetModeSelector;
