import React from 'react';
import ToggleButton from './ToggleButton';
import config from '../../config';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

class ModeFilter extends React.Component {
  static propTypes = {
    modes: React.PropTypes.array.isRequired,
    action: React.PropTypes.object.isRequired,
    buttonClass: React.PropTypes.string,
  };

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
  };

  availableModes = () => Object.keys(config.transportModes).filter(
    (mode) => (config.transportModes[mode].availableForSelection))

  calcWidth = () => {
    const numberOfModes = this.availableModes().length;
    return 100 / numberOfModes;
  }

  render = () => {
    const ModeToggleButton = ({ type, style, stateName }) => {
      if (config.transportModes[type].availableForSelection) {
        const icon = `${type}-withoutBox`;
        const camelCaseType = type.charAt(0).toUpperCase() + type.slice(1);
        const upperCaseType = type.toUpperCase();
        const actionName = `toggle${camelCaseType}State`;
        return (<ToggleButton
          icon={icon}
          onBtnClick={() => {
            this.context.executeAction(this.props.action[actionName]);
          }}
          state={this.props.modes.indexOf(stateName || upperCaseType) !== -1}
          checkedClass={type}
          style={style}
          className={this.props.buttonClass}
        />);
      }
      return null;
    };
    const widthPercentage = this.calcWidth();

    const style = {
      width: `${widthPercentage}%`,
    };

    // TODO we could build the filter strictly based on config
    return (<div className="btn-bar mode-filter no-select">
      <ModeToggleButton type="bus" style={style} />
      <ModeToggleButton type="tram" style={style} />
      <ModeToggleButton type="rail" style={style} />
      <ModeToggleButton type="subway" style={style} />
      <ModeToggleButton type="ferry" style={style} />
      <ModeToggleButton type="airplane" style={style} />
      <ModeToggleButton type="citybike" style={style} stateName="BICYCLE_RENT" />
    </div>);
  }
}

ModeFilter.description = (
  <div>
    <p>ModeFilter displays row of transport mode icons that can be used to select transport modes
    </p>
    <ComponentUsageExample>
      <ModeFilter
        modes={['BUS', 'TRAM']}
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
          modes={['BUS', 'TRAM']}
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
