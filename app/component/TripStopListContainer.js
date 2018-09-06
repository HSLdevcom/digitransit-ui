import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';

import TripRouteStop from './TripRouteStop';
import { getDistanceToNearestStop } from '../util/geo-utils';
import withBreakpoint from '../util/withBreakpoint';

class TripStopListContainer extends React.PureComponent {
  static propTypes = {
    trip: PropTypes.object.isRequired,
    className: PropTypes.string,
    vehicles: PropTypes.object,
    locationState: PropTypes.object.isRequired,
    currentTime: PropTypes.object.isRequired,
    relay: PropTypes.shape({
      forceFetch: PropTypes.func.isRequired,
    }).isRequired,
    tripStart: PropTypes.string.isRequired,
    breakpoint: PropTypes.string,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { hasScrolled: false };
  }

  componentDidMount() {
    if (this.props.breakpoint === 'large') {
      this.scrollToSelectedTailIcon();
    }
  }

  componentWillReceiveProps({ relay, currentTime }) {
    const currUnix = this.props.currentTime.unix();
    const nextUnix = currentTime.unix();
    if (currUnix !== nextUnix) {
      relay.forceFetch();
    }
  }
  componentDidUpdate() {
    if (this.props.breakpoint === 'large' && !this.state.hasScrolled) {
      this.scrollToSelectedTailIcon();
    }
  }

  getNearestStopDistance = stops =>
    this.props.locationState.hasLocation === true
      ? getDistanceToNearestStop(
          this.props.locationState.lat,
          this.props.locationState.lon,
          stops,
        )
      : null;

  getStops() {
    const stops = this.props.trip.stoptimesForDate.map(
      stoptime => stoptime.stop,
    );

    const nearest = this.getNearestStopDistance(stops);

    const mode = this.props.trip.route.mode.toLowerCase();

    const vehicles = groupBy(
      values(this.props.vehicles)
        .filter(
          vehicle =>
            this.props.currentTime - vehicle.timestamp * 1000 < 5 * 60 * 1000,
        )
        .filter(
          vehicle =>
            vehicle.tripStartTime && vehicle.tripStartTime !== 'undefined',
        ),
      vehicle => vehicle.direction,
    );

    const vehicleStops = groupBy(
      vehicles[this.props.trip.pattern.directionId],
      vehicle => `HSL:${vehicle.next_stop}`,
    );

    const vehiclesWithCorrectStartTime = Object.keys(this.props.vehicles)
      .map(key => this.props.vehicles[key])
      .filter(
        vehicle => vehicle.direction === this.props.trip.pattern.directionId,
      )
      .filter(vehicle => vehicle.tripStartTime === this.props.tripStart);

    // selected vehicle
    const vehicle =
      vehiclesWithCorrectStartTime.length > 0 &&
      vehiclesWithCorrectStartTime[0];
    const nextStop = vehicle && `HSL:${vehicle.next_stop}`;

    let stopPassed = true;

    return this.props.trip.stoptimesForDate.map((stoptime, index) => {
      if (nextStop === stoptime.stop.gtfsId) {
        stopPassed = false;
      } else if (vehicle.stop_index === index) {
        stopPassed = false;
      } else if (
        stoptime.realtimeDeparture + stoptime.serviceDay >
          this.props.currentTime &&
        isEmpty(vehicle)
      ) {
        stopPassed = false;
      }

      return (
        <TripRouteStop
          key={stoptime.stop.gtfsId}
          stoptime={stoptime}
          stop={stoptime.stop}
          mode={mode}
          color={
            this.props.trip.route && this.props.trip.route.color
              ? `#${this.props.trip.route.color}`
              : null
          }
          vehicles={vehicleStops[stoptime.stop.gtfsId]}
          selectedVehicle={vehicle}
          stopPassed={stopPassed}
          realtime={stoptime.realtime}
          distance={
            nearest != null &&
            nearest.stop != null &&
            nearest.stop.gtfsId === stoptime.stop.gtfsId &&
            nearest.distance <
              this.context.config.nearestStopDistance.maxShownDistance &&
            nearest.distance
          }
          currentTime={this.props.currentTime.unix()}
          realtimeDeparture={stoptime.realtimeDeparture}
          pattern={this.props.trip.pattern.code}
          route={this.props.trip.route.gtfsId}
          last={index === this.props.trip.stoptimesForDate.length - 1}
          first={index === 0}
          className={`bp-${this.props.breakpoint}`}
        />
      );
    });
  }

  scrollToSelectedTailIcon = () => {
    const el = document.getElementsByClassName('selected-tail-icon')[0];
    if (el) {
      el.scrollIntoView();
      this.setState({ hasScrolled: true });
    }
  };

  render() {
    return (
      <div
        className={cx('route-stop-list momentum-scroll', this.props.className)}
      >
        {this.getStops()}
      </div>
    );
  }
}

export default Relay.createContainer(
  connectToStores(
    withBreakpoint(TripStopListContainer),
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
          color
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
  },
);
