import cx from 'classnames';
import PropTypes from 'prop-types';
import { find } from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import ToggleButton from './ToggleButton';

const isKeyboardNavigationEvent = event => {
  const KEY_SPACE = 13;
  const KEY_ENTER = 32;

  if (!event || ![KEY_SPACE, KEY_ENTER].includes(event.which)) {
    return false;
  }
  event.preventDefault();
  return true;
};

class StreetModeSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      selectedStreetMode: props.selectedStreetMode,
    };
  }

  getStreetModeSelectButtons() {
    const { streetModeConfigs } = this.props;
    const { selectedStreetMode } = this.state;

    if (!streetModeConfigs.length) {
      return null;
    }

    return streetModeConfigs.map(streetMode => {
      const { icon, name } = streetMode;
      const isSelected = name === selectedStreetMode;
      const lowerCaseName = name.toLowerCase();
      return (
        <ToggleButton
          checkedClass="selected"
          key={name}
          icon={icon}
          label={lowerCaseName}
          onBtnClick={() => this.selectStreetMode(name)}
          onKeyDown={e =>
            isKeyboardNavigationEvent(e) && this.selectStreetMode(name, true)
          }
          buttonRef={ref => {
            if (ref && isSelected) {
              this.selectedStreetModeButton = ref;
            }
          }}
          state={isSelected}
        >
          <FormattedMessage
            id={`street-mode-${lowerCaseName}`}
            defaultMessage={name}
          />
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
        selectedStreetMode: streetMode,
      },
      () => {
        this.closeDialog(applyFocus);
        this.props.selectStreetMode(streetMode.toUpperCase());
      },
    );
  }

  render() {
    const { openingDirection, streetModeConfigs } = this.props;
    const { isOpen, selectedStreetMode } = this.state;

    return (
      <div className="street-mode-selector-container">
        {isOpen ? (
          <div
            className={cx('street-mode-selector-options', {
              'direction-up': openingDirection === 'up',
            })}
          >
            <div className="street-mode-selector-header">
              <FormattedMessage
                id="main-mode"
                defaultMessage="I'm travelling by"
              />
              <button
                className="clear-input"
                onClick={() => this.closeDialog()}
                onKeyDown={e =>
                  isKeyboardNavigationEvent(e) && this.closeDialog(true)
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
              isKeyboardNavigationEvent(e) && this.openDialog(true)
            }
            ref={ref => {
              this.toggleStreetModeSelectorButton = ref;
            }}
            role="button"
            tabIndex="0"
          >
            <Icon
              img={`icon-icon_${
                find(streetModeConfigs, sm => sm.name === selectedStreetMode)
                  .icon
              }`}
            />
          </div>
        )}
      </div>
    );
  }
}

StreetModeSelector.propTypes = {
  openingDirection: PropTypes.oneOf(['up', 'down']),
  selectStreetMode: PropTypes.func.isRequired,
  selectedStreetMode: PropTypes.string,
  streetModeConfigs: PropTypes.arrayOf(
    PropTypes.shape({
      defaultValue: PropTypes.bool.isRequired,
      icon: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
};

StreetModeSelector.defaultProps = {
  openingDirection: 'down',
  selectedStreetMode: undefined,
  streetModeConfigs: [],
};

export default StreetModeSelector;
