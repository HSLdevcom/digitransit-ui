import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import SettingsToggle from './SettingsToggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';
import Icon from '../../Icon';
import { useConfigContext } from '../../../configurations/ConfigContext';

export default function TaxiOptions({ currentSettings }, { executeAction }) {
  const config = useConfigContext();
  const taxiLabelId =
    config.flex.settingLabelOverride || 'taxis-and-ride-hailing';
  const taxiRoutingState = currentSettings.includeTaxiSuggestions
    ? 'Disable'
    : 'Enable';
  const onToggle = () => {
    executeAction(saveRoutingSettings, {
      includeTaxiSuggestions: !currentSettings.includeTaxiSuggestions,
    });
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${taxiRoutingState}Taxis`,
      name: 'includeTaxiSuggestions',
    });
  };

  return (
    <>
      <div className="section-header">
        <FormattedMessage id={taxiLabelId} />
      </div>
      <SettingsToggle
        id="settings-toggle-taxi"
        labelId={taxiLabelId}
        labelStyle="mode-label"
        leftElement={
          <Icon
            className="taxi-icon"
            img="icon_taxi-external"
            height={2}
            width={2}
          />
        }
        toggled={!!currentSettings.includeTaxiSuggestions}
        onToggle={onToggle}
      />
    </>
  );
}

TaxiOptions.propTypes = { currentSettings: settingsShape.isRequired };
TaxiOptions.contextTypes = { executeAction: PropTypes.func.isRequired };
