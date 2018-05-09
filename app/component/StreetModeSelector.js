import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import ToggleButton from './ToggleButton';

class StreetModeSelector extends React.Component {
  constructor(props) {
    super(props);

    this.streetModes = [];
    Object.keys(this.props.streetModes).map(sm =>
      this.streetModes.push({ ...this.props.streetModes[sm], name: sm }),
    );
    this.state = {
      isOpen: false,
      selectedStreetMode: (
        this.props.selectedStreetMode ||
        Object.keys(props.streetModes).filter(
          sm => props.streetModes[sm].defaultValue,
        )[0]
      ).toLowerCase(),
    };
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
          onBtnClick={() => this.selectStreetMode(streetMode)}
          onKeyDown={e =>
            this.isKeyboardNavigationEvent(e) &&
            this.selectStreetMode(streetMode, true)
          }
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

  openDialog(applyFocus = false) {
    this.setState(
      {
        isOpen: true,
      },
      () => {
        if (this.selectedStreetModeButton && applyFocus) {
          this.selectedStreetModeButton.focus();
        }
      },
    );
  }

  closeDialog(applyFocus = false) {
    this.setState(
      {
        isOpen: false,
      },
      () => {
        if (this.toggleStreetModeSelectorButton && applyFocus) {
          this.toggleStreetModeSelectorButton.focus();
        }
      },
    );
  }

  selectStreetMode(streetMode, applyFocus = false) {
    this.setState(
      {
        selectedStreetMode: streetMode.name,
      },
      () => {
        this.closeDialog(applyFocus);
        this.props.selectStreetMode({ modes: streetMode.name.toUpperCase() });
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
                onClick={() => this.closeDialog()}
                onKeyDown={e =>
                  this.isKeyboardNavigationEvent(e) && this.closeDialog(true)
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
            onClick={() => this.openDialog()}
            onKeyDown={e =>
              this.isKeyboardNavigationEvent(e) && this.openDialog(true)
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
  selectStreetMode: PropTypes.func.isRequired,
  selectedStreetMode: PropTypes.string,
  streetModes: PropTypes.shape({
    defaultValue: PropTypes.bool,
  }),
};

StreetModeSelector.defaultProps = {
  selectedStreetMode: undefined,
  streetModes: {},
};

export default StreetModeSelector;
