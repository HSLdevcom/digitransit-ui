/* eslint-disable jsx-a11y/label-has-associated-control */
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { isKeyboardSelectionEvent } from '../../../util/browser';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import {
  getDefaultSettings,
  hasCustomizedSettings,
} from '../../../util/planParamUtil';
import { configShape } from '../../../util/shapes';
import { getCustomizedSettings } from '../../../store/localStorage';

const RestoreDefaultSettingSection = ({ config }, { executeAction, intl }) => {
  const restoreDefaultSettings = () => {
    const customizedSettings = getCustomizedSettings(config);
    const defaultSettings = getDefaultSettings(config);
    const restoredSettings = Object.keys(customizedSettings).reduce(
      (acc, setting) => ({
        ...acc,
        [setting]: defaultSettings[setting],
      }),
      {},
    );

    executeAction(saveRoutingSettings, {
      ...restoredSettings,
    });
  };
  const userHasCustomizedSettings = hasCustomizedSettings(config);

  if (!userHasCustomizedSettings) {
    return (
      <span className="sr-only">
        <FormattedMessage
          id="restore-default-settings-aria-label-done"
          defaultMessage="Default settings are in use."
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      tabIndex="0"
      onClick={restoreDefaultSettings}
      onKeyPress={e => isKeyboardSelectionEvent(e) && restoreDefaultSettings()}
      className="noborder cursor-pointer restore-settings-button-text"
      aria-label={intl.formatMessage({
        id: 'restore-default-settings-aria-label',
        defaultMessage: 'Restore default settings',
      })}
    >
      <FormattedMessage
        id="restore-default-settings"
        defaultMessage="Restore default settings"
        values={{
          changedSettingsIndicator: userHasCustomizedSettings ? '' : '', // Indicator coming later
        }}
      />
    </button>
  );
};

RestoreDefaultSettingSection.propTypes = {
  config: configShape.isRequired,
};

RestoreDefaultSettingSection.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default RestoreDefaultSettingSection;
