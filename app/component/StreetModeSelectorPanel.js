import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from './Toggle';
import Icon from './Icon';
import BikingOptionsSection from './customizesearch/BikingOptionsSection';

// eslint-disable-next-line react/prefer-stateless-function
class StreetModeSelectorPanel extends React.Component {
  render() {
    const {
      selectStreetMode,
      selectedStreetMode,
      streetModeConfigs,
      currentSettings,
      defaultSettings,
      defaultOptions,
    } = this.props;
    if (!streetModeConfigs.length) {
      return null;
    }
    return (
      <React.Fragment>
        <div className="street-modes-container">
          <div className="transport-mode-subheader">
            <FormattedMessage
              id="pick-street-mode"
              defaultMessage="Your own transportation modes"
            />
          </div>
          {streetModeConfigs
            .filter(mode => mode.availableForSelection)
            .map(mode => (
              <div key={`mode-option-${mode.name}`}>
                <div className="mode-option-container">
                  <div className="mode-option-block">
                    <div className="mode-icon">
                      <Icon
                        className={`${mode}-icon`}
                        img={`icon-icon_${mode.icon}`}
                      />
                    </div>
                    <div className="mode-name">
                      <FormattedMessage
                        className="mode-name"
                        id={mode.name.toLowerCase()}
                        defaultMessage={mode.name.toLowerCase()}
                      />
                    </div>
                  </div>
                  <div>
                    <Toggle
                      toggled={selectedStreetMode === mode.name}
                      onToggle={() => selectStreetMode(mode.name.toUpperCase())}
                    />
                  </div>
                </div>
                {selectedStreetMode === 'BICYCLE' &&
                  mode.name === 'BICYCLE' && (
                    <BikingOptionsSection
                      bikeSpeed={currentSettings.bikeSpeed}
                      defaultSettings={defaultSettings}
                      bikeSpeedOptions={defaultOptions.bikeSpeed}
                    />
                  )}
              </div>
            ))}
        </div>
      </React.Fragment>
    );
  }
}

StreetModeSelectorPanel.propTypes = {
  selectStreetMode: PropTypes.func.isRequired,
  selectedStreetMode: PropTypes.string,
  currentSettings: PropTypes.object.isRequired,
  defaultSettings: PropTypes.object.isRequired,
  defaultOptions: PropTypes.object.isRequired,
  streetModeConfigs: PropTypes.arrayOf(
    PropTypes.shape({
      defaultValue: PropTypes.bool.isRequired,
      icon: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
};

StreetModeSelectorPanel.defaultProps = {
  selectedStreetMode: undefined,
  streetModeConfigs: [],
};

export default StreetModeSelectorPanel;
