import PropTypes from 'prop-types';
import React from 'react';
import { StreetModeSelectorButton } from './StreetModeSelectorButton';

export const StreetModeSelector = ({
  showWalkOptionButton,
  showBikeOptionButton,
  onButtonClick,
  walkPlan,
  bikePlan,
}) => {
  return (
    <div className="street-mode-selector-container">
      <StreetModeSelectorButton
        icon="icon-icon_walk"
        name="walk"
        active={showWalkOptionButton}
        plan={walkPlan}
        onClick={onButtonClick}
      />
      <StreetModeSelectorButton
        icon="icon-icon_cyclist"
        name="bike"
        active={showBikeOptionButton}
        plan={bikePlan}
        onClick={onButtonClick}
      />
    </div>
  );
};

StreetModeSelector.propTypes = {
  showWalkOptionButton: PropTypes.bool.isRequired,
  showBikeOptionButton: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  walkPlan: PropTypes.object,
  bikePlan: PropTypes.object,
};

export default StreetModeSelector;
