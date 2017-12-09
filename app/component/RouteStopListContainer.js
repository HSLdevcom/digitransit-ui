import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';
import cx from 'classnames';

import { getDistanceToNearestStop } from '../util/geo-utils';
import RouteStop from './RouteStop';

class RouteStopList extends React.Component {
  static propTypes = {
    pattern: PropTypes.object.isRequired,
    className: PropTypes.string,
    vehicles: PropTypes.object,
    position: PropTypes.object.isRequired,
    currentTime: PropTypes.object.isRequired,
  };

  static contextTypes = {
    breakpoint: PropTypes.string,
    config: PropTypes.object.isRequired,
  };

  componentDidMount() {
    if (this.nearestStop) {
      this.nearestStop.element.scrollIntoView(false);
    }
  }

  componentWillReceiveProps({ relay, currentTime, pattern: { code } }) {
    relay.refetch({ currentTime: currentTime.unix(), patternId: code });
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
      vehicles[this.props.pattern.directionId],
      vehicle => `HSL:${vehicle.next_stop}`,
    );

    const rowClassName = `bp-${this.context.breakpoint}`;

    return stops.map((stop, i) => {
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
          key={stop.gtfsId}
          stop={stop}
          mode={mode}
          vehicle={
            vehicleStops[stop.gtfsId] ? vehicleStops[stop.gtfsId][0] : null
          }
          distance={isNearest ? nearest.distance : null}
          ref={isNearest ? this.setNearestStop : null}
          currentTime={this.props.currentTime.unix()}
          last={i === stops.length - 1}
          first={i === 0}
          className={rowClassName}
        />
      );
    });
  }

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

const RouteStopListContainer = createRefetchContainer(
  connectToStores(
    RouteStopList,
    ['RealTimeInformationStore', 'PositionStore', 'TimeStore'],
    ({ getStore }) => ({
      vehicles: getStore('RealTimeInformationStore').vehicles,
      position: getStore('PositionStore').getLocationState(),
      currentTime: getStore('TimeStore').getCurrentTime(),
    }),
  ),
  {
    pattern: graphql`
      fragment RouteStopListContainer_pattern on Pattern {
        code
        directionId
        route {
          mode
          color
        }
        stops {
          stopTimesForPattern(id: $patternId, startTime: $currentTime) {
            realtime
            realtimeState
            realtimeDeparture
            serviceDay
            scheduledDeparture
          }
          gtfsId
          lat
          lon
          name
          desc
          code
        }
      }
    `,
  },
  graphql`
    query RouteStopListContainerQuery($patternId: String!, $currentTime: Long) {
      pattern(id: $patternId) {
        ...RouteStopListContainer_pattern @arguments(count: $currentTime)
      }
    }
  `,
);

export default RouteStopListContainer;
