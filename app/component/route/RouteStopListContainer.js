import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import RouteStop from './route-stop';
import groupBy from 'lodash/groupBy';
import cx from 'classnames';
import geoUtils from '../../util/geo-utils';
import config from '../../config';

class RouteStopListContainer extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
  };

  constructor(...args) {
    super(...args);
    this.getNearestStopDistance = this.getNearestStopDistance.bind(this);
    this.onRealTimeChange = this.onRealTimeChange.bind(this);
  }

  componentDidMount() {
    this.context.getStore('RealTimeInformationStore').addChangeListener(this.onRealTimeChange);
  }

  componentWillUnmount() {
    this.context.getStore('RealTimeInformationStore').removeChangeListener(this.onRealTimeChange);
  }

  onRealTimeChange() {
    this.forceUpdate();
  }

  getNearestStopDistance(stops) {
    const state = this.context.getStore('PositionStore').getLocationState();

    if (state.hasLocation === true) {
      return geoUtils.getDistanceToNearestStop(state.lat, state.lon, stops);
    }
    return null;
  }

  getStops() {
    const nearest = this.getNearestStopDistance(this.props.pattern.stops);
    const mode = this.props.pattern.route.type.toLowerCase();
    const { vehicles } = this.context.getStore('RealTimeInformationStore');

    const vehicleStops = groupBy(vehicles, vehicle => `HSL:${vehicle.next_stop}`);

    const stopObjs = [];

    this.props.pattern.stops.forEach((stop) => {
      const isNearest = (
        (nearest != null && nearest.distance < config.nearestStopDistance.maxShownDistance) ?
        nearest.stop.gtfsId : void 0) === stop.gtfsId;

      stopObjs.push(
        <RouteStop
          key={stop.gtfsId}
          stop={stop}
          mode={mode}
          vehicles={vehicleStops[stop.gtfsId]}
          distance={isNearest ? nearest.distance : null}
          ref={(stopRow) =>
            (stopRow != null && isNearest ?
              ReactDOM.findDOMNode(stopRow).scrollIntoView(false) : void 0)}
        />);
    });

    return stopObjs;
  }

  render() {
    return (
      <div className={cx('route-stop-list momentum-scroll', this.props.className)}>
        {this.getStops()}
      </div>);
  }
}

RouteStopListContainer.propTypes = {
  pattern: React.PropTypes.object,
  className: React.PropTypes.string,
};

export default Relay.createContainer(RouteStopListContainer, {
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
});
