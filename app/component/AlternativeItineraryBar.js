import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { configShape, planShape } from '../util/shapes';
import StreetModeSelectorButton from './StreetModeSelectorButton';
import StreetModeSelectorWeather from './StreetModeSelectorWeather';
import StreetModeSelectorShimmer from './StreetModeSelectorShimmer';
import { streetHash } from '../util/path';

export default function AlternativeItineraryBar(
  {
    selectStreetMode,
    setStreetModeAndSelect,
    weatherData,
    walkPlan,
    bikePlan,
    bikePublicPlan,
    carPlan,
    parkRidePlan,
    loading,
  },
  { config },
) {
  return (
    <div className="street-mode-selector-container">
      <StreetModeSelectorShimmer loading={loading} />
      {!loading && (
        <div className="street-mode-button-row">
          {weatherData && (
            <StreetModeSelectorWeather weatherData={weatherData} />
          )}
          {walkPlan?.edges?.length > 0 && (
            <StreetModeSelectorButton
              icon="icon-icon_walk"
              name={streetHash.walk}
              plan={walkPlan}
              onClick={setStreetModeAndSelect}
            />
          )}
          {bikePlan?.edges?.length > 0 && (
            <StreetModeSelectorButton
              icon="icon-icon_cyclist"
              name={streetHash.bike}
              plan={bikePlan}
              onClick={setStreetModeAndSelect}
            />
          )}
          {bikePublicPlan?.edges?.length > 0 && (
            <StreetModeSelectorButton
              icon="icon-icon_cyclist"
              name={streetHash.bikeAndVehicle}
              plan={bikePublicPlan}
              onClick={selectStreetMode}
            />
          )}

          {parkRidePlan?.edges?.length > 0 && (
            <StreetModeSelectorButton
              icon="icon-icon_car-withoutBox"
              name={streetHash.parkAndRide}
              plan={parkRidePlan}
              onClick={selectStreetMode}
            />
          )}
          {carPlan?.edges?.length > 0 && (
            <StreetModeSelectorButton
              icon="icon-icon_car-withoutBox"
              name={streetHash.car}
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
}

AlternativeItineraryBar.propTypes = {
  selectStreetMode: PropTypes.func.isRequired,
  setStreetModeAndSelect: PropTypes.func.isRequired,
  walkPlan: planShape,
  bikePlan: planShape,
  bikePublicPlan: planShape,
  parkRidePlan: planShape,
  carPlan: planShape,
  weatherData: PropTypes.shape({
    temperature: PropTypes.number,
    windSpeed: PropTypes.number,
    iconId: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

AlternativeItineraryBar.defaultProps = {
  weatherData: undefined,
  walkPlan: undefined,
  bikePlan: undefined,
  bikePublicPlan: undefined,
  parkRidePlan: undefined,
  carPlan: undefined,
  loading: undefined,
};

AlternativeItineraryBar.contextTypes = {
  config: configShape,
};
