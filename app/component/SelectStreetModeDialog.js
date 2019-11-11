import { find } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import BubbleDialog from './BubbleDialog';
import ToggleButton from './ToggleButton';
import { isKeyboardSelectionEvent } from '../util/browser';

import ComponentUsageExample from './ComponentUsageExample';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class SelectStreetModeDialog extends React.Component {
  constructor(props) {
    super(props);

    this.onDialogOpen = this.onDialogOpen.bind(this);
    this.state = {
      selectedStreetMode:
        this.props.selectedStreetMode ||
        this.props.streetModeConfigs.find(c => c.defaultValue).name,
    };
  }

  onDialogOpen(applyFocus = false) {
    addAnalyticsEvent({
      category: 'Map',
      action: 'OpenTravellingModeMenu',
      name: null,
    });
    if (applyFocus && this.selectedStreetModeButton) {
      this.selectedStreetModeButton.focus();
    }
  }

  getStreetModeSelectButtons() {
    const { streetModeConfigs } = this.props;
    const { selectedStreetMode } = this.state;

    if (!streetModeConfigs.length) {
      return null;
    }

    return streetModeConfigs.map(streetMode => {
      const { exclusive, icon, name } = streetMode;
      const isSelected = name === selectedStreetMode;
      const labelId = `street-mode-${name.toLowerCase()}`;
      return (
        <ToggleButton
          buttonRef={ref => {
            if (ref && isSelected) {
              this.selectedStreetModeButton = ref;
            }
          }}
          checkedClass="selected"
          icon={icon}
          key={name}
          label={labelId}
          onBtnClick={() => this.selectStreetMode(name, exclusive)}
          onKeyDown={e =>
            isKeyboardSelectionEvent(e) &&
            this.selectStreetMode(name, exclusive, true)
          }
          showButtonTitle
          state={isSelected}
        />
      );
    });
  }

  selectStreetMode(streetMode, isExclusive, applyFocus = false) {
    this.setState(
      {
        selectedStreetMode: streetMode,
      },
      () => {
        this.props.selectStreetMode(streetMode.toUpperCase(), isExclusive);
        if (applyFocus && this.dialogRef) {
          this.dialogRef.closeDialog(applyFocus);
        }
      },
    );
  }

  render() {
    const { isOpen, streetModeConfigs } = this.props;
    const { selectedStreetMode } = this.state;

    return (
      <BubbleDialog
        header="main-mode"
        id="streetModeSelector"
        icon={
          find(streetModeConfigs, sm => sm.name === selectedStreetMode).icon
        }
        isOpen={isOpen}
        onDialogOpen={this.onDialogOpen}
        wrappedRef={instance => {
          this.dialogRef = instance;
        }}
      >
        <div className="select-street-mode-dialog-buttons">
          {this.getStreetModeSelectButtons()}
        </div>
      </BubbleDialog>
    );
  }
}

SelectStreetModeDialog.propTypes = {
  isOpen: PropTypes.bool,
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

SelectStreetModeDialog.defaultProps = {
  isOpen: false,
  selectedStreetMode: undefined,
  streetModeConfigs: [],
};

SelectStreetModeDialog.contextTypes = {
  intl: intlShape.isRequired,
};

SelectStreetModeDialog.description = (
  <ComponentUsageExample>
    <div style={{ height: '200px', position: 'relative' }}>
      <div style={{ bottom: 0, position: 'absolute' }}>
        <SelectStreetModeDialog
          isOpen
          selectStreetMode={() => {}}
          streetModeConfigs={[
            {
              defaultValue: true,
              icon: 'public_transport',
              name: 'PUBLIC_TRANSPORT',
            },
            {
              defaultValue: false,
              icon: 'walk',
              name: 'WALK',
            },
            {
              defaultValue: false,
              icon: 'biking',
              name: 'BICYCLE',
            },
            {
              defaultValue: false,
              icon: 'car-withoutBox',
              name: 'CAR_PARK',
            },
          ]}
        />
      </div>
    </div>
  </ComponentUsageExample>
);

export default SelectStreetModeDialog;
