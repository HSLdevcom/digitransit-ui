import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import RouteStop from './route-stop';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import cx from 'classnames';
import { getDistanceToNearestStop } from '../../util/geo-utils';
import config from '../../config';

class RouteStopListContainer extends React.Component {
  static propTypes = {
    pattern: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    vehicles: React.PropTypes.object,
    locationState: React.PropTypes.object.isRequired,
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
    const mode = this.props.pattern.route.type.toLowerCase();

    const vehicleStops = groupBy(this.props.vehicles, vehicle => `HSL:${vehicle.next_stop}`);

    return stops.map((stop) => {
      const isNearest = (
        (nearest != null && nearest.distance < config.nearestStopDistance.maxShownDistance) ?
        nearest.stop.gtfsId : void 0) === stop.gtfsId;

      return (
        <RouteStop
          key={stop.gtfsId}
          stop={stop}
          mode={mode}
          vehicles={vehicleStops[stop.gtfsId]}
          distance={isNearest ? nearest.distance : null}
          ref={isNearest ? 'nearestStop' : null}
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
    ['RealTimeInformationStore', 'PositionStore'],
    ({ getStore }) => ({
      vehicles: getStore('RealTimeInformationStore').vehicles,
      locationState: getStore('PositionStore').getLocationState(),
    })
  ),
  {
    fragments: {
      pattern: () => Relay.QL`
        fragment on Pattern {
          route {
            type
          }
          stops {
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
