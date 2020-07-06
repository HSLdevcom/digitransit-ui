import PropTypes from 'prop-types';
import React from 'react';
import { StreetModeSelectorButton } from './StreetModeSelectorButton';

export const StreetModeSelector = ({
  showWalkOptionButton,
  showBikeOptionButton,
  showBikeAndPublicOptionButton,
  toggleStreetMode,
  setStreetModeAndSelect,
  walkPlan,
  bikePlan,
  bikeAndPublicPlan,
}) => {
  return (
    <div className="street-mode-selector-container">
      <StreetModeSelectorButton
        icon="icon-icon_walk"
        name="walk"
        active={showWalkOptionButton}
        plan={walkPlan}
        onClick={setStreetModeAndSelect}
      />
      <StreetModeSelectorButton
        icon="icon-icon_cyclist"
        name="bike"
        active={showBikeOptionButton}
        plan={bikePlan}
        onClick={setStreetModeAndSelect}
      />
      <StreetModeSelectorButton
        icon="icon-icon_cyclist"
        name="bikeAndPublic"
        active={showBikeAndPublicOptionButton}
        plan={bikeAndPublicPlan}
        onClick={toggleStreetMode}
      />
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
};

StreetModeSelector.defaultProps = {
  walkPlan: undefined,
  bikePlan: undefined,
  bikeAndPublicPlan: undefined,
};

export default StreetModeSelector;
