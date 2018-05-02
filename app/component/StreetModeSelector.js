import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import ToggleButton from './ToggleButton';

const getStreetModesToggleButtons = streetModes => {
  if (!streetModes.length) {
    return null;
  }

  return streetModes.map((streetMode, index) => (
    <ToggleButton
      key={`toggle-button-${streetMode.name}`}
      icon={streetMode.icon}
      onBtnClick={() => {}} // this.toggleStreetMode(streetMode)}
      state={null} // this.getMode(streetMode)}
      checkedClass={streetMode.name}
      label={streetMode.name}
      className={cx('small-4', {
        'first-btn': index === 0,
        'last-btn': index === streetModes.length - 1,
      })}
    />
  ));
};

class StreetModeSelector extends React.Component {
  constructor(props) {
    super(props);

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
            <h4>
              <FormattedMessage
                id="main-mode"
                defaultMessage="I'm travelling by"
              />
            </h4>
            <button
              className="noborder clear-input"
              onClick={this.toggle.bind(this, isOpen)}
            >
              <Icon img="icon-icon_close" />
            </button>
            <div className="row btn-bar">
              {getStreetModesToggleButtons(streetModes)}
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
  streetModes: PropTypes.array,
};

StreetModeSelector.defaultProps = {
  streetModes: [],
};

export default StreetModeSelector;
