import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import toClass from 'recompose/toClass';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';
import cx from 'classnames';

import { getDistanceToNearestStop } from '../util/geo-utils';
import config from '../config';
import RouteStop from './RouteStop';

const RouteStopClass = toClass(RouteStop);

class RouteStopListContainer extends React.Component {
  static propTypes = {
    pattern: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    vehicles: React.PropTypes.object,
    position: React.PropTypes.object.isRequired,
    currentTime: React.PropTypes.object.isRequired,
  };

  static contextTypes = {
    breakpoint: React.PropTypes.string,
  }

  componentDidMount() {
    if (this.refs.nearestStop) {
      ReactDOM.findDOMNode(this.refs.nearestStop).scrollIntoView(false);
    }
  }

  componentWillReceiveProps({ relay, currentTime }) {
    relay.setVariables({ currentTime: currentTime.unix() });
  }

  getStops() {
    const position = this.props.position;
    const stops = this.props.pattern.stops;
    const nearest = position.hasLocation === true ?
      getDistanceToNearestStop(position.lat, position.lon, stops) : null;
    const mode = this.props.pattern.route.mode.toLowerCase();

    const vehicles = groupBy(
      values(this.props.vehicles)
        .filter(vehicle => (this.props.currentTime - (vehicle.timestamp * 1000)) < (90 * 1000))
        .filter(vehicle => vehicle.tripStartTime && vehicle.tripStartTime !== 'undefined')
      , vehicle => vehicle.direction);

    const vehicleStops = groupBy(vehicles[this.props.pattern.directionId], vehicle =>
      `HSL:${vehicle.next_stop}`,
    );

    const rowClassName = this.context.breakpoint === 'large' && 'bp-large';

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
          distance={isNearest ? nearest.distance : null}
          ref={isNearest ? 'nearestStop' : null}
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
      position: getStore('PositionStore').getLocationState(),
      currentTime: getStore('TimeStore').getCurrentTime(),
    }),
  ),
  {
    initialVariables: {
      patternId: null,
      currentTime: 0,
    },
    fragments: {
      pattern: () => Relay.QL`
        fragment on Pattern {
          directionId
          route {
            mode
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
  },
);
