import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import without from 'lodash/without';
import SharingOperatorSelector from './SharingOperatorSelector';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';
import {
  getCurrentSharingOperators,
  getSharingOperatorsByFormFactor,
} from '../../util/citybikes';
import Icon from '../Icon';
import Toggle from './Toggle';

const formFactorsAndDefaultMessages = {
  bicycle: 'Citybikes',
  scooter: 'Scooters',
  cargo_bicycle: 'Cargo bikes',
  car: 'Cars',
};
/**
 * SharingSettingsPanel controls the setting `allowedVehicleRentalFormFactors`,
 * a list of currently enabled formFactors.
 */
const SharingSettingsPanel = (
  { currentSettings, defaultSettings },
  { config, intl, executeAction },
) => {
  const onToggle = (propName, formFactor) => {
    const action = {};
    const settings = currentSettings[propName] || defaultSettings[propName];
    action[propName] = settings.includes(formFactor)
      ? without(currentSettings[propName], formFactor)
      : currentSettings[propName].concat([formFactor]);
    executeAction(saveRoutingSettings, action);
  };

  return (
    <>
      <div className="settings-section">
        <div className="settings-option-container">
          <div className="transport-mode-subheader settings-header">
            <FormattedMessage
              id="pick-rental-mode"
              defaultMessage="Your rental modes and operators"
            />
          </div>
          {Object.entries(formFactorsAndDefaultMessages).map(
            ([formFactor, defaultMessage]) => {
              // TODO if any provider exists for this formFactor, we show the option container, else nothing
              const operators = getSharingOperatorsByFormFactor(
                formFactor,
                config,
              );

              return operators.length > 0 ? (
                <div key={`mode-option-rental-${formFactor}`}>
                  <div className="mode-option-container">
                    <div className="mode-option-block">
                      <div className="mode-icon">
                        <Icon
                          className={`${formFactor}-icon`}
                          img={`icon-icon_rental_${formFactor}`}
                          height={1}
                          width={1}
                        />
                      </div>
                      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                      <label
                        className="mode-name"
                        htmlFor={`settings-toggle-rental-${formFactor}`}
                      >
                        <FormattedMessage
                          className="modeName"
                          id={`sharing-operators-${formFactor}-header`}
                          defaultMessage={intl.formatMessage({
                            id: `sharing-operators-${formFactor}-header`,
                            defaultMessage,
                          })}
                        />
                        <Toggle
                          id={`settings-toggle-rental-${formFactor}`}
                          toggled={(
                            currentSettings.allowedVehicleRentalFormFactors ||
                            defaultSettings.allowedVehicleRentalFormFactors
                          ).includes(formFactor)}
                          onToggle={() =>
                            onToggle(
                              'allowedVehicleRentalFormFactors',
                              formFactor,
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                  {currentSettings.allowedVehicleRentalFormFactors.includes(
                    formFactor,
                  ) ? (
                    <fieldset>
                      <div className="transport-modes-container level2">
                        <SharingOperatorSelector
                          currentOptions={getCurrentSharingOperators(
                            config,
                            formFactor,
                          )}
                          formFactor={formFactor}
                        />
                      </div>
                    </fieldset>
                  ) : null}
                </div>
              ) : null;
            },
          )}
        </div>
      </div>
    </>
  );
};

SharingSettingsPanel.propTypes = {
  currentSettings: PropTypes.object.isRequired,
  defaultSettings: PropTypes.object.isRequired,
};

SharingSettingsPanel.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default SharingSettingsPanel;
