/* eslint-disable jsx-a11y/label-has-associated-control */
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { isKeyboardSelectionEvent } from '../../../util/browser';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import {
  getDefaultSettings,
  getNumberOfCustomizedSettings,
} from '../../../util/planParamUtil';
import { configShape } from '../../../util/shapes';

const RestoreDefaultSettingSection = ({ config }, { executeAction }) => {
  const restoreDefaultSettings = () => {
    executeAction(saveRoutingSettings, {
      ...getDefaultSettings(config),
    });
  };
  const numberOfCustomizedSettings = getNumberOfCustomizedSettings(config);

  return (
    <button
      type="button"
      tabIndex="0"
      onClick={restoreDefaultSettings}
      onKeyPress={e => isKeyboardSelectionEvent(e) && restoreDefaultSettings()}
      className="noborder cursor-pointer restore-settings-button-text"
    >
      <FormattedMessage
        id="restore-default-settings"
        defaultMessage="Restore default settings"
        values={{ numberOfCustomizedSettings }}
      />
    </button>
  );
};

RestoreDefaultSettingSection.propTypes = {
  config: configShape.isRequired,
};

RestoreDefaultSettingSection.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default RestoreDefaultSettingSection;
