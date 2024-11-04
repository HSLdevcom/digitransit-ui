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
  showScooterOptionButton,
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
  scooterRentAndPublicPlan,
  carPlan,
  carRentalPlan,
  parkRidePlan,
  onDemandTaxiPlan,
  loading,
}) => {
  const splitParkWalkAndParkRide = prPlan => {
    const parkAndWalkItineraries = prPlan?.itineraries?.filter(
      itinerary => !itinerary.legs.some(l => l.transitLeg),
    );
    const parkAndRideItineraries = prPlan?.itineraries.filter(itinerary =>
      itinerary.legs.some(l => l.transitLeg),
    );
    return {
      parkAndWalkItineraries: parkAndWalkItineraries || [],
      parkAndRideItineraries: parkAndRideItineraries || [],
    };
  };

  const { parkAndWalkItineraries, parkAndRideItineraries } = !loading
    ? splitParkWalkAndParkRide(parkRidePlan)
    : { parkAndWalkItineraries: [], parkAndRideItineraries: [] };

  const bikeAndVehicle = !loading
    ? {
        itineraries: [
          ...(bikeParkPlan?.itineraries || []),
          ...(bikeAndPublicPlan?.itineraries || []),
          ...(bikeRentAndPublicPlan?.itineraries || []),
        ],
      }
    : {};
  const carRentalOrOwn = !loading
    ? {
        itineraries: [
          ...(carPlan?.itineraries || []),
          ...parkAndWalkItineraries,
          ...(carRentalPlan?.itineraries || []),
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
          {showScooterOptionButton && (
            <StreetModeSelectorButton
              icon="icon-icon_scooter_rider"
              name="scooter"
              plan={scooterRentAndPublicPlan}
              onClick={toggleStreetMode}
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
              plan={{ itineraries: [...(parkAndRideItineraries || [])] }}
              onClick={toggleStreetMode}
            />
          )}
          {showCarOptionButton && (
            <StreetModeSelectorButton
              icon="icon-icon_car-withoutBox"
              name="car"
              plan={carRentalOrOwn}
              onClick={toggleStreetMode}
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
  showScooterOptionButton: PropTypes.bool.isRequired,
  showCarOptionButton: PropTypes.bool.isRequired,
  showParkRideOptionButton: PropTypes.bool.isRequired,
  showOnDemandTaxiOptionButton: PropTypes.bool.isRequired,
  toggleStreetMode: PropTypes.func.isRequired,
  setStreetModeAndSelect: PropTypes.func.isRequired,
  walkPlan: PropTypes.object,
  bikePlan: PropTypes.object,
  bikeAndPublicPlan: PropTypes.object,
  bikeRentAndPublicPlan: PropTypes.object,
  bikeParkPlan: PropTypes.object,
  scooterRentAndPublicPlan: PropTypes.object,
  carPlan: PropTypes.object,
  carRentalPlan: PropTypes.object,
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
  bikeRentAndPublicPlan: undefined,
  bikeParkPlan: undefined,
  scooterRentAndPublicPlan: undefined,
  carPlan: undefined,
  carRentalPlan: undefined,
  parkRidePlan: undefined,
  onDemandTaxiPlan: undefined,
  loading: undefined,
};

export default StreetModeSelector;
