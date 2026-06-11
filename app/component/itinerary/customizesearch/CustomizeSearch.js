import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import React, { useState } from 'react';
import Icon from '../../Icon';
import StreetModeSelector from './StreetModeSelector';
import TransportModes from './TransportModes';
import WalkingOptions from './WalkingOptions';
import Personalization from './Personalization';
import MinTransferTime from './MinTransferTime';
import AccessibilityOptions from './AccessibilityOptions';
import TransferOptions from './TransferOptions';
import CityBikes from './CityBikes';
import Scooters from './Scooters';
import TaxiOptions from './TaxiOptions';
import RestoreDefaultSettings from './RestoreDefaultSettings';
import {
  showModeSettings,
  useCitybikes,
  useScooters,
} from '../../../util/modeUtils';
import { getSettings } from '../../../util/planParamUtil';
import {
  getCustomizedSettings,
  setCustomizedSettings,
} from '../../../store/localStorage';
import ScrollableWrapper from '../../ScrollableWrapper';
import { useConfigContext } from '../../../configurations/ConfigContext';

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
        {config.flex.external.enabled &&
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
