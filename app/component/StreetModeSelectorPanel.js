import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import ToggleButton from './ToggleButton';
import { isKeyboardSelectionEvent } from '../util/browser';

class StreetModeSelectorPanel extends React.Component {
  getStreetModeSelectButtons() {
    const { selectedStreetMode, streetModeConfigs } = this.props;

    if (!streetModeConfigs.length) {
      return null;
    }

    return streetModeConfigs.map(streetMode => {
      const { exclusive, icon, name } = streetMode;
      const isSelected = name === selectedStreetMode;
      return (
        <ToggleButton
          checkedClass="selected"
          key={name}
          icon={icon}
          label={`street-mode-${name.toLowerCase()}`}
          onBtnClick={() => this.selectStreetMode(name, exclusive)}
          onKeyDown={e =>
            isKeyboardSelectionEvent(e) &&
            this.selectStreetMode(name, exclusive)
          }
          state={isSelected}
          viewId={this.props.viewId}
        />
      );
    });
  }

  selectStreetMode(name, exclusive) {
    this.props.selectStreetMode(name.toUpperCase(), exclusive);
  }

  render() {
    return (
      <div className={`street-mode-selector-panel ${this.props.viewId}`}>
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
  selectStreetMode: PropTypes.func.isRequired,
  selectedStreetMode: PropTypes.string,
  streetModeConfigs: PropTypes.arrayOf(
    PropTypes.shape({
      defaultValue: PropTypes.bool.isRequired,
      icon: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
  viewId: PropTypes.string,
};

StreetModeSelectorPanel.defaultProps = {
  selectedStreetMode: undefined,
  streetModeConfigs: [],
};

export default StreetModeSelectorPanel;
