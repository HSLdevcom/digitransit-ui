import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import ToggleButton from './ToggleButton';
import { isKeyboardSelectionEvent } from '../util/browser';

class StreetModeSelectorPanel extends React.Component {
  getStreetModeSelectButtons() {
    const {
      selectedStreetMode,
      showButtonTitles,
      streetModeConfigs,
    } = this.props;

    if (!streetModeConfigs.length) {
      return null;
    }

    return streetModeConfigs.map(streetMode => {
      const { exclusive, icon, name } = streetMode;
      const isSelected = name === selectedStreetMode;
      const labelId = `street-mode-${name.toLowerCase()}`;
      return (
        <ToggleButton
          checkedClass="selected"
          key={name}
          icon={icon}
          label={labelId}
          onBtnClick={() => this.selectStreetMode(name, exclusive)}
          onKeyDown={e =>
            isKeyboardSelectionEvent(e) &&
            this.selectStreetMode(name, exclusive)
          }
          showButtonTitle={showButtonTitles}
          state={isSelected}
        />
      );
    });
  }

  selectStreetMode(name, exclusive) {
    this.props.selectStreetMode(name.toUpperCase(), exclusive);
  }

  render() {
    return (
      <div className={cx('street-mode-selector-panel', this.props.className)}>
        <div className="street-mode-selector-panel-header">
          <FormattedMessage id="main-mode" defaultMessage="I'm travelling by" />
        </div>
        <div className="street-mode-selector-panel-buttons">
          {this.getStreetModeSelectButtons()}
        </div>
      </div>
    );
  }
}

StreetModeSelectorPanel.propTypes = {
  className: PropTypes.string,
  selectStreetMode: PropTypes.func.isRequired,
  selectedStreetMode: PropTypes.string,
  showButtonTitles: PropTypes.bool,
  streetModeConfigs: PropTypes.arrayOf(
    PropTypes.shape({
      defaultValue: PropTypes.bool.isRequired,
      icon: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
};

StreetModeSelectorPanel.defaultProps = {
  className: undefined,
  selectedStreetMode: undefined,
  showButtonTitles: false,
  streetModeConfigs: [],
};

export default StreetModeSelectorPanel;
