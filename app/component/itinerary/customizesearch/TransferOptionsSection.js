import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from '../../Toggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';

const TransferOptionsSection = (
  { defaultSettings, transferPenaltyHigh, currentSettings },
  { executeAction },
) => {
  const avoidTransfers =
    currentSettings.transferPenalty !== defaultSettings.transferPenalty;
  return (
    <div className="mode-option-container toggle-container avoid-transfers-container">
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
              transferPenalty: avoidTransfers
                ? defaultSettings.transferPenalty
                : transferPenaltyHigh,
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
  );
};

TransferOptionsSection.propTypes = {
  defaultSettings: settingsShape.isRequired,
  currentSettings: settingsShape.isRequired,
  transferPenaltyHigh: PropTypes.number.isRequired,
};

TransferOptionsSection.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default TransferOptionsSection;
