import React from 'react';
import Relay from 'react-relay';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';

import TripRouteStop from './TripRouteStop';
import { getDistanceToNearestStop } from '../util/geo-utils';

class TripStopListContainer extends React.Component {

  static propTypes = {
    trip: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    vehicles: React.PropTypes.object,
    locationState: React.PropTypes.object.isRequired,
    currentTime: React.PropTypes.object.isRequired,
    tripStart: React.PropTypes.string.isRequired,
    fullscreenMap: React.PropTypes.bool,
  }

  static contextTypes = {
    breakpoint: React.PropTypes.string,
    config: React.PropTypes.object.isRequired,
  }

  componentDidMount() {
    const el = document.getElementsByClassName('selected-tail-icon')[0];
    if (el) {
      el.scrollIntoView();
    }
  }

  getNearestStopDistance = stops => (
    this.props.locationState.hasLocation === true
      ? getDistanceToNearestStop(this.props.locationState.lat, this.props.locationState.lon, stops)
      : null
  )

  getStops() {
    const stops = this.props.trip.stoptimesForDate.map(stoptime => stoptime.stop);

    const nearest = this.getNearestStopDistance(stops);

    const mode = this.props.trip.route.mode.toLowerCase();

    const vehicles = groupBy(
      values(this.props.vehicles)
        .filter(vehicle => (this.props.currentTime - (vehicle.timestamp * 1000)) < (90 * 1000))
        .filter(vehicle => vehicle.tripStartTime && vehicle.tripStartTime !== 'undefined')
      , vehicle => vehicle.direction);

    const vehicleStops = groupBy(vehicles[this.props.trip.pattern.directionId], vehicle =>
      `HSL:${vehicle.next_stop}`,
    );

    const vehiclesWithCorrectStartTime = Object.keys(this.props.vehicles)
      .map(key => (this.props.vehicles[key]))
      .filter(vehicle => (vehicle.direction === this.props.trip.pattern.directionId))
      .filter(vehicle => (vehicle.tripStartTime === this.props.tripStart));

    // selected vehicle
    const vehicle = (vehiclesWithCorrectStartTime.length > 0) && vehiclesWithCorrectStartTime[0];
    const nextStop = vehicle && `HSL:${vehicle.next_stop}`;

    let stopPassed = true;

    return this.props.trip.stoptimesForDate.map((stoptime, index) => {
      if (nextStop === stoptime.stop.gtfsId) {
        stopPassed = false;
      } else if (vehicle.stop_index === index) {
        stopPassed = false;
      } else if (
        stoptime.realtimeDeparture + stoptime.serviceDay > this.props.currentTime &&
        isEmpty(vehicle)
      ) {
        stopPassed = false;
      }

      return (<TripRouteStop
        key={stoptime.stop.gtfsId}
        stoptime={stoptime}
        stop={stoptime.stop}
        mode={mode}
        vehicles={vehicleStops[stoptime.stop.gtfsId]}
        selectedVehicle={vehicle}
        stopPassed={stopPassed}
        realtime={stoptime.realtime}
        distance={nearest != null
          && nearest.stop != null
          && nearest.stop.gtfsId === stoptime.stop.gtfsId
          && nearest.distance < this.context.config.nearestStopDistance.maxShownDistance
          && nearest.distance
          }
        currentTime={this.props.currentTime.unix()}
        realtimeDeparture={stoptime.realtimeDeparture}
        pattern={this.props.trip.pattern.code}
        route={this.props.trip.route.gtfsId}
        last={index === this.props.trip.stoptimesForDate.length - 1}
        first={index === 0}
        fullscreenMap={this.props.fullscreenMap}
        className={this.context.breakpoint === 'large' && 'bp-large'}
      />);
    });
  }

  render() {
    return (
      <div className={cx('route-stop-list momentum-scroll', this.props.className)}>
        {this.getStops()}
      </div>
    );
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
    }),
  ),
  {
    fragments: {
      trip: () => Relay.QL`
      fragment on Trip {
        route {
          mode
          gtfsId
        }
        pattern {
          code
          directionId
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
