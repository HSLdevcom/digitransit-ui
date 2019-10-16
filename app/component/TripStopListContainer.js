import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';

import TripRouteStop from './TripRouteStop';
import { StopAlertsQuery } from '../util/alertQueries';
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

  static defaultProps = {
    vehicles: {},
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
    const {
      breakpoint,
      currentTime,
      trip,
      tripStart,
      vehicles: propVehicles,
    } = this.props;
    const stops = trip.stoptimesForDate.map(stoptime => stoptime.stop);

    const nearest = this.getNearestStopDistance(stops);

    const mode = trip.route.mode.toLowerCase();

    const vehicles = groupBy(
      values(propVehicles).filter(
        vehicle => currentTime - vehicle.timestamp * 1000 < 5 * 60 * 1000,
      ),
      vehicle => vehicle.next_stop,
    );

    const matchingVehicles = Object.keys(propVehicles)
      .map(key => propVehicles[key])
      .filter(
        vehicle =>
          vehicle.direction === undefined ||
          vehicle.direction === trip.pattern.directionId,
      )
      .filter(
        vehicle =>
          vehicle.tripStartTime === undefined ||
          vehicle.tripStartTime === tripStart,
      )
      .filter(
        vehicle =>
          vehicle.tripId === undefined || vehicle.tripId === trip.gtfsId,
      );

    // selected vehicle
    const vehicle = matchingVehicles.length > 0 && matchingVehicles[0];
    const nextStop = vehicle && vehicle.next_stop;

    let stopPassed = true;

    return trip.stoptimesForDate.map((stoptime, index) => {
      if (nextStop === stoptime.stop.gtfsId) {
        stopPassed = false;
      } else if (
        stoptime.realtimeDeparture + stoptime.serviceDay > currentTime.unix() &&
        (isEmpty(vehicle) || (vehicle && vehicle.next_stop === undefined))
      ) {
        stopPassed = false;
      }

      return (
        <TripRouteStop
          key={stoptime.stop.gtfsId}
          stoptime={stoptime}
          stop={stoptime.stop}
          mode={mode}
          color={trip.route && trip.route.color ? `#${trip.route.color}` : null}
          vehicles={vehicles[stoptime.stop.gtfsId]}
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
          currentTime={currentTime.unix()}
          realtimeDeparture={stoptime.realtimeDeparture}
          pattern={trip.pattern.code}
          route={trip.route.gtfsId}
          last={index === trip.stoptimesForDate.length - 1}
          first={index === 0}
          className={`bp-${breakpoint}`}
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

const connectedComponent = Relay.createContainer(
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
          stop {
            gtfsId
            name
            desc
            code
            lat
            lon
            ${StopAlertsQuery}
          }
          realtimeDeparture
          realtime
          scheduledDeparture
          serviceDay
          realtimeState
        }
        gtfsId
      }
    `,
    },
  },
);

export { connectedComponent as default, TripStopListContainer as Component };
