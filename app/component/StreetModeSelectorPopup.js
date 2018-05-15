import cx from 'classnames';
import PropTypes from 'prop-types';
import { find } from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import ToggleButton from './ToggleButton';
import { isKeyboardSelectionEvent } from '../util/browser';

class StreetModeSelectorPopup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };
  }

  getStreetModeSelectButtons() {
    const { selectedStreetMode, streetModeConfigs } = this.props;

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
            isKeyboardSelectionEvent(e) && this.selectStreetMode(name, true)
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
    this.props.selectStreetMode(streetMode.toUpperCase());
    this.closeDialog(applyFocus);
  }

  render() {
    const {
      openingDirection,
      selectedStreetMode,
      streetModeConfigs,
    } = this.props;
    const { isOpen } = this.state;

    return (
      <div className="street-mode-selector-popup-container">
        {isOpen ? (
          <div
            className={cx('street-mode-selector-popup-options', {
              'direction-up': openingDirection === 'up',
            })}
          >
            <div className="street-mode-selector-popup-header">
              <FormattedMessage
                id="main-mode"
                defaultMessage="I'm travelling by"
              />
              <button
                className="clear-input"
                onClick={() => this.closeDialog()}
                onKeyDown={e =>
                  isKeyboardSelectionEvent(e) && this.closeDialog(true)
                }
              >
                <Icon img="icon-icon_close" />
              </button>
            </div>
            <div className="street-mode-selector-popup-buttons">
              {this.getStreetModeSelectButtons()}
            </div>
          </div>
        ) : (
          <div
            className="street-mode-selector-popup-toggle"
            onClick={() => this.openDialog()}
            onKeyDown={e =>
              isKeyboardSelectionEvent(e) && this.openDialog(true)
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

StreetModeSelectorPopup.propTypes = {
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

StreetModeSelectorPopup.defaultProps = {
  openingDirection: 'down',
  selectedStreetMode: undefined,
  streetModeConfigs: [],
};

export default StreetModeSelectorPopup;
