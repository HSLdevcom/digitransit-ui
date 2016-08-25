import React from 'react';
import ToggleButton from './ToggleButton';
import config from '../../config';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

class ModeFilter extends React.Component {
  static propTypes = {
    selectedModes: React.PropTypes.array.isRequired,
    action: React.PropTypes.object.isRequired,
    buttonClass: React.PropTypes.string,
  };

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
  };

  availableModes = () => Object.keys(config.transportModes).filter(
    (mode) => (config.transportModes[mode].availableForSelection))

  render = () => {
    const widthPercentage = 100 / this.availableModes().length;
    const ModeToggleButton = ({ type, stateName }) => {
      if (config.transportModes[type].availableForSelection) {
        const action = this.props.action[
          `toggle${type.charAt(0).toUpperCase() + type.slice(1)}State`];
        return (<ToggleButton
          icon={`${type}-withoutBox`}
          onBtnClick={() => {
            this.context.executeAction(action);
          }}
          state={this.props.selectedModes.indexOf(stateName || type.toUpperCase()) !== -1}
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
      <ModeToggleButton type="citybike" stateName="BICYCLE_RENT" />
    </div>);
  }
}

ModeFilter.description = (
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

    <p>For 'nearby white buttons'</p>
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
  </div>);

ModeFilter.displayName = 'ModeFilter';

export default ModeFilter;
