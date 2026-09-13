import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import React, { useState } from 'react';
import Icon from '../../Icon.jsx';
import StreetModeSelector from './StreetModeSelector.jsx';
import TransportModes from './TransportModes.jsx';
import WalkingOptions from './WalkingOptions.jsx';
import Personalization from './Personalization.jsx';
import MinTransferTime from './MinTransferTime.jsx';
import AccessibilityOptions from './AccessibilityOptions.jsx';
import TransferOptions from './TransferOptions.jsx';
import CityBikes from './CityBikes.jsx';
import Scooters from './Scooters.jsx';
import TaxiOptions from './TaxiOptions.jsx';
import RestoreDefaultSettings from './RestoreDefaultSettings.jsx';
import {
  showModeSettings,
  useCitybikes,
  useScooters,
} from '../../../util/modeUtils.js';
import { getSettings } from '../../../util/planParamUtil.js';
import {
  getCustomizedSettings,
  setCustomizedSettings,
} from '../../../data/localStorage.js';
import ScrollableWrapper from '../../ScrollableWrapper.jsx';
import { useConfigContext } from '../../../configurations/ConfigContext.jsx';

export default function CustomizeSearch({ onToggleClick, mobile }) {
  const config = useConfigContext();
  const intl = useIntl();
  const [settings, setSettings] = useState(getSettings(config));

  const updateSettings = modifications => {
    const storedSettings = getCustomizedSettings();
    // store only values user has changed, defaults not included
    setCustomizedSettings({ ...storedSettings, ...modifications });
    // change state to trigger render
    setSettings(getSettings(config));
  };

  const backIcon = mobile ? (
    <Icon img="icon_arrow-collapse--left" />
  ) : (
    <Icon className="close-icon" img="icon_close" />
  );
  return (
    <div className="customize-search">
      <div className="settings-section">
        <div className="settings-header">
          <button
            aria-label={intl.formatMessage({ id: 'close-settings' })}
            type="button"
            className="close-offcanvas"
            onClick={() => {
              // Move focus back to the button that opened settings window
              const openSettingsButton = document.querySelector(
                '.open-advanced-settings-window-button',
              );
              if (openSettingsButton) {
                openSettingsButton.focus();
              }
              onToggleClick();
            }}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          >
            {backIcon}
          </button>
          <h1>{intl.formatMessage({ id: 'settings' })}</h1>
        </div>
        <div
          className="separator"
          style={{ marginLeft: '-16px', width: 'calc(100% + 32px' }}
        />
      </div>
      <ScrollableWrapper>
        <div className="settings-section">
          <WalkingOptions settings={settings} updateSettings={updateSettings} />
        </div>
        {config.personalization && (
          <div className="settings-section">
            <Personalization
              settings={settings}
              updateSettings={updateSettings}
            />
          </div>
        )}
        <div className="settings-section">
          {showModeSettings(config) && (
            <TransportModes updateSettings={updateSettings} />
          )}
          {config.minTransferTimeSelection && (
            <MinTransferTime
              minTransferTimeOptions={config.minTransferTimeSelection}
              settings={settings}
              updateSettings={updateSettings}
            />
          )}
          <TransferOptions
            settings={settings}
            updateSettings={updateSettings}
          />
        </div>
        {useCitybikes(config.vehicleRental?.networks, config) && (
          <div className="settings-section">
            <CityBikes updateSettings={updateSettings} />
          </div>
        )}
        <div className="settings-section">
          <StreetModeSelector
            settings={settings}
            updateSettings={updateSettings}
          />
        </div>
        <div className="settings-section">
          <AccessibilityOptions
            settings={settings}
            updateSettings={updateSettings}
          />
        </div>
        {useScooters(config) && (
          <div className="settings-section">
            <Scooters updateSettings={updateSettings} />
          </div>
        )}
        {(config.flex.external.enabled || config.taxiZone.enabled) &&
          config.transportModes.taxi.availableForSelection && (
            <div className="settings-section">
              <TaxiOptions
                settings={settings}
                updateSettings={updateSettings}
              />
            </div>
          )}
        <RestoreDefaultSettings updateSettings={updateSettings} />
      </ScrollableWrapper>
    </div>
  );
}

CustomizeSearch.propTypes = {
  onToggleClick: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
};

CustomizeSearch.defaultProps = { mobile: false };
