/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { StreetModeSelectorButton } from './StreetModeSelectorButton';
import { StreetModeSelectorWeather } from './StreetModeSelectorWeather';
import { StreetModeSelectorShimmer } from './StreetModeSelectorShimmer';

export const StreetModeSelector = (
  {
    selectStreetMode,
    setStreetModeAndSelect,
    weatherData,
    walkPlan,
    bikePlan,
    bikeTransitPlan,
    carPlan,
    parkRidePlan,
    loading,
  },
  { config },
) => {
  return (
    <div className="street-mode-selector-container">
      <StreetModeSelectorShimmer loading={loading} />
      {!loading && (
        <div className="street-mode-button-row">
          {weatherData && (
            <StreetModeSelectorWeather weatherData={weatherData} />
          )}
          {walkPlan?.itineraries?.length && (
            <StreetModeSelectorButton
              icon="icon-icon_walk"
              name="walk"
              plan={walkPlan}
              onClick={setStreetModeAndSelect}
            />
          )}
          {bikePlan?.itineraries?.length && (
            <StreetModeSelectorButton
              icon="icon-icon_cyclist"
              name="bike"
              plan={bikePlan}
              onClick={setStreetModeAndSelect}
            />
          )}
          {bikeTransitPlan?.itineraries?.length && (
            <StreetModeSelectorButton
              icon="icon-icon_cyclist"
              name="bikeAndVehicle"
              plan={bikeTransitPlan}
              onClick={selectStreetMode}
            />
          )}

          {parkRidePlan?.itineraries?.length && (
            <StreetModeSelectorButton
              icon="icon-icon_car-withoutBox"
              name="parkAndRide"
              plan={parkRidePlan}
              onClick={selectStreetMode}
            />
          )}
          {carPlan?.itineraries?.length && (
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
  selectStreetMode: PropTypes.func.isRequired,
  setStreetModeAndSelect: PropTypes.func.isRequired,
  walkPlan: PropTypes.object,
  bikePlan: PropTypes.object,
  bikeTransitPlan: PropTypes.object,
  parkRidePlan: PropTypes.object,
  carPlan: PropTypes.object,
  weatherData: PropTypes.shape({
    temperature: PropTypes.number,
    windSpeed: PropTypes.number,
    iconId: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

StreetModeSelector.defaultProps = {
  weatherData: undefined,
  walkPlan: undefined,
  bikePlan: undefined,
  bikeTransitPlan: undefined,
  parkRidePlan: undefined,
  carPlan: undefined,
  loading: undefined,
};

StreetModeSelector.contextTypes = {
  config: PropTypes.object,
};

export default StreetModeSelector;
