/* eslint-disable jsx-a11y/label-has-associated-control */
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';

import cx from 'classnames';
import { configShape } from '../../../util/shapes';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import Toggle from '../../Toggle';
import Icon from '../../Icon';
import {
  getTransitModes,
  getModes,
  toggleTransportMode,
} from '../../../util/modeUtils';

const TransportModesSection = ({ config }, { executeAction }) => {
  const { iconColors } = config.colors;
  const alternativeNames = config.useAlternativeNameForModes || [];
  const transitModes = getTransitModes(config);
  const selectedModes = getModes(config);

  return (
    <fieldset>
      <legend className="transport-mode-subheader settings-header">
        <FormattedMessage
          id="pick-mode"
          defaultMessage="Transportation modes"
        />
      </legend>
      <div className="transport-modes-container">
        {transitModes.map(mode => (
          <div
            className="mode-option-container"
            key={`mode-option-${mode.toLowerCase()}`}
          >
            <label
              htmlFor={`settings-toggle-${mode}`}
              className={cx(
                [`mode-option-block`, 'toggle-label'],
                mode.toLowerCase(),
                {
                  disabled: !selectedModes.includes(mode),
                },
              )}
            >
              <div className="mode-icon">
                <Icon
                  className={`${mode}-icon`}
                  img={`icon-icon_${mode.toLowerCase()}`}
                  color={
                    iconColors[
                      mode.toLowerCase() === 'subway'
                        ? 'mode-metro'
                        : `mode-${mode.toLowerCase()}`
                    ]
                  }
                />
              </div>
              <div className="mode-name">
                <FormattedMessage
                  id={
                    alternativeNames.includes(mode.toLowerCase())
                      ? `settings-alternative-name-${mode.toLowerCase()}`
                      : mode.toLowerCase()
                  }
                  defaultMessage={mode.toLowerCase()}
                />
              </div>
              <Toggle
                id={`settings-toggle-${mode}`}
                toggled={selectedModes.includes(mode)}
                onToggle={() =>
                  executeAction(saveRoutingSettings, {
                    modes: toggleTransportMode(mode, config),
                  })
                }
              />
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

TransportModesSection.propTypes = {
  config: configShape.isRequired,
};

TransportModesSection.contextTypes = {
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default TransportModesSection;
