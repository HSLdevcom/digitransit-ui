import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';

class StopPageTabContainer extends React.Component {
  static propTypes = {
    selectedTab: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      active: 'right-now', // show departures as the default
    };
  }

  selectedTab = val => {
    this.props.selectedTab(val);
  };

  render() {
    return (
      <div className="stop-tab-container">
        <button
          className={`stop-tab-singletab ${
            this.state.active === 'right-now' ? 'active' : 'inactive'
          }`}
          onClick={() => {
            this.setState({ active: 'right-now' });
            this.selectedTab('right-now');
          }}
        >
          <div className="stop-tab-singletab-container">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 1024 1024"
              >
                <path d="M368.356 1024.014c-44.781 0-81.079-36.302-81.079-81.079 0-361.528 294.123-655.658 655.651-655.658 44.781 0 81.079 36.302 81.079 81.079s-36.298 81.079-81.079 81.079c-272.112 0-493.497 221.385-493.497 493.5 0.004 44.773-36.295 81.079-81.075 81.079z" />
                <path d="M81.072 1024.014c-44.781 0-81.079-36.302-81.079-81.079 0-519.948 423.002-942.946 942.939-942.946 44.781 0 81.079 36.302 81.079 81.079s-36.298 81.079-81.079 81.079c-430.524 0-780.781 350.257-780.781 780.788 0 44.773-36.298 81.079-81.079 81.079z" />
              </svg>
            </div>
            <div>
              <FormattedMessage id="right-now" defaultMessage="right now" />
            </div>
          </div>
        </button>
        <button
          className={`stop-tab-singletab ${
            this.state.active === 'timetable' ? 'active' : 'inactive'
          }`}
          onClick={() => {
            this.setState({ active: 'timetable' });
            this.selectedTab('timetable');
          }}
        >
          <div className="stop-tab-singletab-container">
            <div>
              <Icon img="icon-icon_schedule" className="stop-page-tab_icon" />
            </div>
            <div>
              <FormattedMessage id="timetable" defaultMessage="timetable" />
            </div>
          </div>
        </button>
        {
          // <div
          // className={`stop-tab-singletab add-info ${this.state.active === 'add-info'
          // ? 'active' : 'inactive'}`}
          // onClick={() => { this.setState({ active: 'add-info' }); }}
          // />
        }
      </div>
    );
  }
}

export default StopPageTabContainer;
