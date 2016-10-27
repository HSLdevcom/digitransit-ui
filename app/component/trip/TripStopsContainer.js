import React from 'react';
import Relay from 'react-relay';

import { getStartTime } from '../../util/timeUtils';
import TripListHeader from './TripListHeader';
import TripStopListContainer from './TripStopListContainer';

class TripStopsContainer extends React.Component {
  static propTypes = {
    pattern: React.PropTypes.object.isRequired,
    trip: React.PropTypes.shape({
      stoptimesForDate: React.PropTypes.arrayOf(
        React.PropTypes.shape({
          scheduledDeparture: React.PropTypes.number.isRequired,
        }).isRequired
      ).isRequired,
    }).isRequired,
    route: React.PropTypes.shape({
      fullscreenMap: React.PropTypes.bool,
    }).isRequired,
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string.isRequired,
    }).isRequired,
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }

  toggleFullscreenMap = () => {
    if (this.props.route.fullscreenMap) {
      this.context.router.goBack();
      return;
    }
    this.context.router.push(`${this.props.location.pathname}/kartta`);
  }

  render() {
    const tripStartTime = getStartTime(this.props.trip.stoptimesForDate[0].scheduledDeparture);

    return (
      <div className="route-page-content">
        <TripListHeader key="header" />
        <TripStopListContainer
          key="list"
          trip={this.props.trip}
          tripStart={tripStartTime}
          fullscreenMap={this.props.route.fullscreenMap}
        />
      </div>
    );
  }
}

export default Relay.createContainer(TripStopsContainer, {
  fragments: {
    trip: () =>
      Relay.QL`
      fragment on Trip {
        stoptimesForDate {
          scheduledDeparture
        }
        ${TripStopListContainer.getFragment('trip')}
      }
    `,
    pattern: () => Relay.QL`
      fragment on Pattern {
        id
      }
    `,
  },
});
