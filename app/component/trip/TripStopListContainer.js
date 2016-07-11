import React from 'react';
import Relay from 'react-relay';
import cx from 'classnames';
import TripRouteStop from './TripRouteStop';
import isEmpty from 'lodash/isEmpty';
import { getDistanceToNearestStop } from '../../util/geo-utils';
import config from '../../config';

class TripStopListContainer extends React.Component {

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
  };

  static propTypes = {
    trip: React.PropTypes.object.isRequired,
    className: React.PropTypes.string.isRequired,
  }

  componentDidMount() {
    return this.context.getStore('RealTimeInformationStore')
      .addChangeListener(this.onRealTimeChange);
  }

  componentWillUnmount() {
    return this.context.getStore('RealTimeInformationStore')
      .removeChangeListener(this.onRealTimeChange);
  }

  onRealTimeChange = () => {
    this.forceUpdate();
  }

  getNearestStopDistance = (stops) => {
    const state = this.context.getStore('PositionStore').getLocationState();
    return state.hasLocation === true ?
      getDistanceToNearestStop(state.lat, state.lon, stops) : null;
  }

  getStops() {
    const nearest = this.getNearestStopDistance(this.props.trip.stoptimes
      .map(stoptime => stoptime.stop));
    const mode = this.props.trip.route.type.toLowerCase();
    const { vehicles } = this.context.getStore('RealTimeInformationStore');
    const vehicle = !isEmpty(vehicles) && vehicles[Object.keys(vehicles)[0]];
    const currentTime = this.context.getStore('TimeStore').getCurrentTime();
    const currentTimeFromMidnight = currentTime.diff(currentTime.startOf('day'), 'seconds');
    let stopPassed = true;

    return this.props.trip.stoptimes.map((stoptime, index) => {
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
        realtimeDeparture={stoptime.realtimeDeparture}
        currentTimeFromMidnight={currentTimeFromMidnight}
      />);
    });
  }

  render() {
    return (<div className={cx('route-stop-list', this.props.className)}>{this.getStops()}</div>);
  }
}

export default Relay.createContainer(TripStopListContainer, {
  fragments: {
    trip: () => Relay.QL`
      fragment on Trip {
        route {
          type
        }
        stoptimes        {
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
        }
      }
    `,
  },
});
