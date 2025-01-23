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
    <div>
      <div
        role="button"
        tabIndex="0"
        onClick={restoreDefaultSettings}
        onKeyPress={e =>
          isKeyboardSelectionEvent(e) && restoreDefaultSettings()
        }
        aria-label="label"
        title="label"
        className="noborder cursor-pointer restore-settings-button"
      >
        <div>
          <span className="restore-settings-button-text">
            <FormattedMessage
              id="restore-default-settings"
              defaultMessage="Restore default settings"
              values={{ numberOfCustomizedSettings }}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

RestoreDefaultSettingSection.propTypes = {
  config: configShape.isRequired,
};

RestoreDefaultSettingSection.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default RestoreDefaultSettingSection;
