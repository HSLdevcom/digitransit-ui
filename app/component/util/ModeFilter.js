import React from 'react';
import ToggleButton from './ToggleButton';
import config from '../../config';

class ModeFilter extends React.Component {
  static propTypes = {
    modes: React.PropTypes.array.isRequired,
    action: React.PropTypes.object.isRequired,
    buttonClass: React.PropTypes.string,
  };

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
  };

  getToggleButton = (type, style) => {
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
        state={this.props.modes.indexOf(upperCaseType) !== -1}
        checkedClass={type}
        style={style}
        className={this.props.buttonClass}
      />);
    }
    return null;
  };

  calcWidth = () => {
    let numberOfModes = 0;

    for (const key of Object.keys(config.transportModes)) {
      if (config.transportModes[key].availableForSelection) {
        numberOfModes++;
      }
    }

    return 100 / numberOfModes;
  }

  render = () => {
    const widthPercentage = this.calcWidth();

    const style = {
      width: `${widthPercentage}%`,
    };

    // TODO we could build the filter strictly based on config
    return (<div className="btn-bar mode-filter no-select">
      {this.getToggleButton('bus', style)}
      {this.getToggleButton('tram', style)}
      {this.getToggleButton('rail', style)}
      {this.getToggleButton('subway', style)}
      {this.getToggleButton('ferry', style)}
      {this.getToggleButton('citybike', style)}
    </div>);
  }
}

export default ModeFilter;
