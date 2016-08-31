import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import toClass from 'recompose/toClass';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';
import cx from 'classnames';

import { getDistanceToNearestStop } from '../../util/geo-utils';
import config from '../../config';
import RouteStop from './RouteStop';

const RouteStopClass = toClass(RouteStop);

class RouteStopListContainer extends React.Component {
  static propTypes = {
    pattern: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    vehicles: React.PropTypes.object,
    locationState: React.PropTypes.object.isRequired,
    currentTime: React.PropTypes.object.isRequired,
  };

  componentDidMount() {
    if (this.refs.nearestStop) {
      ReactDOM.findDOMNode(this.refs.nearestStop).scrollIntoView(false);
    }
  }

  getStops() {
    const state = this.props.locationState;
    const stops = this.props.pattern.stops;
    const nearest = state.hasLocation === true ?
      getDistanceToNearestStop(state.lat, state.lon, stops) : null;
    const mode = this.props.pattern.route.mode.toLowerCase();

    const vehicles = groupBy(
      values(this.props.vehicles)
        .filter(vehicle => (this.props.currentTime - (vehicle.timestamp * 1000)) < (90 * 1000))
        .filter(vehicle => vehicle.tripStartTime && vehicle.tripStartTime !== 'undefined')
      , vehicle => vehicle.direction);

    const vehicleStops = groupBy(vehicles[this.props.pattern.directionId], vehicle =>
      `HSL:${vehicle.next_stop}`
    );

    const reverse = this.props.pattern.directionId === 0 ? 1 : 0;

    const reverseVehicleStops = groupBy(vehicles[reverse], vehicle =>
      getDistanceToNearestStop(vehicle.lat, vehicle.long, stops).stop.gtfsId
    );

    return stops.map((stop, i) => {
      const isNearest = (
        nearest && nearest.distance < config.nearestStopDistance.maxShownDistance &&
          nearest.stop.gtfsId
      ) === stop.gtfsId;

      return (
        <RouteStopClass
          key={stop.gtfsId}
          stop={stop}
          mode={mode}
          vehicles={vehicleStops[stop.gtfsId]}
          reverseVehicles={reverseVehicleStops[stop.gtfsId]}
          distance={isNearest ? nearest.distance : null}
          ref={isNearest ? 'nearestStop' : null}
          currentTime={this.props.currentTime.unix()}
          last={i === stops.length - 1}
        />
      );
    });
  }

  render() {
    return (
      <div className={cx('route-stop-list momentum-scroll', this.props.className)}>
        {this.getStops()}
      </div>);
  }
}

export default Relay.createContainer(
  connectToStores(
    RouteStopListContainer,
    ['RealTimeInformationStore', 'PositionStore', 'TimeStore'],
    ({ getStore }) => ({
      vehicles: getStore('RealTimeInformationStore').vehicles,
      locationState: getStore('PositionStore').getLocationState(),
      currentTime: getStore('TimeStore').getCurrentTime(),
    })
  ),
  {
    initialVariables: {
      patternId: null,
    },
    fragments: {
      pattern: () => Relay.QL`
        fragment on Pattern {
          directionId
          route {
            mode
          }
          stops {
            stopTimesForPattern(id: $patternId) {
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
  }
);
