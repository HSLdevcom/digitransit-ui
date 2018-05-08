import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import ToggleButton from './ToggleButton';

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

  getStreetModesToggleButtons(
    streetModes,
    selectedStreetMode,
    toggleStreetMode,
  ) {
    if (!streetModes.length) {
      return null;
    }

    return streetModes.map(streetMode => {
      const { icon, name } = streetMode;
      const isSelected = name === selectedStreetMode;
      return (
        <ToggleButton
          checkedClass="selected"
          key={name}
          icon={icon}
          label={name}
          onBtnClick={() => toggleStreetMode(streetMode)}
          ref={isSelected ? 'selectedStreetModeButton' : null}
          state={isSelected}
        >
          <FormattedMessage id={`street-mode-${name}`} defaultMessage={name} />
        </ToggleButton>
      );
    });
  }

  handleKeyPress(event) {
    const KEY_SPACE = 13,
      KEY_ENTER = 32;
    if (!event || ![KEY_SPACE, KEY_ENTER].includes(event.which)) {
      return;
    }
    event.preventDefault();
    this.toggle(this.state.isOpen);
  }

  toggle(isOpen) {
    this.setState({
      isOpen: !isOpen,
    });
  }

  toggleStreetMode(streetMode) {
    this.setState(
      {
        isOpen: false,
        selectedStreetMode: streetMode.name,
      },
      () => {
        this.refs.toggleStreetModeSelectorButton.focus();
      },
    );
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
                onClick={() => this.toggle(isOpen)}
              >
                <Icon img="icon-icon_close" />
              </button>
            </div>
            <div className="street-mode-selector-buttons">
              {this.getStreetModesToggleButtons(
                streetModes,
                selectedStreetMode,
                this.toggleStreetMode,
              )}
            </div>
          </div>
        ) : (
          <div
            className="street-mode-selector-toggle"
            onClick={() => this.toggle(isOpen)}
            onKeyDown={event => this.handleKeyPress(event)}
            ref="toggleStreetModeSelectorButton"
            role="button"
            tabIndex="0"
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
  streetModes: PropTypes.shape({
    defaultValue: PropTypes.bool,
  }),
};

StreetModeSelector.defaultProps = {
  streetModes: {},
};

export default StreetModeSelector;
