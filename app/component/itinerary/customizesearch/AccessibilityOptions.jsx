import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import SettingsToggle from './SettingsToggle';
import Icon from '../../Icon';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';

export default function AccessibilityOptions({ settings, updateSettings }) {
  const onToggle = () => {
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${
        settings.accessibilityOption ? 'Disable' : 'Enable'
      }WheelChair`,
      name: null,
    });
    updateSettings({ accessibilityOption: !settings.accessibilityOption });
  };

  return (
    <>
      <div className="section-header">
        <FormattedMessage id="accessibility" />
      </div>
      <SettingsToggle
        id="settings-toggle-accessibility"
        labelId="accessibility-limited"
        labelStyle="mode-label"
        leftElement={<Icon img="icon_wheelchair" height={2} width={2} />}
        toggled={!!settings.accessibilityOption}
        onToggle={onToggle}
      />
    </>
  );
}

AccessibilityOptions.propTypes = {
  settings: settingsShape.isRequired,
  updateSettings: PropTypes.func.isRequired,
};
