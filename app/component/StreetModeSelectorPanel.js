import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from 'material-ui/Toggle';
import Icon from './Icon';
import BikingOptionsSection from './customizesearch/BikingOptionsSection';

// eslint-disable-next-line react/prefer-stateless-function
class StreetModeSelectorPanel extends React.Component {
  render() {
    const {
      selectedStreetMode,
      streetModeConfigs,
      currentSettings,
      defaultSettings,
    } = this.props;
    if (!streetModeConfigs.length) {
      return null;
    }
    return (
      <React.Fragment>
        <div className="transport-modes-container">
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
                    <Icon
                      className={`${mode}-icon`}
                      img={`icon-icon_${mode.icon}`}
                    />
                  </div>
                  <Toggle
                    toggled={selectedStreetMode === mode.name}
                    defaultMessage={mode.name}
                    onToggle={() =>
                      this.props.selectStreetMode(mode.name.toUpperCase())
                    }
                    style={{ top: '12px', width: 'auto' }}
                  />
                </div>
                {selectedStreetMode === 'BICYCLE' &&
                  mode.name === 'BICYCLE' && (
                    <div>
                      <BikingOptionsSection
                        bikeSpeed={currentSettings.bikeSpeed}
                        defaultSettings={defaultSettings}
                      />
                    </div>
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
  currentSettings: PropTypes.arrayOf(
    PropTypes.shape({
      walkReluctance: PropTypes.string.isRequired,
    }),
  ).isRequired,
  defaultSettings: PropTypes.array.isRequired,
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
