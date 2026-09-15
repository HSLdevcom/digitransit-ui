import PropTypes from 'prop-types';
import React from 'react';
import SettingsToggle from './SettingsToggle';
import { addAnalyticsEvent } from '../../../../utils/shared/analyticsUtils';
import { settingsShape } from '../../../../utils/client/shapes';
import { useConfigContext } from '../../../client/ConfigContext';

export default function TransferOptions({ settings, updateSettings }) {
  const { transferPenaltyHigh, minTransferTimeSelection, defaultSettings } =
    useConfigContext();
  const avoidTransfers =
    settings.transferPenalty !== defaultSettings.transferPenalty;

  const onToggle = () => {
    updateSettings({
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
  settings: settingsShape.isRequired,
  updateSettings: PropTypes.func.isRequired,
};
