import PropTypes from 'prop-types';
import React from 'react';
import SettingsButton from './SettingsButton';
import DatetimepickerContainer from '../DatetimepickerContainer';
import { useConfigContext } from '../../configurations/ConfigContext';

export default function SearchSettings({ toggleSettings }) {
  const config = useConfigContext();

  return (
    <div className="searchsettings-container">
      <DatetimepickerContainer
        realtime={false}
        embedWhenClosed={
          !config.hideItinerarySettings && (
            <div className="open-advanced-settings">
              <SettingsButton onToggleClick={toggleSettings} />
            </div>
          )
        }
        embedWhenOpen={
          <div className="open-embed-container">
            <div className="open-advanced-settings open-embed">
              {!config.hideItinerarySettings && (
                <SettingsButton onToggleClick={toggleSettings} />
              )}
            </div>
          </div>
        }
      />
    </div>
  );
}

SearchSettings.propTypes = {
  toggleSettings: PropTypes.func.isRequired,
};
