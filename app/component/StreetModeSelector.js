import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { StreetModeSelectorButton } from './StreetModeSelectorButton';

export const StreetModeSelector = ({
  showWalkOptionButton,
  onButtonClick,
  walkItinerary,
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
    </div>
  );
};

StreetModeSelector.propTypes = {
  showWalkOptionButton: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  walkItinerary: PropTypes.object.isRequired,
};

StreetModeSelector.contextTypes = {
  config: PropTypes.object.isRequired,
  router: routerShape,
  match: matchShape.isRequired,
};

export default StreetModeSelector;
