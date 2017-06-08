import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

class TimeTableOptionsPanel extends React.Component {

  static propTypes = {
    stop: React.PropTypes.object,
    showRoutes: React.PropTypes.array,
    showFilterModal: React.PropTypes.func,
    hideAllRoutes: React.PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      showRoutes: [],
    };
  }

  render() {
    const showRoutesDiv = this.props.showRoutes.map(o => <div key={o} className="showroute-number">{o}</div>);
    return (<div className="timetable-options-panel">
      <div className="timetable-showroutes">
        <div className="showroutes-icon">
          <Icon
            img="icon-icon_bus"
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
          {(showRoutesDiv.length > 0 && this.props.hideAllRoutes === false) && showRoutesDiv}
          {(showRoutesDiv.length === 0 && this.props.hideAllRoutes === false) &&
          <FormattedMessage
            id="all-routes"
            defaultMessage="All Lines"
          />}
          {(showRoutesDiv.length === 0 && this.props.hideAllRoutes === true) ?
            <FormattedMessage
              id="all-routes-disabled"
              defaultMessage="No lines"
            /> : null }
        </div>
      </div>
    </div>);
  }
}

export default TimeTableOptionsPanel;
