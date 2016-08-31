import React from 'react';
import Relay from 'react-relay';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { getStartTime } from '../../util/time-utils';
import TripListHeader from './TripListHeader';
import TripStopListContainer from './TripStopListContainer';
import RouteMapContainer from '../route/RouteMapContainer';


class TripStopsContainer extends React.Component {
  static propTypes = {
    trip: React.PropTypes.shape({
      pattern: React.PropTypes.object.isRequired,
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
    let mainContent = null;

    if (!this.props.route.fullscreenMap) {
      mainContent = ([
        <TripListHeader key="header" />,
        <TripStopListContainer key="list" trip={this.props.trip} />,
      ]);
    }

    return (
      <ReactCSSTransitionGroup
        component="div"
        className="route-page-content"
        transitionName="route-page-content"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
      >
        <RouteMapContainer
          key="map"
          pattern={this.props.trip.pattern}
          toggleFullscreenMap={this.toggleFullscreenMap}
          className="routeMap full"
          tripStart={getStartTime(this.props.trip.stoptimesForDate[0].scheduledDeparture)}
        >
          {!this.props.route.fullscreenMap ?
            <div className="map-click-prevent-overlay" onClick={this.toggleFullscreenMap} /> :
            null
          }
        </RouteMapContainer>
        {mainContent}
      </ReactCSSTransitionGroup>
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
        pattern {
          ${RouteMapContainer.getFragment('pattern')}
        }
        ${TripStopListContainer.getFragment('trip')}
      }
    `,
  },
});
