import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';

class StopPageTabContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      active: null,
    };
  }

  render() {
    return (<div className="stop-tab-container">
      <div
        className={`stop-tab-singletab ${this.state.active === 'departures' && 'active'}`}
        onClick={() => { this.setState({ active: 'departures' }); }}
      >
        <div className="stop-tab-singletab-container">
          <Icon img="icon-icon_realtime" className="stop-page-tab_icon" />
          <span>
            <FormattedMessage
              id="departures"
              defaultMessage="Departures"
            /></span>
        </div>
      </div>
      <div
        className={`stop-tab-singletab ${this.state.active === 'schedule' && 'active'}`}
        onClick={() => { this.setState({ active: 'schedule' }); }}
      >
        <div className="stop-tab-singletab-container">
          <Icon img="icon-icon_schedule" className="stop-page-tab_icon" />
          <span>
            <FormattedMessage
              id="schedule"
              defaultMessage="schedule"
            /></span>
        </div>
      </div>
    </div>);
  }
}

export default StopPageTabContainer;
