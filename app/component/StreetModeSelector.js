import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import ToggleButton from './ToggleButton';

const getStreetModesToggleButtons = (
  streetModes,
  selectedStreetMode,
  toggleStreetMode,
) => {
  if (!streetModes.length) {
    return null;
  }

  return streetModes.map((streetMode, index) => (
    <ToggleButton
      key={index}
      icon={streetMode.icon}
      onBtnClick={() => toggleStreetMode(streetMode)}
      state={streetMode.name === selectedStreetMode}
      checkedClass={'selected'}
      label={streetMode.name}
    >
      <FormattedMessage
        id={`street-mode-${streetMode.name}`}
        defaultMessage={streetMode.name}
      />
    </ToggleButton>
  ));
};

class StreetModeSelector extends React.Component {
  constructor(props) {
    super(props);

    this.toggleStreetMode = this.toggleStreetMode.bind(this);
    this.state = {
      isOpen: false,
      selectedStreetMode: Object.keys(props.streetModes).filter(
        sm => props.streetModes[sm].defaultValue,
      )[0],
    };
  }

  toggle(isOpen) {
    this.setState({
      isOpen: !isOpen,
    });
  }

  toggleStreetMode(streetMode) {
    this.setState({
      isOpen: false,
      selectedStreetMode: streetMode.name,
    });
  }

  render() {
    const streetModes = [];
    Object.keys(this.props.streetModes).map(sm =>
      streetModes.push({ ...this.props.streetModes[sm], name: sm }),
    );

    const { isOpen, selectedStreetMode } = this.state;
    return (
      <div className="street-mode-selector-container">
        {isOpen ? (
          <div className="street-mode-selector-options">
            <div className="street-mode-selector-header">
              <FormattedMessage
                id="main-mode"
                defaultMessage="I'm travelling by"
              />
              <button
                className="clear-input"
                onClick={this.toggle.bind(this, isOpen)}
              >
                <Icon img="icon-icon_close" />
              </button>
            </div>
            <div className="street-mode-selector-buttons">
              {getStreetModesToggleButtons(
                streetModes,
                selectedStreetMode,
                this.toggleStreetMode,
              )}
            </div>
          </div>
        ) : (
          <div
            className="street-mode-selector-toggle"
            onClick={this.toggle.bind(this, isOpen)}
          >
            <Icon
              img={`icon-icon_${
                this.props.streetModes[selectedStreetMode].icon
              }`}
            />
          </div>
        )}
      </div>
    );
  }
}

StreetModeSelector.propTypes = {
  streetModes: PropTypes.object,
};

StreetModeSelector.defaultProps = {
  streetModes: {},
};

export default StreetModeSelector;
