import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';

class StopPageTabContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      active: 'right-now', //show departures as the default
    };
  }

  render() {
    return (<div className="stop-tab-container">
      <div
        className={`stop-tab-singletab ${this.state.active === 'right-now' ? 'active' : 'inactive'}`}
        onClick={() => { this.setState({ active: 'right-now' }); }}
      >
        <div className="stop-tab-singletab-container">
          <div><Icon img="icon-icon_realtime" className="stop-page-tab_icon" /></div>
          <span>
            <FormattedMessage
              id="right-now"
              defaultMessage="right now"
            /></span>
        </div>
      </div>
      <div
        className={`stop-tab-singletab ${this.state.active === 'timetable' ? 'active' : 'inactive'}`}
        onClick={() => { this.setState({ active: 'timetable' }); }}
      >
        <div className="stop-tab-singletab-container">
          <div><Icon img="icon-icon_schedule" className="stop-page-tab_icon" /></div>
          <span>
            <FormattedMessage
              id="timetable"
              defaultMessage="timetable"
            /></span>
        </div>
      </div>
      <div
        className={`stop-tab-singletab ${this.state.active === 'add-info' ? 'add-info' : 'inactive'}`}
        // onClick={() => { this.setState({ active: 'add-info' }); }}
      />
    </div>);
  }
}

export default StopPageTabContainer;
