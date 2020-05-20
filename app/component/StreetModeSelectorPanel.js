import PropTypes from 'prop-types';
import React from 'react';
import { matchShape } from 'found';
import { FormattedMessage } from 'react-intl';
import Toggle from './Toggle';
import Icon from './Icon';
import BikingOptionsSection from './customizesearch/BikingOptionsSection';
import { toggleStreetMode } from '../util/modeUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class StreetModeSelectorPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedStreetMode: props.selectedStreetMode };
  }

  render() {
    const { streetModeConfigs, currentSettings, defaultSettings } = this.props;
    const { config } = this.context;
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
            .filter(mode => mode.availableForSelection && !mode.defaultValue)
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
                      toggled={this.state.selectedStreetMode === mode.name}
                      onToggle={() => {
                        this.setState(
                          {
                            selectedStreetMode: toggleStreetMode(
                              mode.name.toUpperCase(),
                              config,
                            ),
                          },
                          addAnalyticsEvent({
                            action: 'SelectTravelingModeFromSettings',
                            category: 'ItinerarySettings',
                            name: this.state.selectedStreetMode,
                          }),
                        );
                      }}
                    />
                  </div>
                </div>
                {this.state.selectedStreetMode === 'BICYCLE' &&
                  mode.name === 'BICYCLE' && (
                    <BikingOptionsSection
                      bikeSpeed={currentSettings.bikeSpeed}
                      defaultSettings={defaultSettings}
                      bikeSpeedOptions={config.defaultOptions.bikeSpeed}
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
  selectedStreetMode: PropTypes.string,
  currentSettings: PropTypes.object.isRequired,
  defaultSettings: PropTypes.object.isRequired,
  streetModeConfigs: PropTypes.arrayOf(
    PropTypes.shape({
      defaultValue: PropTypes.bool.isRequired,
      icon: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
};

StreetModeSelectorPanel.contextTypes = {
  config: PropTypes.object.isRequired,
  match: matchShape.isRequired,
};

StreetModeSelectorPanel.defaultProps = {
  selectedStreetMode: undefined,
  streetModeConfigs: [],
};

export default StreetModeSelectorPanel;
