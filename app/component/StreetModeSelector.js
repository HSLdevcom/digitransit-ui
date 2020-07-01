import PropTypes from 'prop-types';
import React from 'react';
import { StreetModeSelectorButton } from './StreetModeSelectorButton';

export const StreetModeSelector = ({
  showWalkOptionButton,
  showBikeOptionButton,
  onButtonClick,
  walkItinerary,
  bikeItinerary,
}) => {
  return (
    <div className="street-mode-selector-container">
      <StreetModeSelectorButton
        icon="icon-icon_walk"
        name="walk"
        active={showWalkOptionButton}
        itinerary={walkItinerary}
        onClick={onButtonClick}
      />
      <StreetModeSelectorButton
        icon="icon-icon_cyclist"
        name="bike"
        active={showBikeOptionButton}
        itinerary={bikeItinerary}
        onClick={onButtonClick}
      />
    </div>
  );
};

StreetModeSelector.propTypes = {
  showWalkOptionButton: PropTypes.bool.isRequired,
  showBikeOptionButton: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  walkItinerary: PropTypes.object.isRequired,
  bikeItinerary: PropTypes.object.isRequired,
};

export default StreetModeSelector;
