import React from 'react';
import Relay from 'react-relay';
import cx from 'classnames';
import TripRouteStop from './TripRouteStop';
import isEmpty from 'lodash/isEmpty';
import { getDistanceToNearestStop } from '../../util/geo-utils';
import config from '../../config';
import connectToStores from 'fluxible-addons-react/connectToStores';

class TripStopListContainer extends React.Component {

  static propTypes = {
    trip: React.PropTypes.object.isRequired,
    className: React.PropTypes.string.isRequired,
    vehicles: React.PropTypes.object,
    locationState: React.PropTypes.object.isRequired,
    currentTime: React.PropTypes.object.isRequired,
  }

  getNearestStopDistance = (stops) => {
    this.props.locationState.hasLocation === true ?
      getDistanceToNearestStop(this.props.locationState.lat, this.props.locationState.lon, stops) : null;
  }

  getStops() {
    const nearest = this.getNearestStopDistance(this.props.trip.stoptimesForDate
      .map(stoptime => stoptime.stop));
    const mode = this.props.trip.route.type.toLowerCase();
    // const { vehicles } = this.context.getStore('RealTimeInformationStore');
    const vehicle = !isEmpty(this.props.vehicles) && this.props.vehicles[Object.keys(this.props.vehicles)[0]];
    const currentTimeFromMidnight = this.props.currentTime.diff(this.props.currentTime.startOf('day'), 'seconds');
    let stopPassed = true;

    return this.props.trip.stoptimesForDate.map((stoptime, index) => {
      const nextStop = `HSL:${vehicle.next_stop}`;

      if (nextStop === stoptime.stop.gtfsId) {
        stopPassed = false;
      } else if (vehicle.stop_index === index) {
        stopPassed = false;
      } else if (stoptime.realtimeDeparture > currentTimeFromMidnight && isEmpty(vehicle)) {
        stopPassed = false;
      }

      return (<TripRouteStop
        key={stoptime.stop.gtfsId}
        stoptime={stoptime}
        stop={stoptime.stop}
        mode={mode}
        vehicle={nextStop === stoptime.stop.gtfsId && vehicle || null}
        stopPassed={stopPassed}
        realtime={stoptime.realtime}
        distance={nearest != null
          && nearest.stop != null
          && nearest.stop.gtfsId === stoptime.stop.gtfsId
          && nearest.distance < config.nearestStopDistance.maxShownDistance
          && nearest.distance
          }
        currentTime={this.props.currentTime.unix()}
        realtimeDeparture={stoptime.realtimeDeparture}
        currentTimeFromMidnight={currentTimeFromMidnight}
      />);
    });
  }

  render() {
    return (<div className={cx('route-stop-list', this.props.className)}>{this.getStops()}</div>);
  }
}

export default Relay.createContainer(
  connectToStores(
    TripStopListContainer,
    ['RealTimeInformationStore', 'PositionStore', 'TimeStore'],
    ({ getStore }) => ({
      vehicles: getStore('RealTimeInformationStore').vehicles,
      locationState: getStore('PositionStore').getLocationState(),
      currentTime: getStore('TimeStore').getCurrentTime(),
    })
  ),

  {
    fragments: {
      trip: () => Relay.QL`
      fragment on Trip {
        route {
          type
        }
        stoptimesForDate {
          stop{
            gtfsId
            name
            desc
            code
            lat
            lon
          }
          realtimeDeparture
          realtime
          scheduledDeparture
          serviceDay
          realtimeState
        }
      }
    `,
    },
  });
