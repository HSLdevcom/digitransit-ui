import React from 'react';
import DisruptionInfo from '../disruption/disruption-info';
import DisruptionInfoButtonContainer from '../disruption/disruption-info-button-container';


class DisruptionInfoContainer extends React.Component {
  static contextTypes = {
    piwik: React.PropTypes.object,
    location: React.PropTypes.object.isRequired,
  };

  constructor(...args) {
    super(...args);

    this.state = {
      disruptionVisible: false,
    };
  }

  toggleDisruptionInfo = () => {
    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'Modal',
        'Disruption',
        this.state.disruptionVisible ? 'close' : 'open');
    }
    this.setState({ disruptionVisible: !this.state.disruptionVisible });
  }

  render() {
    return (
      <div>
        <DisruptionInfo
          open={this.state.disruptionVisible}
          toggleDisruptionInfo={this.toggleDisruptionInfo}
        />
        <DisruptionInfoButtonContainer
          toggleDisruptionInfo={this.toggleDisruptionInfo}
        />
      </div>);
  }
}

export default DisruptionInfoContainer;
