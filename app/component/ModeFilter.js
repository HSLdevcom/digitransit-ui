import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl'; // DT-3268
import pure from 'recompose/pure';

import ToggleButton from './ToggleButton';
import ComponentUsageExample from './ComponentUsageExample';

class ModeFilter extends React.Component {
  static propTypes = {
    selectedModes: PropTypes.array.isRequired,
    action: PropTypes.object.isRequired,
    buttonClass: PropTypes.string,
  };

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired, // DT-3268
  };

  // TODO use props instead of config so that visual tests do not break every
  // time modes are updated...
  availableModes = () =>
    Object.keys(this.context.config.transportModes).filter(
      mode => this.context.config.transportModes[mode].availableForSelection,
    );

  render() {
    const ModeToggleButton = ({ type, stateName }) => {
      if (this.context.config.transportModes[type].availableForSelection) {
        const action = this.props.action[
          `toggle${type.charAt(0).toUpperCase() + type.slice(1)}State`
        ];
        const { selectedModes } = this.props;
        const isEnabled =
          selectedModes.includes(stateName) ||
          selectedModes.includes(type.toUpperCase());
        return (
          <ToggleButton
            icon={`${type}-withoutBox`}
            onBtnClick={() => {
              this.context.executeAction(action);
            }}
            state={isEnabled}
            checkedClass={type}
            className={this.props.buttonClass}
            label={type}
            ariaLabel={
              isEnabled
                ? `pick-mode-${type}-enabled`
                : `pick-mode-${type}-disabled`
            }
          />
        );
      }
      return null;
    };

    // TODO we could build the filter strictly based on config
    // DT-3268: added role and aria-label
    return (
      <div
        role="group"
        aria-label={this.context.intl.formatMessage({
          id: 'pick-mode-selected',
        })}
        className="btn-bar mode-filter no-select"
      >
        <ModeToggleButton type="bus" />
        <ModeToggleButton type="tram" />
        <ModeToggleButton type="rail" />
        <ModeToggleButton type="subway" />
        <ModeToggleButton type="ferry" />
        <ModeToggleButton type="airplane" />
        <ModeToggleButton type="citybike" stateName="BICYCLE_RENT" />
      </div>
    );
  }
}

const pureModeFilter = pure(ModeFilter);

pureModeFilter.description = () => (
  <div>
    <p>
      ModeFilter displays row of transport mode icons that can be used to select
      transport modes
    </p>
    <ComponentUsageExample>
      <ModeFilter
        selectedModes={['BUS', 'TRAM']}
        action={{
          toggleBusState: () => {},
          toggleTramState: () => {},
        }}
        buttonClass=""
      />
    </ComponentUsageExample>

    <p>For &lsquo;nearby white buttons&rsquo;</p>
    <div className="nearby-routes">
      <ComponentUsageExample>
        <ModeFilter
          selectedModes={['BUS', 'TRAM']}
          action={{
            toggleBusState: () => {},
            toggleTramState: () => {},
          }}
          buttonClass="btn mode-nearby"
        />
      </ComponentUsageExample>
    </div>
  </div>
);

pureModeFilter.displayName = 'ModeFilter';

export default pureModeFilter;
