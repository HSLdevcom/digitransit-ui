import PropTypes from 'prop-types';
import React from 'react';
import SettingsToggle from './SettingsToggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';
import { useConfigContext } from '../../../configurations/ConfigContext';

export default function TransferOptions(
  { currentSettings },
  { executeAction },
) {
  const { transferPenaltyHigh, minTransferTimeSelection, defaultSettings } =
    useConfigContext();
  const avoidTransfers =
    currentSettings.transferPenalty !== defaultSettings.transferPenalty;

  const onToggle = () => {
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
  };

  return (
    <SettingsToggle
      id="settings-toggle-transfers"
      labelId="avoid-transfers"
      toggled={avoidTransfers}
      onToggle={onToggle}
      borderStyle={minTransferTimeSelection ? 'border-top' : ''}
    />
  );
}

TransferOptions.propTypes = {
  currentSettings: settingsShape.isRequired,
};

TransferOptions.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
