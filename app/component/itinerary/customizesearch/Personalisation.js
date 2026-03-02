import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import SettingsToggle from './SettingsToggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import Icon from '../../Icon';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';

export default function Personalisation(
  { currentSettings },
  { executeAction },
) {
  const onToggle = () => {
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${
        currentSettings.personalisation ? 'Disable' : 'Enable'
      }Personalisation`,
      name: null,
    });
    executeAction(saveRoutingSettings, {
      personalisation: !currentSettings.personalisation,
    });
  };

  return (
    <>
      <div className="section-header">
        <FormattedMessage id="personalisation" />
      </div>
      <SettingsToggle
        id="settings-toggle-personalisation"
        labelId="personal-itineraries"
        labelStyle="mode-label-upper"
        leftElement={<Icon img="icon_star-with-circle" height={2} width={2} />}
        toggled={!!currentSettings.personalisation}
        onToggle={onToggle}
      />
      <div className="toggle-info">
        <FormattedMessage id="personalisation-info" />
      </div>
    </>
  );
}

Personalisation.propTypes = {
  currentSettings: settingsShape.isRequired,
};

Personalisation.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
