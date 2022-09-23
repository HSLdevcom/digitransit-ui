import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';
import moment from 'moment';
import { getRouteMode } from '../util/modeUtils';
import TripRouteStop from './TripRouteStop';
import withBreakpoint from '../util/withBreakpoint';

class TripStopListContainer extends React.PureComponent {
  static propTypes = {
    trip: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      route: PropTypes.shape({
        gtfsId: PropTypes.string,
        shortName: PropTypes.string,
        type: PropTypes.number,
        mode: PropTypes.string,
        color: PropTypes.string,
      }),
      stoptimesForDate: PropTypes.arrayOf(
        PropTypes.shape({
          stop: PropTypes.shape({
            gtfsId: PropTypes.string,
          }),
          realtimeDeparture: PropTypes.number,
          serviceDay: PropTypes.number,
        }),
      ).isRequired,
      pattern: PropTypes.shape({
        code: PropTypes.string.isRequired,
        directionId: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
    className: PropTypes.string,
    vehicles: PropTypes.objectOf(
      PropTypes.shape({
        id: PropTypes.string,
        next_stop: PropTypes.string,
        timestamp: PropTypes.number,
      }),
    ),
    currentTime: PropTypes.instanceOf(moment).isRequired,
    tripStart: PropTypes.string.isRequired,
    breakpoint: PropTypes.string.isRequired,
    keepTracking: PropTypes.bool,
    setHumanScrolling: PropTypes.func,
  };

  static defaultProps = {
    vehicles: {},
    className: undefined,
    keepTracking: false,
    setHumanScrolling: () => {},
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  getStops() {
    const {
      breakpoint,
      currentTime,
      trip,
      tripStart,
      vehicles: propVehicles,
    } = this.props;

    const mode = getRouteMode(trip.route);

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
      const nextStoptimeForDate = trip.stoptimesForDate[index + 1];
      const prevStop = trip.stoptimesForDate[index - 1]?.stop;

      return (
        <TripRouteStop
          key={stoptime.stop.gtfsId}
          stoptime={stoptime}
          stop={stoptime.stop}
          nextStop={nextStoptimeForDate ? nextStoptimeForDate.stop : null}
          prevStop={prevStop || null}
          mode={mode}
          color={trip.route && trip.route.color ? `#${trip.route.color}` : null}
          vehicles={vehicles[stoptime.stop.gtfsId]}
          selectedVehicle={vehicle}
          stopPassed={stopPassed}
          realtime={stoptime.realtime}
          currentTime={currentTime.unix()}
          realtimeDeparture={stoptime.realtimeDeparture}
          pattern={trip.pattern.code}
          route={trip.route.gtfsId}
          last={index === trip.stoptimesForDate.length - 1}
          first={index === 0}
          className={`bp-${breakpoint}`}
          shortName={trip.route && trip.route.shortName}
          keepTracking={this.props.keepTracking}
          setHumanScrolling={this.props.setHumanScrolling}
        />
      );
    });
  }

  render() {
    return (
      <>
        <div
          className={cx('route-stop-list', this.props.className)}
          role="tabpanel"
          aria-labelledby="route-tab"
        >
          {this.getStops()}
        </div>
        <div className="bottom-whitespace" />
      </>
    );
  }
}

const connectedComponent = createFragmentContainer(
  connectToStores(
    withBreakpoint(TripStopListContainer),
    ['RealTimeInformationStore', 'PositionStore', 'TimeStore'],
    ({ getStore }) => ({
      vehicles: getStore('RealTimeInformationStore').vehicles,
      currentTime: getStore('TimeStore').getCurrentTime(),
    }),
  ),
  {
    trip: graphql`
      fragment TripStopListContainer_trip on Trip {
        route {
          mode
          type
          gtfsId
          color
          shortName
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
            zoneId
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
            }
          }
          realtimeArrival
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
);

export { connectedComponent as default, TripStopListContainer as Component };
