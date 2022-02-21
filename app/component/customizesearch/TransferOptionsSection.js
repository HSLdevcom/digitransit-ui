import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from './Toggle';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

const TransferOptionsSection = (
  { defaultSettings, walkBoardCostHigh, currentSettings },
  { executeAction },
) => {
  const avoidTransfers =
    currentSettings.walkBoardCost !== defaultSettings.walkBoardCost;
  return (
    <React.Fragment>
      <div className="mode-option-container toggle-container avoid-transfers-container">
        {/* eslint jsx-a11y/label-has-associated-control: ["error", { assert: "either" } ] */}
        <label htmlFor="settings-toggle-transfers" className="settings-header">
          <FormattedMessage
            id="avoid-transfers"
            defaultMessage="Avoid transfers"
          />
          <Toggle
            id="settings-toggle-transfers"
            toggled={avoidTransfers}
            onToggle={() => {
              executeAction(saveRoutingSettings, {
                walkBoardCost: avoidTransfers
                  ? defaultSettings.walkBoardCost
                  : walkBoardCostHigh,
              });
              addAnalyticsEvent({
                category: 'ItinerarySettings',
                action: 'changeNumberOfTransfers',
                name: avoidTransfers,
              });
            }}
            title="transfers"
          />
        </label>
      </div>
    </React.Fragment>
  );
};

TransferOptionsSection.propTypes = {
  defaultSettings: PropTypes.shape({
    walkBoardCost: PropTypes.number.isRequired,
  }).isRequired,
  currentSettings: PropTypes.object.isRequired,
  walkBoardCostHigh: PropTypes.number.isRequired,
};

TransferOptionsSection.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default TransferOptionsSection;
