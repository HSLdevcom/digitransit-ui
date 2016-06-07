import React from 'react';
import Link from 'react-router/lib/Link';
import IconWithTail from '../icon/icon-with-tail';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import moment from 'moment';
import cx from 'classnames';
import WalkDistance from '../itinerary/walk-distance';
import {
  currentTime as exampleCurrentTime,
  departure as exampleDeparture,
  realtimeDeparture as exampleRealtimeDeparture,
  vehicle as exampleVehicle,
} from '../documentation/ExampleData';

class TripRouteStop extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
  };

  renderTime(realtimeDeparture) {
    const departureTime = this.context
      .getStore('TimeStore')
      .getCurrentTime()
      .startOf('day')
      .second(realtimeDeparture);
    return moment(departureTime).format('HH:mm');
  }

  render() {
    const vehicles = [];

    if (this.props.vehicle) {
      vehicles.push(
        <IconWithTail
          id="now"
          key={this.props.vehicle.id}
          className={cx(this.props.mode, 'large-icon')}
          img={`icon-icon_${this.props.mode}-live`}
        />);
    }

    return (
      <div className={cx('route-stop row', { passed: this.props.stopPassed })}>
        <div className="columns small-3 route-stop-time">
          {this.renderTime(this.props.realtimeDeparture)}
          <div className="route-stop-now-icon">{vehicles}</div>
        </div>
        <Link to={`/pysakit/${this.props.stop.gtfsId}`}>
          <div className={`columns small-7 route-stop-name ${this.props.mode.toLowerCase()}`}>
            {this.props.stop.name}{"\u00a0"}
            {this.props.distance ?
              <WalkDistance
                className="nearest-route-stop"
                icon="icon_location-with-user"
                walkDistance={this.props.distance}
              /> : null}
            <br />
            <span className="route-stop-address">
              {this.props.stop.desc}
            </span>
          </div>
          <div className="columns small-2 route-stop-code">
            {this.props.stop.code}
          </div>
        </Link>
      </div>);
  }
}

TripRouteStop.propTypes = {
  vehicle: React.PropTypes.object,
  mode: React.PropTypes.string,
  stopPassed: React.PropTypes.bool,
  realtimeDeparture: React.PropTypes.number,
  stop: React.PropTypes.object,
  distance: React.PropTypes.number,
};

TripRouteStop.description = (
  <div>
    <p>
      Renders a row intended to for use in a trip route stop list.
      The row contains the information of a single stop along a certain route.
    </p>
    <ComponentUsageExample description="Not realtime, no vehicle info:">
      <TripRouteStop
        key={exampleDeparture.stop.gtfsId}
        stop={exampleDeparture.stop}
        mode={exampleDeparture.pattern.route.type}
        vehicle={null}
        stopPassed
        realtime={exampleDeparture.realtime}
        distance={321}
        realtimeDeparture={null}
        currentTimeFromMidnight={exampleCurrentTime}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="Realtime with vehicle info:">
      <TripRouteStop
        key={exampleRealtimeDeparture.stop.gtfsId}
        stop={exampleRealtimeDeparture.stop}
        mode={exampleRealtimeDeparture.pattern.route.type}
        vehicle={exampleVehicle}
        stopPassed={false}
        realtime={exampleRealtimeDeparture.realtime}
        distance={231}
        realtimeDeparture={exampleRealtimeDeparture.realtimeDeparture}
        currentTimeFromMidnight={exampleCurrentTime}
      />
    </ComponentUsageExample>
  </div>);

export default TripRouteStop;
