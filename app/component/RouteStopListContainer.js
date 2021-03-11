import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import { matchShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';
import cx from 'classnames';

import { getDistanceToNearestStop } from '../util/geo-utils';
import RouteStop from './RouteStop';
import withBreakpoint from '../util/withBreakpoint';

class RouteStopListContainer extends React.PureComponent {
  static propTypes = {
    pattern: PropTypes.object.isRequired,
    className: PropTypes.string,
    vehicles: PropTypes.object,
    position: PropTypes.object.isRequired,
    currentTime: PropTypes.object.isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    match: matchShape.isRequired,
  };

  componentDidMount() {
    if (this.nearestStop) {
      this.nearestStop.element.scrollIntoView(false);
    }
  }

  setNearestStop = element => {
    this.nearestStop = element;
  };

  getStops() {
    const { position } = this.props;
    const { stops } = this.props.pattern;

    const nearest =
      position.hasLocation === true
        ? getDistanceToNearestStop(position.lat, position.lon, stops)
        : null;
    const mode = this.props.pattern.route.mode.toLowerCase();
    const vehicles = groupBy(
      values(this.props.vehicles).filter(
        vehicle =>
          this.props.currentTime - vehicle.timestamp * 1000 < 5 * 60 * 1000,
      ),
      vehicle => vehicle.next_stop,
    );
    const rowClassName = `bp-${this.props.breakpoint}`;

    return stops.map((stop, i) => {
      const idx = i; // DT-3159: using in key of RouteStop component
      const isNearest =
        (nearest &&
          nearest.distance <
            this.context.config.nearestStopDistance.maxShownDistance &&
          nearest.stop.gtfsId) === stop.gtfsId;

      return (
        <RouteStop
          color={
            this.props.pattern.route && this.props.pattern.route.color
              ? `#${this.props.pattern.route.color}`
              : null
          }
          key={`${stop.gtfsId}-${this.props.pattern}-${idx}`} // DT-3159: added -${idx}
          stop={stop}
          mode={mode}
          vehicle={vehicles[stop.gtfsId] ? vehicles[stop.gtfsId][0] : null}
          distance={isNearest ? nearest.distance : null}
          ref={isNearest ? this.setNearestStop : null}
          currentTime={this.props.currentTime.unix()}
          last={i === stops.length - 1}
          first={i === 0}
          className={rowClassName}
          displayNextDeparture={this.context.config.displayNextDeparture}
          shortName={
            this.props.pattern.route && this.props.pattern.route.shortName
          }
        />
      );
    });
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps({ relay, currentTime }) {
    const currUnix = this.props.currentTime.unix();
    const nextUnix = currentTime.unix();
    if (currUnix !== nextUnix) {
      relay.refetch(
        {
          currentTime: nextUnix,
          patternId: this.context.match.params.patternId,
        },
        null,
      );
    }
  }

  render() {
    return (
      <div className={cx('route-stop-list', this.props.className)}>
        {this.getStops()}
      </div>
    );
  }
}

const containerComponent = createRefetchContainer(
  connectToStores(
    withBreakpoint(RouteStopListContainer),
    ['RealTimeInformationStore', 'PositionStore', 'TimeStore'],
    ({ getStore }) => ({
      vehicles: getStore('RealTimeInformationStore').vehicles,
      position: getStore('PositionStore').getLocationState(),
      currentTime: getStore('TimeStore').getCurrentTime(),
    }),
  ),
  {
    pattern: graphql`
      fragment RouteStopListContainer_pattern on Pattern
      @argumentDefinitions(
        currentTime: { type: "Long!", defaultValue: 0 }
        patternId: { type: "String!", defaultValue: "0" }
      ) {
        directionId
        route {
          mode
          color
          shortName
        }
        stops {
          alerts {
            alertSeverityLevel
            effectiveEndDate
            effectiveStartDate
          }
          stopTimesForPattern(id: $patternId, startTime: $currentTime) {
            realtime
            realtimeState
            realtimeArrival
            realtimeDeparture
            serviceDay
            scheduledDeparture
            pickupType
            stop {
              platformCode
            }
          }
          gtfsId
          lat
          lon
          name
          desc
          code
          platformCode
          zoneId
        }
      }
    `,
  },
  graphql`
    query RouteStopListContainerQuery(
      $patternId: String!
      $currentTime: Long!
    ) {
      pattern(id: $patternId) {
        ...RouteStopListContainer_pattern
        @arguments(currentTime: $currentTime, patternId: $patternId)
      }
    }
  `,
);

export { containerComponent as default, RouteStopListContainer as Component };
