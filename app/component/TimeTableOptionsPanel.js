import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

class TimeTableOptionsPanel extends React.Component {

  static propTypes = {
    stop: React.PropTypes.object,
    showRoutes: React.PropTypes.array,
    showFilterModal: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      showRoutes: [],
    };
  }

  render() {
    const showRoutesDiv = this.props.showRoutes.map(o => <div key={o} className="showroute-number">{o}</div>);
    const stopVehicle = this.props.stop.stoptimesForServiceDate[0].pattern.route.mode.toLowerCase();
    return (<div className="timetable-options-panel">
      <div className="timetable-showroutes">
        <div className="showroutes-icon">
          <Icon
            img={`icon-icon_${stopVehicle}`}
            className="showroutes-icon-svg"
          />
        </div>
        <div className="showroutes-header" onClick={() => this.props.showFilterModal(true)}>
          <FormattedMessage
            id="show-routes"
            defaultMessage="Show Lines"
          />
        </div>
        <div className="showroutes-list">
          {showRoutesDiv.length > 0 && showRoutesDiv}
          {showRoutesDiv.length === 0 &&
          <FormattedMessage
            id="all-routes"
            defaultMessage="All Lines"
          />}
        </div>
      </div>
    </div>);
  }
}

export default TimeTableOptionsPanel;
