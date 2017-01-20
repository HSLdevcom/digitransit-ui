import React from 'react';
import pure from 'recompose/pure';

import ToggleButton from './ToggleButton';
import ComponentUsageExample from './ComponentUsageExample';


class ModeFilter extends React.Component {
  static propTypes = {
    selectedModes: React.PropTypes.array.isRequired,
    action: React.PropTypes.object.isRequired,
    buttonClass: React.PropTypes.string,
  };

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    config: React.PropTypes.object.isRequired,
  };

  availableModes = () => Object.keys(this.context.config.transportModes).filter(
    mode => (this.context.config.transportModes[mode].availableForSelection))

  render = () => {
    const widthPercentage = 100 / this.availableModes().length;
    const ModeToggleButton = ({ type, stateName }) => {
      if (this.context.config.transportModes[type].availableForSelection) {
        const action = this.props.action[
          `toggle${type.charAt(0).toUpperCase() + type.slice(1)}State`];
        const selectedModes = this.props.selectedModes;
        const isEnabled = selectedModes.includes(stateName) ||
          selectedModes.includes(type.toUpperCase());
        return (<ToggleButton
          icon={`${type}-withoutBox`}
          onBtnClick={() => {
            this.context.executeAction(action);
          }}
          state={isEnabled}
          checkedClass={type}
          style={{
            width: `${widthPercentage}%`,
          }}
          className={this.props.buttonClass}
        />);
      }
      return null;
    };

    // TODO we could build the filter strictly based on config
    return (<div className="btn-bar mode-filter no-select">
      <ModeToggleButton type="bus" />
      <ModeToggleButton type="tram" />
      <ModeToggleButton type="rail" />
      <ModeToggleButton type="subway" />
      <ModeToggleButton type="ferry" />
      <ModeToggleButton type="airplane" />
      <ModeToggleButton type="citybike" stateName="BICYCLE_RENT" />
    </div>);
  }
}

const pureModeFilter = pure(ModeFilter);

pureModeFilter.description = () =>
  <div>
    <p>ModeFilter displays row of transport mode icons that can be used to select transport modes
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
  </div>;

pureModeFilter.displayName = 'ModeFilter';

export default pureModeFilter;
