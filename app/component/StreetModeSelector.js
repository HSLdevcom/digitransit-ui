import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import ToggleButton from './ToggleButton';

class StreetModeSelector extends React.Component {
  constructor(props) {
    super(props);

    this.selectStreetMode = this.selectStreetMode.bind(this);
    this.streetModes = [];
    Object.keys(this.props.streetModes).map(sm =>
      this.streetModes.push({ ...this.props.streetModes[sm], name: sm }),
    );
    this.state = {
      isOpen: false,
      selectedStreetMode: Object.keys(props.streetModes).filter(
        sm => props.streetModes[sm].defaultValue,
      )[0],
    };
  }

  getStreetModeSelectButtons() {
    if (!this.streetModes.length) {
      return null;
    }

    const { selectedStreetMode } = this.state;

    return this.streetModes.map(streetMode => {
      const { icon, name } = streetMode;
      const isSelected = name === selectedStreetMode;
      return (
        <ToggleButton
          checkedClass="selected"
          key={name}
          icon={icon}
          label={name}
          onBtnClick={event => this.selectStreetMode(event, streetMode)}
          onKeyDown={event => this.selectStreetMode(event, streetMode)}
          buttonRef={ref => {
            if (ref && isSelected) {
              this.selectedStreetModeButton = ref;
            }
          }}
          state={isSelected}
        >
          <FormattedMessage id={`street-mode-${name}`} defaultMessage={name} />
        </ToggleButton>
      );
    });
  }

  isKeyboardNavigationEvent(event) {
    const KEY_SPACE = 13,
      KEY_ENTER = 32;
    if (!event || ![KEY_SPACE, KEY_ENTER].includes(event.which)) {
      return false;
    }
    event.preventDefault();
    return true;
  }

  toggle(isOpen, applyFocus = false) {
    this.setState(
      {
        isOpen: !isOpen,
      },
      () => {
        if (this.state.isOpen && this.selectedStreetModeButton && applyFocus) {
          this.selectedStreetModeButton.focus();
        }
      },
    );
  }

  selectStreetMode(event, streetMode) {
    const KEY_SPACE = 13,
      KEY_ENTER = 32;
    const isKeyboardEvent = event.type === 'keydown';

    if (
      !event ||
      (isKeyboardEvent && ![KEY_SPACE, KEY_ENTER].includes(event.which))
    ) {
      return;
    }

    this.setState(
      {
        isOpen: false,
        selectedStreetMode: streetMode.name,
      },
      () => {
        if (isKeyboardEvent) {
          this.toggleStreetModeSelectorButton.focus();
        }
      },
    );
  }

  render() {
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
                onKeyDown={e =>
                  this.isKeyboardNavigationEvent(e) && this.toggle(isOpen, true)
                }
              >
                <Icon img="icon-icon_close" />
              </button>
            </div>
            <div className="street-mode-selector-buttons">
              {this.getStreetModeSelectButtons()}
            </div>
          </div>
        ) : (
          <div
            className="street-mode-selector-toggle"
            onClick={() => this.toggle(isOpen)}
            onKeyDown={e =>
              this.isKeyboardNavigationEvent(e) && this.toggle(isOpen, true)
            }
            ref={ref => (this.toggleStreetModeSelectorButton = ref)}
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
